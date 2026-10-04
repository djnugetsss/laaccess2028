/// <reference types="node" />
/**
 * Real Mapbox routes go through the same engine as the demo routes. These tests pin the
 * estimate rules and prove scoring stays deterministic on real values.
 */
import assert from 'node:assert/strict';
import { describe, test } from 'node:test';

import { DESTINATION, MOCK_ROUTES, ORIGIN } from '../mockRoutes.ts';
import {
  buildRealRoute,
  distanceMeters,
  matchesTrip,
  type DirectionsResult,
} from '../realRoutes.ts';
import { computeAccessScore, rankedIds } from '../scoreEngine.ts';
import type { PreferenceKey } from '../types.ts';

// Shapes and values from a real Mapbox response for Granada Hills → Valley Zone.
const DRIVE: DirectionsResult = {
  profile: 'driving',
  durationSec: 1011.5,
  distanceM: 15123.3,
  geometry: [ORIGIN.coordinate, DESTINATION.coordinate],
  summary: 'CA 118 East, I 405 South',
};
const WALK: DirectionsResult = {
  profile: 'walking',
  durationSec: 8087.7,
  distanceM: 11599.7,
  geometry: [ORIGIN.coordinate, DESTINATION.coordinate],
  summary: 'Balboa Boulevard, Valjean Avenue',
};

const demoSet = () => [
  ...MOCK_ROUTES.filter((r) => r.id !== 'fastest'),
  buildRealRoute(DRIVE, { venueTrip: true }),
  buildRealRoute(WALK, { venueTrip: true }),
];

describe('buildRealRoute', () => {
  test('uses the real distance and duration', () => {
    const drive = buildRealRoute(DRIVE);
    assert.equal(drive.durationMinutes, 17);
    assert.equal(drive.source, 'mapbox');
    const walk = buildRealRoute(WALK);
    assert.equal(walk.walkingMiles, 7.2);
    assert.equal(walk.walkingMinutes, 135);
  });

  test('total equals the engine’s displayed score', () => {
    for (const r of [DRIVE, WALK]) {
      const route = buildRealRoute(r);
      assert.equal(computeAccessScore(route), route.totalAccessScore, r.profile);
    }
  });

  test('is deterministic', () => {
    assert.deepEqual(buildRealRoute(DRIVE), buildRealRoute(DRIVE));
  });

  test('never claims accessibility or stair data it does not have', () => {
    for (const r of [DRIVE, WALK]) {
      const route = buildRealRoute(r);
      assert.equal(route.accessible, null);
      assert.equal(route.stairs, -1);
      assert.equal(route.confidenceByCategory.accessibility, 'estimated');
      assert.equal(route.confidenceByCategory.heat, 'estimated');
    }
  });

  test('event flags only on venue trips', () => {
    assert.deepEqual(buildRealRoute(DRIVE).flags, []);
    assert.deepEqual(buildRealRoute(DRIVE, { venueTrip: true }).flags, [
      'eventTraffic',
      'limitedParking',
    ]);
  });
});

describe('ranking on real values', () => {
  const DEMO_DEFAULT: PreferenceKey[] = ['accessibility', 'lessWalking', 'avoidStairs', 'lessHeat'];

  test('demo default still recommends Best Overall', () => {
    assert.equal(rankedIds(demoSet(), DEMO_DEFAULT)[0], 'best-overall');
  });

  test('Faster puts the real driving route first', () => {
    assert.equal(rankedIds(demoSet(), ['faster'])[0], 'driving');
  });

  test('order does not depend on input order', () => {
    const set = demoSet();
    assert.deepEqual(rankedIds(set, DEMO_DEFAULT), rankedIds([...set].reverse(), DEMO_DEFAULT));
  });
});

describe('matchesTrip', () => {
  const place = (c: [number, number]) => ({ name: '', address: '', coordinate: c });

  test('demo endpoints match', () => {
    assert.ok(
      matchesTrip(
        place(ORIGIN.coordinate),
        place(DESTINATION.coordinate),
        ORIGIN.coordinate,
        DESTINATION.coordinate,
      ),
    );
  });

  test('a different Valley start does not', () => {
    const vanNuys: [number, number] = [-118.4487, 34.1847];
    assert.ok(distanceMeters(vanNuys, ORIGIN.coordinate) > 750);
    assert.ok(
      !matchesTrip(
        place(vanNuys),
        place(DESTINATION.coordinate),
        ORIGIN.coordinate,
        DESTINATION.coordinate,
      ),
    );
  });
});
