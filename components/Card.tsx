import type { ReactNode } from 'react';
import { View, type ViewProps } from 'react-native';

import { colors, layout, radii, shadows, spacing, type AccentTone } from '@/theme';

const PADDING = { none: 0, sm: spacing.sm, md: layout.cardPadding, lg: layout.cardPaddingLg } as const;

export type CardProps = ViewProps & {
  children?: ReactNode;
  padding?: keyof typeof PADDING;
  /** elevated: white + soft shadow. outlined: white + hairline. tinted: pastel accent fill. */
  variant?: 'elevated' | 'outlined' | 'tinted';
  tone?: AccentTone;
  className?: string;
};

/** Rounded surface. The base container for almost every grouped piece of content. */
export function Card({
  children,
  padding = 'md',
  variant = 'elevated',
  tone = 'blue',
  style,
  ...rest
}: CardProps) {
  const surface =
    variant === 'tinted'
      ? { backgroundColor: colors.accent[tone].fill, borderColor: colors.accent[tone].strong }
      : { backgroundColor: colors.background.surface, borderColor: colors.border.hairline };

  return (
    <View
      style={[
        {
          borderRadius: radii.xl,
          padding: PADDING[padding],
          borderWidth: variant === 'elevated' ? 0.5 : 1,
          borderCurve: 'continuous',
        },
        surface,
        variant === 'elevated' && shadows.md,
        style,
      ]}
      {...rest}
    >
      {children}
    </View>
  );
}
