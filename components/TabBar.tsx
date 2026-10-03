import { House, Medal, Settings, Users, type LucideIcon } from 'lucide-react-native';
import type { ComponentProps } from 'react';
import { Pressable, View } from 'react-native';
import type { Tabs } from 'expo-router/js-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, radii, shadows, spacing } from '@/theme';

import { Text } from './Text';

type TabBarProps = Parameters<NonNullable<ComponentProps<typeof Tabs>['tabBar']>>[0];

const ICONS: Record<string, LucideIcon> = {
  index: House,
  la28: Medal,
  community: Users,
  settings: Settings,
};

export const TAB_BAR_HEIGHT = 64;

/** Bottom space a tab screen must leave so content clears the floating bar. */
export function useTabBarSpace(): number {
  const insets = useSafeAreaInsets();
  return tabBarBottom(insets.bottom) + TAB_BAR_HEIGHT + spacing.lg;
}

const tabBarBottom = (safeBottom: number) => (safeBottom > 0 ? safeBottom - 6 : spacing.md);

/** Floating, rounded tab bar. Coral icon + tinted pill marks the active tab (never color alone). */
export function TabBar({ state, descriptors, navigation }: TabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      accessibilityRole="tablist"
      style={[
        {
          position: 'absolute',
          left: spacing.lg,
          right: spacing.lg,
          bottom: tabBarBottom(insets.bottom),
          height: TAB_BAR_HEIGHT,
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: spacing.sm,
          borderRadius: radii['2xl'],
          borderCurve: 'continuous',
          backgroundColor: 'rgba(255,255,255,0.97)',
          borderWidth: 0.5,
          borderColor: colors.border.hairline,
        },
        shadows.lg,
      ]}
    >
      {state.routes.map((route, index) => {
        const focused = state.index === index;
        const { options } = descriptors[route.key];
        const label = options.title ?? route.name;
        const Icon = ICONS[route.name] ?? House;

        const onPress = () => {
          const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
          if (!focused && !event.defaultPrevented) navigation.navigate(route.name, route.params);
        };

        return (
          <Pressable
            key={route.key}
            accessibilityRole="tab"
            accessibilityState={{ selected: focused }}
            accessibilityLabel={options.tabBarAccessibilityLabel ?? label}
            onPress={onPress}
            style={{ flex: 1, alignItems: 'center', justifyContent: 'center', height: '100%' }}
          >
            <View
              style={{
                alignItems: 'center',
                gap: 2,
                paddingHorizontal: spacing.md,
                paddingVertical: 6,
                borderRadius: radii.lg,
                backgroundColor: focused ? colors.action.primarySoft : 'transparent',
              }}
            >
              <Icon
                size={21}
                color={focused ? colors.action.primary : colors.text.secondary}
                strokeWidth={focused ? 2.4 : 2}
              />
              <Text
                variant="caption"
                maxFontSizeMultiplier={1.15}
                numberOfLines={1}
                style={{
                  fontSize: 11,
                  lineHeight: 13,
                  fontFamily: focused ? 'Inter_600SemiBold' : 'Inter_500Medium',
                  color: focused ? colors.text.primary : colors.text.secondary,
                }}
              >
                {label}
              </Text>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}
