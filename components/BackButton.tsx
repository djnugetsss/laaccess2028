import { router } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { Pressable } from 'react-native';

import { colors, shadows } from '@/theme';

/** Floating circular back button. Falls back to Home when there is no history. */
export function BackButton({ onPress }: { onPress?: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Back"
      hitSlop={8}
      onPress={onPress ?? (() => (router.canGoBack() ? router.back() : router.replace('/')))}
      style={({ pressed }) => [
        {
          width: 40,
          height: 40,
          borderRadius: 20,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: colors.background.surface,
          transform: [{ scale: pressed ? 0.94 : 1 }],
        },
        shadows.sm,
      ]}
    >
      <ChevronLeft size={22} color={colors.text.primary} strokeWidth={2.2} style={{ marginLeft: -2 }} />
    </Pressable>
  );
}
