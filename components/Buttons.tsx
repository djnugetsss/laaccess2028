import type { ReactNode } from 'react';
import { ActivityIndicator, Pressable, View, type PressableProps } from 'react-native';

import { colors, radii, shadows, spacing } from '@/theme';

import { Text } from './Text';

type BaseProps = Omit<PressableProps, 'children' | 'style'> & {
  title: string;
  /** Leading icon element (e.g. a lucide icon). */
  icon?: ReactNode;
  /** Trailing icon element. */
  trailingIcon?: ReactNode;
  loading?: boolean;
  fullWidth?: boolean;
  size?: 'md' | 'lg';
};

const HEIGHT = { md: 46, lg: 56 } as const;

function ButtonBase({
  title,
  icon,
  trailingIcon,
  loading,
  fullWidth = true,
  size = 'lg',
  disabled,
  kind,
  ...rest
}: BaseProps & { kind: 'primary' | 'secondary' }) {
  const isPrimary = kind === 'primary';
  const isDisabled = disabled || loading;
  // Disabled primary: solid neutral fill + muted label, so it reads as inactive but stays legible.
  const primaryDisabled = isPrimary && isDisabled && !loading;
  const labelColor = primaryDisabled
    ? colors.text.secondary
    : isPrimary
      ? colors.action.onPrimary
      : colors.text.primary;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!isDisabled, busy: !!loading }}
      disabled={isDisabled}
      style={({ pressed }) => [
        {
          minHeight: HEIGHT[size],
          paddingVertical: spacing.sm,
          borderRadius: radii.lg,
          borderCurve: 'continuous',
          paddingHorizontal: spacing['2xl'],
          alignSelf: fullWidth ? 'stretch' : 'flex-start',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: isDisabled && !isPrimary ? 0.45 : 1,
          transform: [{ scale: pressed ? 0.98 : 1 }],
        },
        isPrimary
          ? [
              {
                backgroundColor: primaryDisabled
                  ? colors.border.hairline
                  : pressed
                    ? colors.action.primaryPressed
                    : colors.action.primary,
              },
              !isDisabled && shadows.primary,
            ]
          : [
              {
                backgroundColor: pressed ? colors.background.sunken : colors.background.surface,
                borderWidth: 1,
                borderColor: colors.border.strong,
              },
            ],
      ]}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator color={labelColor} />
      ) : (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
          {icon}
          <Text
            variant="bodyStrong"
            maxFontSizeMultiplier={1.4}
            style={{ color: labelColor, textAlign: 'center' }}
          >
            {title}
          </Text>
          {trailingIcon}
        </View>
      )}
    </Pressable>
  );
}

/** Coral, high-emphasis action. One per screen. */
export function PrimaryButton(props: BaseProps) {
  return <ButtonBase kind="primary" {...props} />;
}

/** White, outlined, lower-emphasis action. */
export function SecondaryButton(props: BaseProps) {
  return <ButtonBase kind="secondary" {...props} />;
}
