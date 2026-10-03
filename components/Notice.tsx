import { Info, TriangleAlert } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { View } from 'react-native';

import { colors, radii, spacing } from '@/theme';

import { Text } from './Text';

type Props = {
  title: string;
  body?: ReactNode;
  /** caution: amber, for missing/uncertain data. info: soft blue, for context. */
  tone?: 'caution' | 'info';
};

/** Inline callout. Always icon + text — never color alone. */
export function Notice({ title, body, tone = 'info' }: Props) {
  const caution = tone === 'caution';
  const fg = caution ? colors.signal.medium.text : colors.accent.blue.text;
  const bg = caution ? colors.signal.medium.soft : colors.accent.blue.fill;
  const Icon = caution ? TriangleAlert : Info;

  return (
    <View
      accessible
      accessibilityRole={caution ? 'alert' : 'text'}
      style={{
        flexDirection: 'row',
        gap: spacing.md,
        padding: spacing.lg,
        borderRadius: radii.xl,
        borderCurve: 'continuous',
        backgroundColor: bg,
      }}
    >
      <Icon size={20} color={fg} strokeWidth={2.2} style={{ marginTop: 1 }} />
      <View style={{ flex: 1, gap: 4 }}>
        <Text variant="bodyStrong" style={{ color: fg }}>
          {title}
        </Text>
        {typeof body === 'string' ? (
          <Text variant="callout" style={{ color: fg }}>
            {body}
          </Text>
        ) : (
          body
        )}
      </View>
    </View>
  );
}
