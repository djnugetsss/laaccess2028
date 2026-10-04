import Constants from 'expo-constants';
import { router } from 'expo-router';
import { Accessibility, Info, LocateFixed, Lock, Palette, Thermometer } from 'lucide-react-native';
import { ScrollView, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  Card,
  GradientBackground,
  ScreenHeader,
  SectionHeader,
  SegmentedControl,
  SettingsRow,
  Text,
  TrustTag,
  useTabBarSpace,
} from '@/components';
import { APP_NAME, DISCLAIMER } from '@/lib/constants';
import { useSettings, type TempUnit } from '@/lib/settings';
import { useTrip } from '@/lib/trip';
import type { TrustLevel } from '@/lib/types';
import { colors, layout, screenPadding, spacing } from '@/theme';

/** Sources a full version would use. None are connected in this prototype. */
const DATA_SOURCES: { name: string; provides: string; trust: TrustLevel }[] = [
  { name: 'LA28', provides: 'Venue and event information', trust: 'official' },
  { name: 'LA Metro', provides: 'Bus and rail service, station elevator status', trust: 'official' },
  { name: 'Metrolink', provides: 'Regional rail service', trust: 'official' },
  { name: 'OpenStreetMap', provides: 'Streets, sidewalks, and path data', trust: 'open' },
  { name: 'NOAA / NWS', provides: 'Weather and heat forecasts', trust: 'official' },
  { name: 'LA County / City GIS', provides: 'Public geographic data (curbs, shade, facilities)', trust: 'official' },
];

const UNITS = [
  { value: 'F', label: '°F', accessibilityLabel: 'Fahrenheit' },
  { value: 'C', label: '°C', accessibilityLabel: 'Celsius' },
] as const;

export default function Settings() {
  const insets = useSafeAreaInsets();
  const tabSpace = useTabBarSpace();
  const { tempUnit, setTempUnit } = useSettings();
  const { preferences } = useTrip();
  const version = Constants.expoConfig?.version ?? '—';
  const enter = (i: number) => FadeInDown.delay(60 + i * 60).duration(420);

  return (
    <GradientBackground>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: insets.top + layout.cardPaddingLg,
          paddingHorizontal: screenPadding,
          paddingBottom: tabSpace,
          gap: layout.section,
        }}
      >
        <ScreenHeader title="Settings" subtitle="Preferences, data sources, and privacy." />

        <Animated.View entering={enter(0)}>
          <SectionHeader title="Preferences" />
          <Card padding="none">
            <SettingsRow
              Icon={Accessibility}
              title="Accessibility preferences"
              subtitle="What each preference does"
              value={`${preferences.length} on`}
              onPress={() => router.push('/accessibility')}
            />
            <SettingsRow
              Icon={Thermometer}
              tone="pink"
              title="Temperature units"
              accessory={
                <SegmentedControl<TempUnit>
                  accessibilityLabel="Temperature units"
                  options={UNITS}
                  value={tempUnit}
                  onChange={setTempUnit}
                />
              }
              last
            />
          </Card>
        </Animated.View>

        <Animated.View entering={enter(1)}>
          <SectionHeader title="Location" />
          <Card padding="none">
            <SettingsRow
              Icon={LocateFixed}
              tone="green"
              title="Location permission"
              subtitle="Not requested. This prototype doesn’t access your location. A future version would use it only to suggest a starting point for routes."
              value="Off"
              last
            />
          </Card>
        </Animated.View>

        <Animated.View entering={enter(2)}>
          <SectionHeader
            title="Data sources"
            caption="Planned sources for a full version. This prototype uses illustrative demo data and is not connected to any of them yet."
          />
          <Card padding="none">
            {DATA_SOURCES.map((s, i) => (
              <View
                key={s.name}
                accessible
                accessibilityLabel={`${s.name}: ${s.provides}. ${s.trust === 'official' ? 'Official source' : 'Open data'}. Planned, not connected.`}
                style={{
                  gap: spacing.xs,
                  paddingHorizontal: layout.cardPadding,
                  paddingVertical: spacing.md,
                  borderBottomWidth: i === DATA_SOURCES.length - 1 ? 0 : 1,
                  borderBottomColor: colors.border.hairline,
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.md }}>
                  <Text variant="callout" style={{ flex: 1, fontFamily: 'Inter_500Medium' }}>
                    {s.name}
                  </Text>
                  <TrustTag source={s.trust} />
                </View>
                <Text variant="caption" tone="secondary">
                  {s.provides} · Planned
                </Text>
              </View>
            ))}
          </Card>
        </Animated.View>

        <Animated.View entering={enter(3)}>
          <SectionHeader title="Privacy" />
          <Card padding="lg" style={{ gap: spacing.sm }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
              <Lock size={18} color={colors.accent.green.text} strokeWidth={2.2} />
              <Text variant="subheading">Your data</Text>
            </View>
            <Text variant="callout">
              ACCESS LA28 uses your location only to provide route recommendations. We minimize collection
              and do not sell personal location data.
            </Text>
            <Text variant="callout" tone="secondary">
              In this prototype: no location access, no accounts, no analytics, and nothing stored on a
              server. Your trip and preferences live in memory on this device and reset when the app closes.
            </Text>
          </Card>
        </Animated.View>

        <Animated.View entering={enter(4)}>
          <SectionHeader title="About" />
          <Card padding="none">
            <View style={{ padding: layout.cardPadding, gap: spacing.sm }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
                <Info size={18} color={colors.accent.blue.text} strokeWidth={2.2} />
                <Text variant="subheading">{APP_NAME}</Text>
                <Text variant="caption" tone="secondary">
                  v{version}
                </Text>
              </View>
              <Text variant="callout">
                An independent student project built for the Congressional App Challenge, CA-27.
              </Text>
              <Text variant="caption" tone="secondary">
                {DISCLAIMER}
              </Text>
            </View>
            <View style={{ borderTopWidth: 1, borderTopColor: colors.border.hairline }}>
              <SettingsRow
                Icon={Palette}
                tone="pink"
                title="Design system"
                subtitle="Components and tokens"
                onPress={() => router.push('/design-system')}
                last
              />
            </View>
          </Card>
        </Animated.View>
      </ScrollView>
    </GradientBackground>
  );
}
