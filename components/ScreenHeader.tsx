import type { ReactNode } from 'react';
import { View } from 'react-native';

import { spacing } from '@/theme';

import { Text } from './Text';

type Props = {
  title: string;
  subtitle?: string;
  /** Small label above the title, e.g. a step "1 of 3". */
  eyebrow?: string;
  /** Right-aligned slot (icon button, avatar…). */
  accessory?: ReactNode;
};

/**
 * Large-title header used at the top of every screen. Carries no outer margin — screens place
 * it in a column with `layout.section` gaps.
 */
export function ScreenHeader({ title, subtitle, eyebrow, accessory }: Props) {
  return (
    <View style={{ gap: spacing.sm }}>
      <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: spacing.md }}>
        <View style={{ flex: 1, gap: spacing.xs }}>
          {eyebrow ? (
            <Text variant="overline" tone="secondary">
              {eyebrow}
            </Text>
          ) : null}
          <Text variant="display" accessibilityRole="header">
            {title}
          </Text>
        </View>
        {accessory}
      </View>
      {subtitle ? (
        <Text variant="body" tone="secondary">
          {subtitle}
        </Text>
      ) : null}
    </View>
  );
}
