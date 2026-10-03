import type { ConfigContext, ExpoConfig } from 'expo/config';

// Extends app.json. Secrets come from the environment (.env.local / EAS env), never from source.
export default ({ config }: ConfigContext): ExpoConfig => ({
  ...(config as ExpoConfig),
  extra: {
    ...config.extra,
    mapsApiKey: process.env.EXPO_PUBLIC_MAPS_API_KEY ?? '',
  },
});
