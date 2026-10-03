import { Info } from 'lucide-react-native';
import { View } from 'react-native';

import { DISCLAIMER } from '@/lib/constants';
import { colors, spacing } from '@/theme';

import { Text } from './Text';

/** Non-affiliation notice. Include on any screen that could read as official. */
export function Disclaimer() {
  return (
    <View style={{ flexDirection: 'row', gap: spacing.sm, paddingVertical: spacing.md }}>
      <Info size={14} color={colors.text.secondary} style={{ marginTop: 2 }} />
      <Text variant="caption" tone="secondary" style={{ flex: 1 }}>
        {DISCLAIMER}
      </Text>
    </View>
  );
}
