import { NativeModules } from 'react-native';

import { env, hasMapsKey } from './env';

export type MapboxModule = typeof import('@rnmapbox/maps');

/**
 * Mapbox, loaded only when a token exists and the native module is linked.
 * Never throws: missing token / Expo Go / stale build → null → callers show a fallback.
 */
export const mapbox: MapboxModule | null = (() => {
  if (!hasMapsKey) return null;
  if (!NativeModules.RNMBXModule) {
    console.warn('[mapbox] Native module missing — rebuild with `npx expo run:ios`.');
    return null;
  }
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const mod = require('@rnmapbox/maps') as MapboxModule;
    mod.default.setAccessToken(env.mapsApiKey);
    mod.default.setTelemetryEnabled(false);
    return mod;
  } catch (e) {
    console.warn('[mapbox] Unavailable, using fallback:', e);
    return null;
  }
})();

export const isMapAvailable = mapbox !== null;

export type MapUnavailableReason = 'noToken' | 'noNative' | 'loadError';

export const mapUnavailableReason: MapUnavailableReason | null = mapbox
  ? null
  : hasMapsKey
    ? 'noNative'
    : 'noToken';
