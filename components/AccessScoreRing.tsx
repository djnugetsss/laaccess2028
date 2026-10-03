import { useEffect, useId } from 'react';
import { View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedProps,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, Defs, G, LinearGradient, Stop } from 'react-native-svg';

import { clampScore, scoreBand } from '@/lib/score';
import { colors, fonts } from '@/theme';

import { Text } from './Text';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

/** Words for each color band, so meaning never depends on color alone. */
export const BAND_LABEL = { high: 'high', medium: 'moderate', low: 'low' } as const;

type Props = {
  /** 0–100 */
  score: number;
  /** Outer diameter in points. */
  size?: number;
  /** Override the auto-derived stroke width. */
  strokeWidth?: number;
  /** Show the "ACCESS SCORE" caption under the number (auto-hidden below 120pt). */
  showLabel?: boolean;
  /** Animate the arc filling in on mount / score change. */
  animated?: boolean;
};

/**
 * Signature ACCESS SCORE visual: a gradient progress ring whose color tracks the score band
 * (high → green, medium → amber, low → coral) with the number set large in the center.
 */
export function AccessScoreRing({
  score,
  size = 160,
  strokeWidth,
  showLabel = true,
  animated = true,
}: Props) {
  const value = clampScore(score);
  const band = scoreBand(value);
  const signal = colors.signal[band];
  const gradientId = `ring-${useId().replace(/:/g, '')}`;

  const stroke = strokeWidth ?? Math.max(4, Math.round(size * 0.085));
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;

  const progress = useSharedValue(animated ? 0 : value / 100);
  useEffect(() => {
    const target = value / 100;
    progress.value = animated
      ? withTiming(target, { duration: 1100, easing: Easing.out(Easing.cubic) })
      : target;
  }, [value, animated, progress]);

  const arcProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference * (1 - progress.value),
  }));

  const large = size >= 120;
  const numberSize = Math.round(size * (large ? 0.3 : 0.34));

  return (
    <View
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={`Access score ${value} out of 100, ${BAND_LABEL[band]} range`}
      accessibilityValue={{ min: 0, max: 100, now: value }}
      style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}
    >
      <Svg width={size} height={size} style={{ position: 'absolute' }}>
        <Defs>
          <LinearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={signal.ring[0]} />
            <Stop offset="1" stopColor={signal.ring[1]} />
          </LinearGradient>
        </Defs>

        {/* soft inner disc — gives the ring a gentle tinted "glass" */}
        {large && (
          <Circle cx={center} cy={center} r={radius - stroke / 2} fill={signal.soft} opacity={0.55} />
        )}

        {/* track */}
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke={colors.palette.navy[100]}
          strokeWidth={stroke}
          fill="none"
        />

        {/* progress, rotated so it starts at 12 o'clock */}
        <G rotation={-90} origin={`${center}, ${center}`}>
          <AnimatedCircle
            cx={center}
            cy={center}
            r={radius}
            stroke={`url(#${gradientId})`}
            strokeWidth={stroke}
            strokeLinecap="round"
            fill="none"
            strokeDasharray={`${circumference} ${circumference}`}
            animatedProps={arcProps}
          />
        </G>
      </Svg>

      <Text
        style={{
          fontFamily: fonts.bold,
          fontSize: numberSize,
          lineHeight: Math.round(numberSize * 1.1),
          letterSpacing: -numberSize * 0.04,
          fontVariant: ['tabular-nums'],
          color: colors.text.primary,
        }}
        maxFontSizeMultiplier={1}
      >
        {value}
      </Text>
      {large && showLabel && (
        <Text variant="overline" tone="secondary" maxFontSizeMultiplier={1} style={{ marginTop: 2 }}>
          Access Score
        </Text>
      )}
    </View>
  );
}
