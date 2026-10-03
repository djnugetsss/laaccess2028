import Constants from 'expo-constants';

/**
 * Runtime config. EXPO_PUBLIC_* values are inlined at build time; app.config.ts also mirrors
 * them into `extra` as a fallback. Never hard-code keys here.
 */
const extra = (Constants.expoConfig?.extra ?? {}) as { mapsApiKey?: string };

export const env = {
  mapsApiKey: process.env.EXPO_PUBLIC_MAPS_API_KEY || extra.mapsApiKey || '',
} as const;

export const hasMapsKey = env.mapsApiKey.length > 0;
