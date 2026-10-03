import type { LngLat, MappedRoute } from './types';

/**
 * Three illustrative routes for the hero demo: Granada Hills → LA28 Valley Zone.
 *
 * Everything here is MOCK DATA for a student prototype. Coordinates roughly follow real
 * northern San Fernando Valley corridors (Balboa Blvd, Reseda Blvd, the Metro G Line busway,
 * I-405) so the map reads plausibly, but they are not routed and not authoritative.
 * The Valley Zone pin is placed at the Sepulveda Basin for illustration only.
 *
 * No value imports on purpose: this file is loaded directly by Node's test runner.
 * `totalAccessScore` must equal computeAccessScore(route) — asserted in the tests.
 */

export const ORIGIN: { label: string; coordinate: LngLat } = {
  label: 'Granada Hills',
  coordinate: [-118.5016, 34.2658],
};

export const DESTINATION: { label: string; coordinate: LngLat } = {
  label: 'Valley Zone',
  coordinate: [-118.484, 34.177],
};

export const MOCK_ROUTES: MappedRoute[] = [
  {
    id: 'best-overall',
    label: 'Best Overall',
    mode: 'Metro Bus + Venue Shuttle',
    durationMinutes: 52,
    walkingMiles: 0.3,
    walkingMinutes: 7,
    transfers: 1,
    stairs: 0,
    outdoorExposure: 'moderate',
    accessible: true,
    accessibilityScore: 28,
    walkingScore: 15,
    heatScore: 13,
    transitScore: 12,
    reliabilityScore: 13,
    totalAccessScore: 81,
    dataConfidence: 'high',
    confidenceByCategory: { accessibility: 'official', heat: 'estimated', transit: 'official' },
    whyThisRoute: [
      'Low-floor buses with ramps on both legs',
      'One transfer at a staffed station with elevator access',
      'Shuttle drops off beside the accessible venue gate',
    ],
    flags: [],
    estimatedCostUsd: 1.75,
    geometry: [
      [-118.5016, 34.2658],
      [-118.5016, 34.25],
      [-118.5015, 34.235],
      [-118.5014, 34.221],
      [-118.5013, 34.2045],
      [-118.5014, 34.1866],
      [-118.495, 34.1852],
      [-118.4885, 34.1815],
      [-118.484, 34.177],
    ],
  },
  {
    id: 'fastest',
    label: 'Fastest',
    mode: 'Driving + Walk',
    durationMinutes: 39,
    walkingMiles: 0.6,
    walkingMinutes: 14,
    transfers: 0,
    stairs: -1,
    outdoorExposure: 'high',
    accessible: null,
    accessibilityScore: 12,
    walkingScore: 12,
    heatScore: 7,
    transitScore: 8,
    reliabilityScore: 7,
    totalAccessScore: 46,
    dataConfidence: 'low',
    confidenceByCategory: { accessibility: 'estimated', heat: 'estimated', transit: 'open' },
    whyThisRoute: [
      'Shortest door-to-door time when traffic is normal',
      'No transfers',
      'Event-day traffic and parking can add significant delay',
    ],
    flags: ['eventTraffic', 'limitedParking'],
    estimatedCostUsd: 30,
    geometry: [
      [-118.5016, 34.2658],
      [-118.4985, 34.2712],
      [-118.49, 34.2745],
      [-118.4795, 34.2748],
      [-118.4722, 34.2702],
      [-118.4705, 34.25],
      [-118.4712, 34.225],
      [-118.4692, 34.2],
      [-118.4698, 34.1835],
      [-118.4745, 34.1755],
      [-118.4805, 34.1758],
      [-118.484, 34.177],
    ],
  },
  {
    id: 'lowest-walking',
    label: 'Lowest Walking',
    mode: 'Bus + Metro G Line + Shuttle',
    durationMinutes: 58,
    walkingMiles: 0.1,
    walkingMinutes: 2,
    transfers: 2,
    stairs: 0,
    outdoorExposure: 'moderate',
    accessible: true,
    accessibilityScore: 27,
    walkingScore: 19,
    heatScore: 11,
    transitScore: 9,
    reliabilityScore: 10,
    totalAccessScore: 76,
    dataConfidence: 'medium',
    confidenceByCategory: { accessibility: 'official', heat: 'estimated', transit: 'open' },
    whyThisRoute: [
      'Under 600 ft of walking end to end',
      'Level boarding on the G Line busway',
      'Two transfers mean more time waiting at outdoor stops',
    ],
    flags: [],
    estimatedCostUsd: 1.75,
    geometry: [
      [-118.5016, 34.2658],
      [-118.5185, 34.2658],
      [-118.536, 34.2658],
      [-118.536, 34.24],
      [-118.5358, 34.21],
      [-118.5356, 34.187],
      [-118.5355, 34.181],
      [-118.518, 34.1832],
      [-118.5014, 34.1866],
      [-118.4935, 34.1825],
      [-118.484, 34.177],
    ],
  },
];

export function getMockRoute(id: string | undefined): MappedRoute | undefined {
  return MOCK_ROUTES.find((r) => r.id === id);
}
