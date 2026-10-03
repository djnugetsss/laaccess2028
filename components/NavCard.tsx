import { ArrowRight, ChevronRight, type LucideIcon } from 'lucide-react-native';
import { Pressable, View } from 'react-native';

import { colors, radii, shadows, spacing, type AccentTone } from '@/theme';

import { Text } from './Text';

type Props = {
  title: string;
  subtitle: string;
  Icon: LucideIcon;
  tone?: AccentTone;
  onPress: () => void;
  /** Featured: larger, with a coral action affordance. Use for the primary destination. */
  featured?: boolean;
};

/** Tappable navigation card for top-level destinations. */
export function NavCard({ title, subtitle, Icon, tone = 'blue', onPress, featured }: Props) {
  const accent = colors.accent[tone];

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityHint={subtitle}
      onPress={onPress}
      style={({ pressed }) => [
        {
          flex: featured ? undefined : 1,
          padding: featured ? spacing.xl : spacing.lg,
          gap: featured ? spacing.lg : spacing.md,
          borderRadius: radii.xl,
          borderCurve: 'continuous',
          backgroundColor: colors.background.surface,
          borderWidth: 0.5,
          borderColor: colors.border.hairline,
          transform: [{ scale: pressed ? 0.98 : 1 }],
        },
        featured ? shadows.lg : shadows.md,
      ]}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View
          style={{
            width: featured ? 52 : 44,
            height: featured ? 52 : 44,
            borderRadius: radii.md,
            borderCurve: 'continuous',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: accent.fill,
          }}
        >
          <Icon size={featured ? 24 : 21} color={accent.text} strokeWidth={2} />
        </View>
        {featured ? (
          <View
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: colors.action.primary,
            }}
          >
            <ArrowRight size={20} color={colors.action.onPrimary} strokeWidth={2.4} />
          </View>
        ) : (
          <ChevronRight size={18} color={colors.text.tertiary} />
        )}
      </View>
      <View style={{ gap: 3 }}>
        <Text variant={featured ? 'heading' : 'subheading'}>{title}</Text>
        <Text variant={featured ? 'callout' : 'caption'} tone="secondary">
          {subtitle}
        </Text>
      </View>
    </Pressable>
  );
}
