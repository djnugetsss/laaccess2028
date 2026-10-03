import type { PreferenceKey, RouteOption } from './types';

/**
 * ACCESS SCORE engine — deterministic, pure, no randomness, no network, no LLM.
 *
 * Two separate outputs, on purpose:
 *
 * 1. `computeAccessScore(route)` — the DISPLAYED score (0–100). A plain sum of five capped
 *    sub-scores. It never changes with preferences, so a route's number is stable and
 *    comparable. It is a route-comparison score built from available data — not a safety
 *    rating and not validated by any authority.
 *
 * 2. `rankRoutes(routes, preferences)` — the ORDER. A weighted average of normalized
 *    "dimensions" (0..1 each). With no preferences the weights equal the score caps, so the
 *    ranking matches the displayed score. Each selected preference adds weight to the
 *    dimensions it cares about, which can (and should) change which route comes first.
 *
 * No value imports: this file is loaded directly by Node's test runner.
 */

/** Max points per displayed sub-score. Sums to 100. */
export const SCORE_MAX = {
  accessibility: 30,
  walking: 20,
  heat: 20,
  transit: 15,
  reliability: 15,
} as const;

/** Anything the engine can rank. Optional cost enables the "Lower Cost" preference. */
export type RankableRoute = RouteOption & { estimatedCostUsd?: number | null };

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

// ───────────────────────────── displayed score ─────────────────────────────

/** Displayed ACCESS SCORE: sum of the five sub-scores, each clamped to its cap. Integer 0–100. */
export function computeAccessScore(route: RouteOption): number {
  return Math.round(
    clamp(route.accessibilityScore, 0, SCORE_MAX.accessibility) +
      clamp(route.walkingScore, 0, SCORE_MAX.walking) +
      clamp(route.heatScore, 0, SCORE_MAX.heat) +
      clamp(route.transitScore, 0, SCORE_MAX.transit) +
      clamp(route.reliabilityScore, 0, SCORE_MAX.reliability),
  );
}

// ───────────────────────────── ranking dimensions ─────────────────────────────

/**
 * Every ranking signal, normalized to 0..1 where 1 is best.
 * The first five mirror the displayed sub-scores; the rest only matter when a preference
 * turns them on.
 */
export type Dimension =
  | 'accessibility'
  | 'walking'
  | 'heat'
  | 'transit'
  | 'reliability'
  | 'stepFree' // accessible: true 1 · unknown 0.35 · false 0
  | 'stairFree' // 0 known stairs 1 · unknown 0.4 (cautious) · n stairs → decays to 0 by 24
  | 'shade' // outdoor exposure: low 1 · moderate 0.5 · high 0 · unknown 0.4 (cautious)
  | 'speed' // relative: fastest in the set 1 → slowest 0
  | 'cost' // relative: cheapest 1 → priciest 0 · unknown 0.5
  | 'fewTransfers' // 0 → 1 · 3+ → 0
  | 'driving'; // 1 if the route is car-based

type Weights = Record<Dimension, number>;

/** With no preferences, weights equal the score caps → ranking == displayed score order. */
export const BASE_WEIGHTS: Weights = {
  accessibility: SCORE_MAX.accessibility,
  walking: SCORE_MAX.walking,
  heat: SCORE_MAX.heat,
  transit: SCORE_MAX.transit,
  reliability: SCORE_MAX.reliability,
  stepFree: 0,
  stairFree: 0,
  shade: 0,
  speed: 0,
  cost: 0,
  fewTransfers: 0,
  driving: 0,
};

/**
 * Extra weight each preference adds. Sized so one strong preference can overturn a
 * moderate base-score gap, but several preferences combine rather than any single one
 * dominating.
 */
export const PREFERENCE_BOOSTS: Record<PreferenceKey, Partial<Weights>> = {
  accessibility: { accessibility: 30, stepFree: 30 }, // also requires step-free to rank well
  lessWalking: { walking: 40 },
  avoidStairs: { stairFree: 40 }, // penalizes known stairs, treats unknown cautiously
  lessHeat: { heat: 40 },
  preferShade: { heat: 15, shade: 25 },
  transit: { transit: 40 },
  faster: { speed: 60 },
  lowerCost: { cost: 40 },
  driving: { driving: 40 },
  fewerTransfers: { fewTransfers: 30 },
};

/** Which dimension best represents each preference — used for "Best for …" highlights. */
const PRIMARY_DIMENSION: Record<PreferenceKey, Dimension> = {
  accessibility: 'stepFree',
  lessWalking: 'walking',
  avoidStairs: 'stairFree',
  lessHeat: 'heat',
  preferShade: 'shade',
  transit: 'transit',
  faster: 'speed',
  lowerCost: 'cost',
  driving: 'driving',
  fewerTransfers: 'fewTransfers',
};

/** Relative 0..1 position of `v` between `best` and `worst` (handles equal ranges). */
function relative(v: number, best: number, worst: number): number {
  if (best === worst) return 1;
  return clamp((worst - v) / (worst - best), 0, 1);
}

const isCarBased = (route: RouteOption) => /driv|car|rideshare|taxi/i.test(route.mode);

/** Normalized dimension values for one route, relative to the set where needed. */
export function routeDimensions(route: RankableRoute, all: readonly RankableRoute[]): Record<Dimension, number> {
  const durations = all.map((r) => r.durationMinutes);
  const costs = all.map((r) => r.estimatedCostUsd).filter((c): c is number => c != null);

  return {
    accessibility: clamp(route.accessibilityScore / SCORE_MAX.accessibility, 0, 1),
    walking: clamp(route.walkingScore / SCORE_MAX.walking, 0, 1),
    heat: clamp(route.heatScore / SCORE_MAX.heat, 0, 1),
    transit: clamp(route.transitScore / SCORE_MAX.transit, 0, 1),
    reliability: clamp(route.reliabilityScore / SCORE_MAX.reliability, 0, 1),
    stepFree: route.accessible === true ? 1 : route.accessible === null ? 0.35 : 0,
    stairFree: route.stairs === 0 ? 1 : route.stairs < 0 ? 0.4 : clamp(0.6 - route.stairs / 40, 0, 0.6),
    shade: route.outdoorExposure === null ? 0.4 : { low: 1, moderate: 0.5, high: 0 }[route.outdoorExposure],
    speed: relative(route.durationMinutes, Math.min(...durations), Math.max(...durations)),
    cost:
      route.estimatedCostUsd == null || costs.length === 0
        ? 0.5
        : relative(route.estimatedCostUsd, Math.min(...costs), Math.max(...costs)),
    fewTransfers: clamp(1 - route.transfers / 3, 0, 1),
    driving: isCarBased(route) ? 1 : 0,
  };
}

/** Combined weights for a preference set. Order-independent; duplicates count once. */
export function weightsFor(preferences: readonly PreferenceKey[]): Weights {
  const w = { ...BASE_WEIGHTS };
  for (const key of new Set(preferences)) {
    for (const [dim, boost] of Object.entries(PREFERENCE_BOOSTS[key]) as [Dimension, number][]) {
      w[dim] += boost;
    }
  }
  return w;
}

// ───────────────────────────── ranking ─────────────────────────────

export type RankedRoute<R extends RankableRoute = RankableRoute> = {
  route: R;
  /** 1-based position. */
  rank: number;
  /** Displayed ACCESS SCORE — stable, preference-independent. */
  accessScore: number;
  /** Preference-weighted match, 0–100, used only for ordering. Not shown as a score. */
  matchScore: number;
  /** Selected preferences on which this route is best (or tied-best) in the set. */
  bestFor: PreferenceKey[];
};

/**
 * Rank routes for a preference set. Pure and deterministic:
 * same input → same output, regardless of input order.
 * Ties break by displayed score, then shorter duration, then id.
 */
export function rankRoutes<R extends RankableRoute>(
  routes: readonly R[],
  preferences: readonly PreferenceKey[],
): RankedRoute<R>[] {
  if (routes.length === 0) return [];

  const weights = weightsFor(preferences);
  const totalWeight = Object.values(weights).reduce((a, b) => a + b, 0);
  const dims = routes.map((r) => routeDimensions(r, routes));
  // Canonical order so output never depends on the order preferences were tapped.
  const uniquePrefs = (Object.keys(PREFERENCE_BOOSTS) as PreferenceKey[]).filter((p) => preferences.includes(p));

  const scored = routes.map((route, i) => {
    const d = dims[i];
    const weighted = (Object.keys(weights) as Dimension[]).reduce((sum, k) => sum + weights[k] * d[k], 0);
    const bestFor = uniquePrefs.filter((p) => {
      const dim = PRIMARY_DIMENSION[p];
      return d[dim] > 0 && dims.every((other) => d[dim] >= other[dim]);
    });
    return {
      route,
      accessScore: computeAccessScore(route),
      matchScore: Math.round((weighted / totalWeight) * 1000) / 10,
      bestFor,
    };
  });

  scored.sort(
    (a, b) =>
      b.matchScore - a.matchScore ||
      b.accessScore - a.accessScore ||
      a.route.durationMinutes - b.route.durationMinutes ||
      a.route.id.localeCompare(b.route.id),
  );

  return scored.map((s, i) => ({ ...s, rank: i + 1 }));
}

/** Convenience: ids in ranked order. */
export function rankedIds(routes: readonly RankableRoute[], preferences: readonly PreferenceKey[]): string[] {
  return rankRoutes(routes, preferences).map((r) => r.route.id);
}
