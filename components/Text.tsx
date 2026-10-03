import { Text as RNText, type TextProps as RNTextProps } from 'react-native';

import { colors, typography, type TypographyVariant } from '@/theme';

type Tone = keyof typeof colors.text;

export type TextProps = RNTextProps & {
  variant?: TypographyVariant;
  tone?: Tone;
  className?: string;
};

/** Typed text with the app's type scale. Every string in the UI should go through this. */
export function Text({ variant = 'body', tone = 'primary', style, ...rest }: TextProps) {
  return (
    <RNText
      maxFontSizeMultiplier={variant === 'display' || variant === 'title' ? 1.3 : 1.6}
      style={[typography[variant], { color: colors.text[tone] }, style]}
      {...rest}
    />
  );
}
