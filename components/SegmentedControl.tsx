import { Pressable, View } from 'react-native';

import { colors, radii, shadows } from '@/theme';

import { Text } from './Text';

type Option<T extends string> = { value: T; label: string; accessibilityLabel?: string };

type Props<T extends string> = {
  options: readonly Option<T>[];
  value: T;
  onChange: (v: T) => void;
  accessibilityLabel: string;
};

/** iOS-style segmented control. */
export function SegmentedControl<T extends string>({ options, value, onChange, accessibilityLabel }: Props<T>) {
  return (
    <View
      accessibilityRole="radiogroup"
      accessibilityLabel={accessibilityLabel}
      style={{
        flexDirection: 'row',
        padding: 3,
        borderRadius: radii.sm,
        backgroundColor: colors.background.sunken,
      }}
    >
      {options.map((o) => {
        const active = o.value === value;
        return (
          <Pressable
            key={o.value}
            accessibilityRole="radio"
            accessibilityState={{ checked: active }}
            accessibilityLabel={o.accessibilityLabel ?? o.label}
            onPress={() => onChange(o.value)}
            hitSlop={{ top: 8, bottom: 8 }}
            style={[
              {
                minWidth: 48,
                minHeight: 32,
                paddingHorizontal: 12,
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: radii.xs + 1,
                backgroundColor: active ? colors.background.surface : 'transparent',
              },
              active && shadows.sm,
            ]}
          >
            <Text
              variant="caption"
              maxFontSizeMultiplier={1.3}
              style={{ fontFamily: active ? 'Inter_600SemiBold' : 'Inter_500Medium' }}
              tone={active ? 'primary' : 'secondary'}
            >
              {o.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
