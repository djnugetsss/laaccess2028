import { ChevronRight, type LucideIcon } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { Pressable, View } from 'react-native';

import { colors, radii, spacing, type AccentTone } from '@/theme';

import { Text } from './Text';

type Props = {
  Icon: LucideIcon;
  tone?: AccentTone;
  title: string;
  subtitle?: string;
  /** Right-aligned value text, e.g. "4 selected". */
  value?: string;
  /** Right-aligned control (switch, segmented control…). Replaces value + chevron. */
  accessory?: ReactNode;
  onPress?: () => void;
  /** Hide the divider on the last row in a group. */
  last?: boolean;
};

/** Grouped-list row, iOS Settings style. Place inside <Card padding="none">. */
export function SettingsRow({ Icon, tone = 'blue', title, subtitle, value, accessory, onPress, last }: Props) {
  const accent = colors.accent[tone];
  const content = (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        minHeight: 56,
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.lg,
        borderBottomWidth: last ? 0 : 1,
        borderBottomColor: colors.border.hairline,
      }}
    >
      <View
        style={{
          width: 32,
          height: 32,
          borderRadius: radii.sm,
          borderCurve: 'continuous',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: accent.fill,
        }}
      >
        <Icon size={17} color={accent.text} strokeWidth={2.2} />
      </View>
      <View style={{ flex: 1, gap: 2 }}>
        <Text variant="callout" style={{ fontFamily: 'Inter_500Medium' }}>
          {title}
        </Text>
        {subtitle ? (
          <Text variant="caption" tone="secondary">
            {subtitle}
          </Text>
        ) : null}
      </View>
      {accessory ?? (
        <>
          {value ? (
            <Text variant="callout" tone="secondary">
              {value}
            </Text>
          ) : null}
          {onPress && <ChevronRight size={18} color={colors.text.tertiary} />}
        </>
      )}
    </View>
  );

  if (!onPress) return content;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={[title, value, subtitle].filter(Boolean).join(', ')}
      onPress={onPress}
      style={({ pressed }) => ({ backgroundColor: pressed ? colors.background.sunken : 'transparent' })}
    >
      {content}
    </Pressable>
  );
}
