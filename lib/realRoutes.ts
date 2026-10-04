import type { LngLat, MappedRoute, OutdoorExposure, Place } from './types';

/**
 * Turns a real Mapbox Directions result into a scorable route.
 *
 * What's REAL here: geometry, distance and duration (from Mapbox). What's ESTIMATED: the
 * accessibility, heat and reliability sub-scores — we have no live feeds for those yet, so
 * they come from simple, fixed rules below and are tagged "Estimated" everywhere in the UI.
 *
 * No value imports on purpose: this file is loaded directly by Node's test runner.
 * Sub-scores stay within the engine's caps (30/20/20/15/15), so `totalAccessScore` equals
 * computeAccessScore(route) — asserted in the tests.
 */

export type TravelProfile = 'driving' | 'walking';

export type DirectionsResult = {
  profile: TravelProfile;
  /** Seconds. */
  durationSec: number;
  /** Meters. */
  distanceM: number;
  geometry: LngLat[];
  /** Mapbox's short road summary, e.g. "CA 118 East, I 405 South". */
  summary: string;
};

const METERS_PER_MILE = 1609.344;
const round1 = (n: number) => Math.round(n * 10) / 10;
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

// ───────────────────────────── estimate rules ─────────────────────────────

/** Unknown accessibility gets 40% of the 30-point cap — never full marks for missing data. */
const UNKNOWN_ACCESSIBILITY = 12;

/** 20 points at 0 mi, falling to 0 at 1.5 mi of walking. */
export const walkingScoreFor = (miles: number) => Math.round(20 * clamp(1 - miles / 1.5, 0, 1));

/** 20 points with no time outdoors, falling to 0 at 40 outdoor minutes. Estimate. */
export const heatScoreFor = (outdoorMinutes: number) =>
  Math.round(20 * clamp(1 - outdoorMinutes / 40, 0, 1));

export const exposureFor = (outdoorMinutes: number): OutdoorExposure =>
  outdoorMinutes <= 10 ? 'low' : outdoorMinutes <= 30 ? 'moderate' : 'high';

/**
 * Fixed baselines for routes with no transit. Kept low so the "Transit" preference never
 * favors a car or a walk. Reliability: walking times are very predictable; driving varies.
 */
const BASELINE = {
  driving: { transit: 8, reliability: 8 },
  walking: { transit: 5, reliability: 14 },
} as const;

// ───────────────────────────── builder ─────────────────────────────

/** Build a scored route from real directions. Deterministic: same input → same route. */
export function buildRealRoute(
  r: DirectionsResult,
  opts: { venueTrip?: boolean } = {},
): MappedRoute {
  const miles = round1(r.distanceM / METERS_PER_MILE);
  const minutes = Math.max(1, Math.round(r.durationSec / 60));
  const driving = r.profile === 'driving';

  // Real walking leg: the whole route when walking; none in the Mapbox driving result.
  const walkingMiles = driving ? 0 : miles;
  const walkingMinutes = driving ? 0 : minutes;
  const outdoorMinutes = walkingMinutes;

  const accessibilityScore = UNKNOWN_ACCESSIBILITY;
  const walkingScore = walkingScoreFor(walkingMiles);
  const heatScore = heatScoreFor(outdoorMinutes);
  const { transit: transitScore, reliability: reliabilityScore } = BASELINE[r.profile];

  const via = r.summary ? ` · via ${r.summary}` : '';

  return {
    id: r.profile,
    label: driving ? 'Driving' : 'Walking',
    mode: driving ? `Car${via}` : `On foot${via}`,
    durationMinutes: minutes,
    walkingMiles,
    walkingMinutes,
    transfers: 0,
    stairs: -1,
    outdoorExposure: exposureFor(outdoorMinutes),
    accessible: null,
    accessibilityScore,
    walkingScore,
    heatScore,
    transitScore,
    reliabilityScore,
    totalAccessScore:
      accessibilityScore + walkingScore + heatScore + transitScore + reliabilityScore,
    dataConfidence: 'medium',
    confidenceByCategory: { accessibility: 'estimated', heat: 'estimated', transit: 'open' },
    whyThisRoute: driving
      ? [
          `${miles} mi drive, about ${minutes} min with current traffic`,
          'No transfers',
          'Walking from parking can add time and isn’t included here',
          'Parking and drop-off accessibility information unavailable',
        ]
      : [
          `${miles} mi on foot, about ${minutes} min`,
          'No transfers',
          'Sidewalk, curb-ramp, and slope information unavailable',
          ...(outdoorMinutes > 30 ? ['Long time outdoors can add heat exposure'] : []),
        ],
    flags: driving && opts.venueTrip ? ['eventTraffic', 'limitedParking'] : [],
    estimatedCostUsd: driving ? null : 0,
    geometry: r.geometry,
    source: 'mapbox',
  };
}

// ───────────────────────────── geography ─────────────────────────────

/** Great-circle distance in meters. */
export function distanceMeters(a: LngLat, b: LngLat): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b[1] - a[1]);
  const dLng = toRad(b[0] - a[0]);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a[1])) * Math.cos(toRad(b[1])) * Math.sin(dLng / 2) ** 2;
  return 2 * 6371000 * Math.asin(Math.sqrt(h));
}

/**
 * True when both ends match the demo trip closely enough that the demo transit geometry
 * still starts and ends at the markers.
 */
export function matchesTrip(from: Place, to: Place, demoFrom: LngLat, demoTo: LngLat): boolean {
  return (
    distanceMeters(from.coordinate, demoFrom) <= 750 && distanceMeters(to.coordinate, demoTo) <= 500
  );
}
