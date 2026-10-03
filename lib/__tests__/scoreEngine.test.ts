/// <reference types="node" />
/**
 * Run: npm test   (Node's built-in test runner with native TypeScript type-stripping)
 *
 * Proves the engine is deterministic and that preferences change which route ranks #1.
 */
import assert from 'node:assert/strict';
import { describe, test } from 'node:test';

import { MOCK_ROUTES } from '../mockRoutes.ts';
import { computeAccessScore, rankedIds, rankRoutes } from '../scoreEngine.ts';
import type { PreferenceKey } from '../types.ts';

const DEMO_DEFAULT: PreferenceKey[] = ['accessibility', 'lessWalking', 'avoidStairs', 'lessHeat'];
const top = (prefs: PreferenceKey[]) => rankedIds(MOCK_ROUTES, prefs)[0];

describe('computeAccessScore', () => {
  test('mock totals match the engine', () => {
    for (const r of MOCK_ROUTES) assert.equal(computeAccessScore(r), r.totalAccessScore, r.id);
  });

  test('clamps each sub-score to its cap', () => {
    const r = { ...MOCK_ROUTES[0], accessibilityScore: 99, walkingScore: -5 };
    assert.equal(computeAccessScore(r), 30 + 0 + r.heatScore + r.transitScore + r.reliabilityScore);
  });

  test('displayed score does not depend on preferences', () => {
    const a = rankRoutes(MOCK_ROUTES, []).map((r) => [r.route.id, r.accessScore]).sort();
    const b = rankRoutes(MOCK_ROUTES, ['faster']).map((r) => [r.route.id, r.accessScore]).sort();
    assert.deepEqual(a, b);
  });
});

describe('rankRoutes — preferences change the #1 route', () => {
  test('no preferences → ordered by displayed ACCESS SCORE', () => {
    assert.deepEqual(rankedIds(MOCK_ROUTES, []), ['best-overall', 'lowest-walking', 'fastest']);
  });

  test('demo default (Accessibility, Less Walking, Avoid Stairs, Less Heat) → Best Overall', () => {
    assert.equal(top(DEMO_DEFAULT), 'best-overall');
  });

  test('turning OFF Less Heat → Lowest Walking takes #1', () => {
    assert.equal(top(['accessibility', 'lessWalking', 'avoidStairs']), 'lowest-walking');
  });

  test('Less Walking alone → Lowest Walking', () => {
    assert.equal(top(['lessWalking']), 'lowest-walking');
  });

  test('Faster alone → Fastest', () => {
    assert.equal(top(['faster']), 'fastest');
  });

  test('Faster does not beat accessibility needs', () => {
    assert.notEqual(top(['accessibility', 'faster']), 'fastest');
  });

  test('Avoid Stairs: no known stairs > unknown (cautious) > many known stairs', () => {
    const base = MOCK_ROUTES[0];
    const variants = [
      { ...base, id: 'many-stairs', stairs: 24 },
      { ...base, id: 'unknown-stairs', stairs: -1 },
      { ...base, id: 'no-stairs', stairs: 0 },
    ];
    assert.deepEqual(rankedIds(variants, ['avoidStairs']), ['no-stairs', 'unknown-stairs', 'many-stairs']);
  });

  test('Driving → Fastest (the only car-based route)', () => {
    assert.equal(top(['driving']), 'fastest');
  });
});

describe('determinism', () => {
  test('same output regardless of input order or preference order', () => {
    const shuffled = [MOCK_ROUTES[2], MOCK_ROUTES[0], MOCK_ROUTES[1]];
    const reversedPrefs = [...DEMO_DEFAULT].reverse();
    assert.deepEqual(rankRoutes(shuffled, reversedPrefs), rankRoutes(MOCK_ROUTES, DEMO_DEFAULT));
  });

  test('repeated calls are identical', () => {
    assert.deepEqual(rankRoutes(MOCK_ROUTES, ['lessHeat']), rankRoutes(MOCK_ROUTES, ['lessHeat']));
  });

  test('duplicate preferences count once', () => {
    assert.deepEqual(rankedIds(MOCK_ROUTES, ['faster', 'faster']), rankedIds(MOCK_ROUTES, ['faster']));
  });

  test('bestFor highlights the leader per preference', () => {
    const ranked = rankRoutes(MOCK_ROUTES, ['lessWalking', 'faster']);
    const byId = Object.fromEntries(ranked.map((r) => [r.route.id, r.bestFor]));
    assert.deepEqual(byId['lowest-walking'], ['lessWalking']);
    assert.deepEqual(byId['fastest'], ['faster']);
  });
});

describe('unknown data is treated cautiously, never as best', () => {
  test('Prefer Shade: low > unknown exposure > high', () => {
    const base = MOCK_ROUTES[0];
    const variants = [
      { ...base, id: 'high', outdoorExposure: 'high' as const },
      { ...base, id: 'unknown', outdoorExposure: null },
      { ...base, id: 'low', outdoorExposure: 'low' as const },
    ];
    assert.deepEqual(rankedIds(variants, ['preferShade']), ['low', 'unknown', 'high']);
  });

  test('Accessibility: step-free > unknown > not step-free', () => {
    const base = MOCK_ROUTES[0];
    const variants = [
      { ...base, id: 'no', accessible: false },
      { ...base, id: 'unknown', accessible: null },
      { ...base, id: 'yes', accessible: true },
    ];
    assert.deepEqual(rankedIds(variants, ['accessibility']), ['yes', 'unknown', 'no']);
  });
});
