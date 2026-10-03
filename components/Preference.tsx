import { Check } from 'lucide-react-native';
import { Pressable, View } from 'react-native';

import type { PreferenceKey, PreferenceOption } from '@/lib/types';
import { colors, layout, radii, shadows, spacing, type AccentTone } from '@/theme';

import { Text } from './Text';

const TONES: Record<PreferenceKey, AccentTone> = {
  accessibility: 'blue',
  lessWalking: 'green',
  avoidStairs: 'pink',
  lessHeat: 'pink',
  preferShade: 'green',
  transit: 'blue',
  faster: 'blue',
  lowerCost: 'green',
  driving: 'blue',
  fewerTransfers: 'pink',
};

/** Consistent pastel accent per preference, so a preference looks the same on every screen. */
export const preferenceTone = (key: PreferenceKey): AccentTone => TONES[key];

type Props = {
  option: Pick<PreferenceOption, 'emoji' | 'label'> & { description?: string };
  selected: boolean;
  onToggle: () => void;
  /** Accent used for the selected fill. */
  tone?: AccentTone;
};

const PILL_HEIGHT = { sm: 36, md: 40 } as const;

/** Compact selectable chip: emoji + label. Wraps in rows or sits in a horizontal scroller. */
export function PreferencePill({
  option,
  selected,
  onToggle,
  tone = 'blue',
  size = 'md',
}: Props & { size?: keyof typeof PILL_HEIGHT }) {
  const accent = colors.accent[tone];
  const compact = size === 'sm';

  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked: selected }}
      accessibilityLabel={option.label}
      onPress={onToggle}
      hitSlop={compact ? 6 : 4}
      style={({ pressed }) => [
        {
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing.xs + 2,
          paddingLeft: spacing.md,
          paddingRight: selected ? spacing.sm : spacing.md,
          minHeight: PILL_HEIGHT[size],
          paddingVertical: spacing.xs,
          borderRadius: radii.full,
          borderWidth: 1,
          backgroundColor: selected ? accent.strong : colors.background.surface,
          borderColor: selected ? accent.border : colors.border.hairline,
          transform: [{ scale: pressed ? 0.97 : 1 }],
        },
        !selected && shadows.sm,
      ]}
    >
      <Text variant="callout" importantForAccessibility="no">
        {option.emoji}
      </Text>
      <Text
        variant="callout"
        style={{ color: selected ? accent.text : colors.text.primary, fontFamily: 'Inter_500Medium' }}
      >
        {option.label}
      </Text>
      {selected && <Check size={compact ? 13 : 15} strokeWidth={2.75} color={accent.text} />}
    </Pressable>
  );
}

/**
 * Larger selectable card for grid layouts: emoji tile, label, optional description.
 * Fixed min height fits a two-line description, so every card in a grid matches.
 */
export function PreferenceCard({ option, selected, onToggle, tone = 'blue' }: Props) {
  const accent = colors.accent[tone];

  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked: selected }}
      accessibilityLabel={option.label}
      accessibilityHint={option.description}
      onPress={onToggle}
      style={({ pressed }) => [
        {
          flex: 1,
          minHeight: 144,
          padding: layout.cardPadding,
          gap: spacing.md,
          borderRadius: radii.xl,
          borderCurve: 'continuous',
          borderWidth: selected ? 1.5 : 1,
          backgroundColor: selected ? accent.fill : colors.background.surface,
          borderColor: selected ? accent.border : colors.border.hairline,
          transform: [{ scale: pressed ? 0.98 : 1 }],
        },
        !selected && shadows.sm,
      ]}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <View
          style={{
            width: 40,
            height: 40,
            borderRadius: radii.md,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: selected ? colors.background.surface : colors.background.sunken,
          }}
        >
          <Text style={{ fontSize: 20, lineHeight: 24 }} importantForAccessibility="no">
            {option.emoji}
          </Text>
        </View>
        <View
          style={{
            width: 22,
            height: 22,
            borderRadius: 11,
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: selected ? 0 : 1.5,
            borderColor: colors.border.strong,
            backgroundColor: selected ? accent.text : 'transparent',
          }}
        >
          {selected && <Check size={13} strokeWidth={3} color={colors.text.inverse} />}
        </View>
      </View>
      <View style={{ gap: 2 }}>
        <Text variant="subheading">{option.label}</Text>
        {option.description ? (
          <Text variant="caption" tone="secondary">
            {option.description}
          </Text>
        ) : null}
      </View>
    </Pressable>
  );
}
