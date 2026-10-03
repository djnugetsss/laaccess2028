import { BadgeCheck, CircleDashed, Globe, type LucideIcon } from 'lucide-react-native';
import { View } from 'react-native';

import type { TrustLevel } from '@/lib/types';
import { colors, radii } from '@/theme';

import { Text } from './Text';

const CONFIG: Record<TrustLevel, { label: string; Icon: LucideIcon; fg: string; bg: string }> = {
  official: {
    label: 'Official',
    Icon: BadgeCheck,
    fg: colors.signal.high.text,
    bg: colors.signal.high.soft,
  },
  open: {
    label: 'Open data',
    Icon: Globe,
    fg: colors.accent.blue.text,
    bg: colors.accent.blue.fill,
  },
  estimated: {
    label: 'Estimated',
    Icon: CircleDashed,
    fg: colors.signal.medium.text,
    bg: colors.signal.medium.soft,
  },
};

type Props = {
  source: TrustLevel;
  /** Optional prefix, e.g. "Heat" → "Heat · Open data". */
  category?: string;
  /** Override the default label, e.g. "Public plans". Icon + color still come from `source`. */
  label?: string;
};

/** Compact source label: where a specific piece of data came from. */
export function TrustTag({ source, category, label: labelOverride }: Props) {
  const { Icon, fg, bg } = CONFIG[source];
  const label = labelOverride ?? CONFIG[source].label;
  const text = category ? `${category} · ${label}` : label;

  return (
    <View
      accessible
      accessibilityLabel={`${category ? `${category} data source: ` : 'Source: '}${label}`}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        gap: 4,
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: radii.xs,
        backgroundColor: bg,
      }}
    >
      <Icon size={12} color={fg} strokeWidth={2.4} />
      <Text variant="overline" style={{ color: fg, letterSpacing: 0.5 }}>
        {text}
      </Text>
    </View>
  );
}
