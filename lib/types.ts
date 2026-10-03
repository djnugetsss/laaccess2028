/** How much we trust a route's data overall. */
export type DataConfidence = 'high' | 'medium' | 'low';

/** Where a piece of data comes from. */
export type TrustLevel = 'official' | 'open' | 'estimated';

export type PreferenceKey =
  | 'accessibility'
  | 'lessWalking'
  | 'avoidStairs'
  | 'lessHeat'
  | 'preferShade'
  | 'transit'
  | 'driving'
  | 'fewerTransfers'
  | 'faster'
  | 'lowerCost';

export type OutdoorExposure = 'low' | 'moderate' | 'high';

export type RouteOption = {
  id: string;
  label: string; // "Best Overall" etc.
  mode: string; // "Transit + Shuttle"
  durationMinutes: number;
  walkingMiles: number;
  walkingMinutes: number;
  transfers: number;
  stairs: number; // known stair count; -1 = unknown
  outdoorExposure: OutdoorExposure | null; // null = data unavailable
  accessible: boolean | null; // null = unavailable
  // score sub-components (0..max):
  accessibilityScore: number; // /30
  walkingScore: number; // /20
  heatScore: number; // /20
  transitScore: number; // /15
  reliabilityScore: number; // /15
  totalAccessScore: number; // /100 (computed later)
  dataConfidence: DataConfidence;
  confidenceByCategory: { accessibility: TrustLevel; heat: TrustLevel; transit: TrustLevel };
  whyThisRoute: string[]; // bullet reasons
};

export type PreferenceOption = {
  key: PreferenceKey;
  emoji: string;
  label: string;
  description: string;
};

/** [longitude, latitude] — GeoJSON / Mapbox order. */
export type LngLat = [number, number];

/** Known risks surfaced on a route. */
export type RouteFlag = 'eventTraffic' | 'limitedParking';

/** A RouteOption plus the extra data the map and ranking need. */
export type MappedRoute = RouteOption & {
  /** Illustrative line geometry for drawing. Not turn-by-turn accurate. */
  geometry: LngLat[];
  flags: RouteFlag[];
  /** Typical one-way out-of-pocket cost; null = unknown. */
  estimatedCostUsd: number | null;
};
