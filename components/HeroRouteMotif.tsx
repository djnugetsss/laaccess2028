import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, { Easing, useAnimatedProps, useSharedValue, withDelay, withTiming } from 'react-native-reanimated';
import Svg, { Circle, Defs, LinearGradient, Path, RadialGradient, Rect, Stop } from 'react-native-svg';

import { colors, radii, shadows, spacing } from '@/theme';

import { AccessScoreRing } from './AccessScoreRing';
import { Text } from './Text';

const AnimatedPath = Animated.createAnimatedComponent(Path);

const ROUTE = 'M58 150 C 110 150 120 98 170 100 S 238 62 282 58';
const ROUTE_LENGTH = 300; // slightly over the true length so the dash fully hides it

/**
 * Abstract "route over a soft map" illustration for the Home hero.
 * Pastel washes, faint streets, and a coral route that draws itself on mount.
 */
export function HeroRouteMotif({ height = 210 }: { height?: number }) {
  const progress = useSharedValue(0);
  useEffect(() => {
    progress.value = withDelay(250, withTiming(1, { duration: 1400, easing: Easing.inOut(Easing.cubic) }));
  }, [progress]);

  const routeProps = useAnimatedProps(() => ({
    strokeDashoffset: ROUTE_LENGTH * (1 - progress.value),
  }));

  const { navy, coral, pink, green, blue } = colors.palette;

  return (
    <View
      importantForAccessibility="no-hide-descendants"
      accessibilityElementsHidden
      style={[
        {
          height,
          borderRadius: radii['2xl'],
          borderCurve: 'continuous',
          overflow: 'hidden',
          backgroundColor: colors.background.surface,
          borderWidth: 0.5,
          borderColor: colors.border.hairline,
        },
        shadows.md,
      ]}
    >
      <Svg width="100%" height="100%" viewBox="0 0 340 210" preserveAspectRatio="xMidYMid slice">
        <Defs>
          <LinearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={blue[50]} />
            <Stop offset="0.55" stopColor="#FFFFFF" />
            <Stop offset="1" stopColor={pink[50]} />
          </LinearGradient>
          <RadialGradient id="pinkBlob" cx="50%" cy="50%" r="50%">
            <Stop offset="0" stopColor={pink[100]} stopOpacity="0.9" />
            <Stop offset="1" stopColor={pink[100]} stopOpacity="0" />
          </RadialGradient>
          <RadialGradient id="greenBlob" cx="50%" cy="50%" r="50%">
            <Stop offset="0" stopColor={green[100]} stopOpacity="0.95" />
            <Stop offset="1" stopColor={green[100]} stopOpacity="0" />
          </RadialGradient>
          <RadialGradient id="blueBlob" cx="50%" cy="50%" r="50%">
            <Stop offset="0" stopColor={blue[100]} stopOpacity="0.95" />
            <Stop offset="1" stopColor={blue[100]} stopOpacity="0" />
          </RadialGradient>
        </Defs>

        <Rect width="340" height="210" fill="url(#bg)" />
        <Circle cx="40" cy="40" r="110" fill="url(#pinkBlob)" />
        <Circle cx="320" cy="190" r="120" fill="url(#greenBlob)" />
        <Circle cx="290" cy="20" r="90" fill="url(#blueBlob)" />

        {/* faint streets */}
        <Path d="M-10 132 C 80 116 170 146 350 104" stroke={navy[100]} strokeWidth={6} fill="none" />
        <Path d="M40 -10 L 118 220" stroke={navy[100]} strokeWidth={4} fill="none" />
        <Path d="M206 -10 C 214 70 188 140 236 220" stroke={navy[100]} strokeWidth={4} fill="none" />
        <Path d="M-10 62 L 350 84" stroke={navy[100]} strokeWidth={3} fill="none" />
        <Path d="M300 -10 L 262 220" stroke={navy[50]} strokeWidth={3} fill="none" />

        {/* route: white casing + coral line, drawn in */}
        <AnimatedPath
          d={ROUTE}
          stroke="#FFFFFF"
          strokeWidth={10}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={`${ROUTE_LENGTH} ${ROUTE_LENGTH}`}
          animatedProps={routeProps}
        />
        <AnimatedPath
          d={ROUTE}
          stroke={coral[500]}
          strokeWidth={5}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={`${ROUTE_LENGTH} ${ROUTE_LENGTH}`}
          animatedProps={routeProps}
        />

        {/* origin */}
        <Circle cx="58" cy="150" r="9" fill="#FFFFFF" />
        <Circle cx="58" cy="150" r="5" fill={navy[900]} />

        {/* destination */}
        <Circle cx="282" cy="58" r="22" fill={coral[500]} opacity={0.14} />
        <Circle cx="282" cy="58" r="12" fill="#FFFFFF" />
        <Circle cx="282" cy="58" r="8.5" fill={coral[500]} />
        <Circle cx="282" cy="58" r="3" fill="#FFFFFF" />
      </Svg>

      {/* floating score chip */}
      <View
        style={[
          {
            position: 'absolute',
            left: spacing.lg,
            bottom: spacing.lg,
            flexDirection: 'row',
            alignItems: 'center',
            gap: spacing.sm,
            paddingVertical: 6,
            paddingLeft: 6,
            paddingRight: spacing.md,
            borderRadius: radii.full,
            backgroundColor: 'rgba(255,255,255,0.92)',
          },
          shadows.sm,
        ]}
      >
        <AccessScoreRing score={91} size={34} strokeWidth={4} />
        <View>
          <Text variant="caption" style={{ fontFamily: 'Inter_600SemiBold' }}>
            Step-free route
          </Text>
          <Text variant="caption" tone="secondary" style={{ fontSize: 11, lineHeight: 14 }}>
            Shaded stops · 1 transfer
          </Text>
        </View>
      </View>
    </View>
  );
}
