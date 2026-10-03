import type { LngLat } from './types';

/**
 * Venue zones for the LA28 screen.
 *
 * ILLUSTRATIVE ONLY. Names follow the general areas in publicly announced LA28 venue plans,
 * which can change. Pin locations are approximate and not venue addresses. We have no
 * official LA28 data feed, so nothing here is presented as official information.
 */
export type VenueZone = {
  id: string;
  name: string;
  area: string;
  coordinate: LngLat;
  /** The zone the demo trip goes to. */
  highlighted?: boolean;
};

export const VENUE_ZONES: VenueZone[] = [
  { id: 'valley', name: 'Valley Zone', area: 'San Fernando Valley · Sepulveda Basin area', coordinate: [-118.484, 34.177], highlighted: true },
  { id: 'downtown', name: 'Downtown LA', area: 'Central Los Angeles', coordinate: [-118.267, 34.043] },
  { id: 'expo-park', name: 'Exposition Park', area: 'South Los Angeles', coordinate: [-118.288, 34.014] },
  { id: 'inglewood', name: 'Inglewood', area: 'South Bay', coordinate: [-118.339, 33.953] },
  { id: 'pasadena', name: 'Pasadena', area: 'San Gabriel Valley', coordinate: [-118.168, 34.161] },
  { id: 'carson', name: 'Carson', area: 'South Bay', coordinate: [-118.261, 33.864] },
  { id: 'long-beach', name: 'Long Beach', area: 'Coastal LA County', coordinate: [-118.19, 33.765] },
];

/** Typical late-summer afternoon high in the inland Valley, °F. Rough climate estimate, not a forecast. */
export const VALLEY_TYPICAL_SUMMER_HIGH_F = 95;
