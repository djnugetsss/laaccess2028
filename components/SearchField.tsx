import type { ReactNode } from 'react';
import { TextInput, View, type TextInputProps } from 'react-native';

import { colors, radii, spacing, typography } from '@/theme';

import { Text } from './Text';

type Props = Omit<TextInputProps, 'style'> & {
  label: string;
  icon: ReactNode;
};

/** Apple-Maps-style field: soft fill, leading icon, small label above the value. */
export function SearchField({ label, icon, ...input }: Props) {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        minHeight: 58,
        paddingHorizontal: spacing.md + 2,
        borderRadius: radii.md,
        borderCurve: 'continuous',
        backgroundColor: colors.background.sunken,
      }}
    >
      <View style={{ width: 24, alignItems: 'center' }}>{icon}</View>
      <View style={{ flex: 1, paddingVertical: spacing.sm }}>
        <Text variant="caption" tone="secondary" style={{ fontSize: 12, lineHeight: 15 }}>
          {label}
        </Text>
        <TextInput
          accessibilityLabel={label}
          placeholderTextColor={colors.text.tertiary}
          selectionColor={colors.action.primary}
          clearButtonMode="while-editing"
          autoCorrect={false}
          returnKeyType="done"
          {...input}
          style={[typography.bodyStrong, { color: colors.text.primary, padding: 0, marginTop: 1 }]}
        />
      </View>
    </View>
  );
}
