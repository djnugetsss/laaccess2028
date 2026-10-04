import '../global.css';

import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from '@expo-google-fonts/inter';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { RouteSetProvider } from '@/lib/routes';
import { SettingsProvider } from '@/lib/settings';
import { TripProvider } from '@/lib/trip';
import { colors } from '@/theme';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    if (loaded || error) SplashScreen.hideAsync();
  }, [loaded, error]);

  if (!loaded && !error) return null;

  return (
    <SafeAreaProvider>
      <SettingsProvider>
        <TripProvider>
          <RouteSetProvider>
            <StatusBar style="dark" />
            <Stack
              screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: colors.background.surface },
                gestureEnabled: true,
              }}
            >
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="route-setup" />
              <Stack.Screen name="results" />
              <Stack.Screen name="route-details" />
              <Stack.Screen name="accessibility" />
              <Stack.Screen name="design-system" />
            </Stack>
          </RouteSetProvider>
        </TripProvider>
      </SettingsProvider>
    </SafeAreaProvider>
  );
}
