import type { ViewStyle } from 'react-native';

import palette from './palette';

/**
 * Soft, navy-tinted elevation. Low opacity + large radius = airy, Apple-style depth.
 * `elevation` covers Android; iOS uses the shadow* props.
 */
const make = (y: number, radius: number, opacity: number, elevation: number): ViewStyle => ({
  shadowColor: palette.navy[900],
  shadowOffset: { width: 0, height: y },
  shadowRadius: radius,
  shadowOpacity: opacity,
  elevation,
});

export const shadows = {
  none: {} as ViewStyle,
  sm: make(2, 6, 0.05, 1),
  md: make(6, 18, 0.07, 3),
  lg: make(12, 32, 0.09, 6),
  /** Colored glow for the primary action. */
  primary: { ...make(8, 18, 0.28, 4), shadowColor: palette.coral[600] } as ViewStyle,
} as const;

export type Shadow = keyof typeof shadows;
