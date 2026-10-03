import { MapPinOff, WifiOff } from 'lucide-react-native';
import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import Animated, { FadeOut, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';

import type { MapUnavailableReason } from '@/lib/mapbox';
import { colors, radii, shadows, spacing } from '@/theme';

import { Text } from './Text';

const COPY: Record<MapUnavailableReason, { title: string; body: string }> = {
  noToken: {
    title: 'Map unavailable — add your Mapbox token',
    body: 'Set EXPO_PUBLIC_MAPS_API_KEY in .env.local and rebuild. Showing a schematic view.',
  },
  noNative: {
    title: 'Map unavailable in this build',
    body: 'Rebuild with `npx expo run:ios` to enable the map. Showing a schematic view.',
  },
  loadError: {
    title: 'Map couldn’t load',
    body: 'Check your connection. Showing a schematic view meanwhile.',
  },
};

/** Floating explanation card shown over a schematic fallback map. */
export function MapStatusCard({ reason, bottom }: { reason: MapUnavailableReason; bottom: number }) {
  const { title, body } = COPY[reason];
  const Icon = reason === 'loadError' ? WifiOff : MapPinOff;
  return (
    <View
      accessible
      accessibilityLabel={`${title}. ${body}`}
      style={[
        {
          position: 'absolute',
          left: spacing.xl,
          right: spacing.xl,
          bottom,
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing.md,
          padding: spacing.md,
          borderRadius: radii.lg,
          backgroundColor: 'rgba(255,255,255,0.95)',
        },
        shadows.sm,
      ]}
    >
      <Icon size={18} color={colors.text.secondary} />
      <View style={{ flex: 1 }}>
        <Text variant="caption" style={{ fontFamily: 'Inter_600SemiBold' }}>
          {title}
        </Text>
        <Text variant="caption" tone="secondary" style={{ fontSize: 11, lineHeight: 14 }}>
          {body}
        </Text>
      </View>
    </View>
  );
}

/** Soft pulsing veil shown while map tiles load. Fades out when done. */
export function MapLoadingOverlay() {
  const pulse = useSharedValue(0.55);
  useEffect(() => {
    pulse.value = withRepeat(withTiming(0.85, { duration: 800 }), -1, true);
  }, [pulse]);
  const style = useAnimatedStyle(() => ({ opacity: pulse.value }));

  return (
    <Animated.View
      exiting={FadeOut.duration(300)}
      pointerEvents="none"
      accessibilityLabel="Loading map"
      style={[StyleSheet.absoluteFill, { alignItems: 'center', justifyContent: 'center' }]}
    >
      <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: colors.palette.canvas.mid }, style]} />
      <ActivityIndicator color={colors.text.secondary} />
    </Animated.View>
  );
}
