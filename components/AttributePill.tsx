import type { ReactNode } from 'react';
import { View } from 'react-native';

import { colors, radii, spacing, type AccentTone } from '@/theme';

import { Text } from './Text';

type Props = {
  /** Emoji string or an icon element. */
  icon?: ReactNode;
  label: string;
  tone?: 'neutral' | AccentTone;
};

/** Small icon + text pill for route attributes. */
export function AttributePill({ icon, label, tone = 'neutral' }: Props) {
  const bg = tone === 'neutral' ? colors.background.sunken : colors.accent[tone].fill;
  const fg = tone === 'neutral' ? colors.text.primary : colors.accent[tone].text;

  return (
    <View
      accessible
      accessibilityLabel={label}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: radii.full,
        backgroundColor: bg,
      }}
    >
      {typeof icon === 'string' ? (
        <Text variant="caption" importantForAccessibility="no">
          {icon}
        </Text>
      ) : (
        icon
      )}
      <Text variant="caption" style={{ color: fg }}>
        {label}
      </Text>
    </View>
  );
}
