import { router } from 'expo-router';
import { Accessibility, ChevronRight, Map, Medal, Users } from 'lucide-react-native';
import { Pressable, ScrollView, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { GradientBackground, HeroRouteMotif, NavCard, Text, useTabBarSpace } from '@/components';
import { APP_NAME, SHORT_DISCLAIMER } from '@/lib/constants';
import { colors, screenPadding, spacing } from '@/theme';

export default function Home() {
  const insets = useSafeAreaInsets();
  const tabSpace = useTabBarSpace();
  const enter = (i: number) => FadeInDown.delay(60 + i * 80).duration(500);

  return (
    <GradientBackground>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          flexGrow: 1,
          paddingTop: insets.top + spacing.lg,
          paddingBottom: tabSpace,
          paddingHorizontal: screenPadding,
        }}
      >
        {/* wordmark */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
          <View
            style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: colors.action.primary }}
          />
          <Text variant="overline" tone="secondary" style={{ letterSpacing: 1.6 }}>
            {APP_NAME}
          </Text>
        </View>

        <Animated.View entering={enter(0)} style={{ marginTop: spacing['2xl'] }}>
          <HeroRouteMotif />
        </Animated.View>

        <Animated.View entering={enter(1)} style={{ marginTop: spacing['3xl'], gap: spacing.md }}>
          <Text variant="display" accessibilityRole="header" style={{ fontSize: 38, lineHeight: 44 }}>
            Navigate LA{'\n'}your way.
          </Text>
          <Text variant="body" tone="secondary" style={{ fontSize: 17, lineHeight: 25 }}>
            Routes designed around what matters to you.
          </Text>
        </Animated.View>

        <Animated.View entering={enter(2)} style={{ marginTop: spacing['3xl'], gap: spacing.md }}>
          <NavCard
            featured
            title="Plan a Route"
            subtitle="Compare routes by access, walking, heat, and more."
            Icon={Map}
            tone="pink"
            onPress={() => router.push('/route-setup')}
          />
          <View style={{ flexDirection: 'row', gap: spacing.md }}>
            <NavCard
              title="Explore LA28"
              subtitle="Venue zones & getting around"
              Icon={Medal}
              tone="blue"
              onPress={() => router.navigate('/la28')}
            />
            <NavCard
              title="Your LA"
              subtitle="Designed for CA-27"
              Icon={Users}
              tone="green"
              onPress={() => router.navigate('/community')}
            />
          </View>

          <Pressable
            accessibilityRole="link"
            accessibilityLabel="How ACCESS LA28 ranks routes"
            onPress={() => router.push('/accessibility')}
            style={({ pressed }) => ({
              flexDirection: 'row',
              alignItems: 'center',
              gap: spacing.sm,
              minHeight: 44,
              paddingHorizontal: spacing.xs,
              opacity: pressed ? 0.6 : 1,
            })}
          >
            <Accessibility size={18} color={colors.accent.blue.text} strokeWidth={2.2} />
            <Text variant="callout" style={{ flex: 1, color: colors.accent.blue.text, fontFamily: 'Inter_500Medium' }}>
              How ACCESS LA28 ranks routes
            </Text>
            <ChevronRight size={16} color={colors.accent.blue.text} />
          </Pressable>
        </Animated.View>

        <View style={{ flex: 1, minHeight: spacing.xl }} />
        <Text
          variant="caption"
          tone="secondary"
          style={{ textAlign: 'center', fontSize: 12, marginTop: spacing.xl }}
        >
          {SHORT_DISCLAIMER}
        </Text>
      </ScrollView>
    </GradientBackground>
  );
}
