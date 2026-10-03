import { Tabs } from 'expo-router/js-tabs';

import { TabBar } from '@/components';
import { colors } from '@/theme';

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <TabBar {...props} />}
      screenOptions={{
        headerShown: false,
        animation: 'fade',
        sceneStyle: { backgroundColor: colors.background.surface },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Home' }} />
      <Tabs.Screen name="la28" options={{ title: 'LA28' }} />
      <Tabs.Screen name="community" options={{ title: 'Your LA', tabBarAccessibilityLabel: 'Your LA, community' }} />
      <Tabs.Screen name="settings" options={{ title: 'Settings' }} />
    </Tabs>
  );
}
