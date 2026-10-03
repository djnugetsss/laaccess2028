import { View } from 'react-native';

import type { DataConfidence } from '@/lib/types';
import { colors, radii, spacing } from '@/theme';

import { Text } from './Text';

const LABELS: Record<DataConfidence, string> = {
  high: 'Official data',
  medium: 'Partly estimated',
  low: 'Estimated',
};

type Props = {
  level: DataConfidence;
  /** Override the default label. */
  label?: string;
};

/** Overall data-confidence indicator: colored dot + muted label on a soft tint. */
export function DataConfidenceBadge({ level, label }: Props) {
  const signal = colors.signal[level];
  const text = label ?? LABELS[level];

  return (
    <View
      accessible
      accessibilityLabel={`Data confidence: ${text}`}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        gap: 6,
        paddingHorizontal: spacing.sm + 2,
        paddingVertical: 5,
        borderRadius: radii.full,
        backgroundColor: signal.soft,
      }}
    >
      <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: signal.solid }} />
      <Text variant="caption" style={{ color: signal.text }}>
        {text}
      </Text>
    </View>
  );
}
