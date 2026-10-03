import { LinearGradient } from 'expo-linear-gradient';
import type { LucideIcon } from 'lucide-react-native';
import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';

import { colors, radii, spacing } from '@/theme';

import { Text } from './Text';

type Props = {
  label: string;
  value: number;
  max: number;
  Icon?: LucideIcon;
  /** Stagger offset in ms, so a stack of bars fills in sequence. */
  delay?: number;
};

const HEIGHT = 8;

/** Labeled points-of-max bar that fills smoothly on mount. One consistent blue for every bar. */
export function ScoreBar({ label, value, max, Icon, delay = 0 }: Props) {
  const ratio = max > 0 ? Math.min(1, Math.max(0, value / max)) : 0;
  const trackWidth = useSharedValue(0);
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withDelay(delay, withTiming(ratio, { duration: 900, easing: Easing.out(Easing.cubic) }));
  }, [ratio, delay, progress]);

  const fillStyle = useAnimatedStyle(() => ({
    width: Math.max(HEIGHT * progress.value, trackWidth.value * progress.value),
  }));

  return (
    <View
      accessible
      accessibilityLabel={`${label}: ${value} of ${max} points`}
      style={{ gap: spacing.sm }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
        {Icon && <Icon size={16} color={colors.accent.blue.text} strokeWidth={2.2} />}
        <Text variant="callout" style={{ flex: 1, fontFamily: 'Inter_500Medium' }}>
          {label}
        </Text>
        <Text variant="callout" style={{ fontFamily: 'Inter_600SemiBold', fontVariant: ['tabular-nums'] }}>
          {value}
          <Text variant="callout" tone="tertiary" style={{ fontVariant: ['tabular-nums'] }}>
            /{max}
          </Text>
        </Text>
      </View>
      <View
        onLayout={(e) => {
          trackWidth.value = e.nativeEvent.layout.width;
        }}
        style={{
          height: HEIGHT,
          borderRadius: radii.full,
          backgroundColor: colors.palette.navy[50],
          overflow: 'hidden',
        }}
      >
        <Animated.View style={[{ height: HEIGHT, borderRadius: radii.full, overflow: 'hidden' }, fillStyle]}>
          <LinearGradient
            colors={[colors.palette.blue[300], colors.palette.blue[600]]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{ flex: 1 }}
          />
        </Animated.View>
      </View>
    </View>
  );
}
