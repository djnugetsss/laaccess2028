import { ChevronRight } from 'lucide-react-native';
import { Pressable } from 'react-native';

import { colors } from '@/theme';

import { Text } from './Text';

type Props = {
  title: string;
  onPress: () => void;
  accessibilityLabel?: string;
};

/**
 * Quiet inline link for tertiary navigation ("How scoring works"). Blue text + chevron, so it
 * reads as a link without spending the coral accent.
 */
export function TextLink({ title, onPress, accessibilityLabel }: Props) {
  return (
    <Pressable
      accessibilityRole="link"
      accessibilityLabel={accessibilityLabel ?? title}
      onPress={onPress}
      hitSlop={8}
      style={({ pressed }) => ({
        alignSelf: 'flex-start',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 2,
        minHeight: 32,
        opacity: pressed ? 0.6 : 1,
      })}
    >
      <Text variant="caption" style={{ color: colors.accent.blue.text, fontFamily: 'Inter_600SemiBold' }}>
        {title}
      </Text>
      <ChevronRight size={14} color={colors.accent.blue.text} strokeWidth={2.4} />
    </Pressable>
  );
}
