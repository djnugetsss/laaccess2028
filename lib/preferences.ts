import type { PreferenceKey, PreferenceOption } from './types';

/** Every preference the app understands, in display order. */
export const PREFERENCE_OPTIONS: readonly PreferenceOption[] = [
  { key: 'accessibility', emoji: '♿', label: 'Accessibility', description: 'Elevators, ramps, level boarding' },
  { key: 'lessWalking', emoji: '🚶', label: 'Less Walking', description: 'Shortest distance on foot' },
  { key: 'avoidStairs', emoji: '🪜', label: 'Avoid Stairs', description: 'Skip routes with known stairs' },
  { key: 'lessHeat', emoji: '🌡️', label: 'Less Heat', description: 'Minimize time in the sun' },
  { key: 'preferShade', emoji: '🌳', label: 'Prefer Shade', description: 'Tree cover and covered stops' },
  { key: 'transit', emoji: '🚇', label: 'Transit', description: 'Rail, bus, and shuttles' },
  { key: 'faster', emoji: '⏱️', label: 'Faster', description: 'Shortest total trip time' },
  { key: 'lowerCost', emoji: '💰', label: 'Lower Cost', description: 'Cheapest way to get there' },
  { key: 'driving', emoji: '🚗', label: 'Driving', description: 'Car, rideshare, drop-off' },
  { key: 'fewerTransfers', emoji: '🔄', label: 'Fewer Transfers', description: 'Fewer changes along the way' },
] as const;

export const PREFERENCE_BY_KEY = Object.fromEntries(
  PREFERENCE_OPTIONS.map((o) => [o.key, o]),
) as Record<PreferenceKey, PreferenceOption>;

/** The subset offered on Route Setup and the Results preference bar. */
export const ROUTE_PREFERENCE_KEYS: readonly PreferenceKey[] = [
  'accessibility',
  'lessWalking',
  'avoidStairs',
  'lessHeat',
  'preferShade',
  'transit',
  'faster',
  'lowerCost',
];

/** Demo default: the accessibility-first hero path. */
export const DEFAULT_PREFERENCES: readonly PreferenceKey[] = [
  'accessibility',
  'lessWalking',
  'avoidStairs',
  'lessHeat',
];
