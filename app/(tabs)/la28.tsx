import { router } from 'expo-router';
import {
  Accessibility,
  ArrowRight,
  Building2,
  CarFront,
  Clock,
  Landmark,
  Megaphone,
  Thermometer,
  TrainFront,
  type LucideIcon,
} from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  Card,
  Disclaimer,
  GradientBackground,
  Notice,
  PrimaryButton,
  ScreenHeader,
  SectionHeader,
  Text,
  TrustTag,
  useTabBarSpace,
  ZoneMap,
} from '@/components';
import { VALLEY_TYPICAL_SUMMER_HIGH_F, VENUE_ZONES } from '@/lib/la28Zones';
import { MOCK_ROUTES } from '@/lib/mockRoutes';
import { formatTemp, useSettings } from '@/lib/settings';
import { DEMO_FROM_PLACE, DEMO_TO_PLACE, useTrip } from '@/lib/trip';
import { colors, layout, radii, screenPadding, spacing } from '@/theme';

/** The three labels used on this page. Nothing is shown as official — we have no official feed. */
const PUBLIC_PLANS = 'Public plans';
const ESTIMATE = 'ACCESS LA28 estimate';

export default function LA28() {
  const insets = useSafeAreaInsets();
  const tabSpace = useTabBarSpace();
  const { tempUnit } = useSettings();
  const { selectFrom, selectTo } = useTrip();
  const [selectedId, setSelectedId] = useState('valley');

  const valley = VENUE_ZONES.find((z) => z.highlighted)!;
  const others = VENUE_ZONES.filter((z) => !z.highlighted);
  const fastestDemo = Math.min(...MOCK_ROUTES.map((r) => r.durationMinutes));
  const slowestDemo = Math.max(...MOCK_ROUTES.map((r) => r.durationMinutes));
  const enter = (i: number) => FadeInDown.delay(60 + i * 70).duration(450);

  const planToValley = () => {
    selectFrom(DEMO_FROM_PLACE);
    selectTo(DEMO_TO_PLACE);
    router.push('/route-setup');
  };

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
        <View style={{ gap: layout.cardPaddingLg }}>
          <ScreenHeader title="LA28" subtitle="The Games are coming to Los Angeles." />
          <Notice title="Independent project" body="Confirm details with official LA28 sources." />
        </View>

        {/* map */}
        <Animated.View entering={enter(1)}>
          <SectionHeader
            title="Venue zones"
            caption="Illustrative locations, not venue addresses."
          />
          <ZoneMap zones={VENUE_ZONES} selectedId={selectedId} onSelect={setSelectedId} />
        </Animated.View>

        {/* valley zone */}
        <Animated.View entering={enter(2)}>
          <Card padding="lg" style={{ gap: layout.stack }}>
            <View style={{ gap: spacing.sm }}>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                <TrustTag source="open" label={PUBLIC_PLANS} />
                <View
                  style={{
                    paddingHorizontal: 8,
                    paddingVertical: 3,
                    borderRadius: radii.xs,
                    backgroundColor: colors.background.sunken,
                  }}
                >
                  <Text variant="overline" tone="secondary" style={{ letterSpacing: 0.5 }}>
                    Demo destination
                  </Text>
                </View>
              </View>
              <Text variant="title">{valley.name}</Text>
              <Text variant="callout" tone="secondary">
                {valley.area}
              </Text>
            </View>

            <View style={{ gap: spacing.md }}>
              <EstimateRow
                Icon={Clock}
                text={`Demo routes from Granada Hills take about ${fastestDemo}–${slowestDemo} min.`}
              />
              <EstimateRow
                Icon={Thermometer}
                text={`Late-summer afternoons in the Valley are often around ${formatTemp(VALLEY_TYPICAL_SUMMER_HIGH_F, tempUnit)}, so heat-aware routing matters here.`}
              />
            </View>
            <TrustTag source="estimated" label={ESTIMATE} />

            <PrimaryButton
              title="Plan a route here"
              onPress={planToValley}
              trailingIcon={
                <ArrowRight size={18} color={colors.action.onPrimary} strokeWidth={2.4} />
              }
            />
          </Card>
        </Animated.View>

        {/* other zones */}
        <Animated.View entering={enter(3)}>
          <SectionHeader title="Other venue zones" caption="Tap a zone to find it on the map." />
          <Card padding="none">
            {others.map((z, i) => {
              const selected = z.id === selectedId;
              return (
                <Pressable
                  key={z.id}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  accessibilityLabel={`${z.name}, ${z.area}. Based on publicly announced plans.`}
                  onPress={() => setSelectedId(z.id)}
                  style={({ pressed }) => ({
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: spacing.md,
                    minHeight: 56,
                    paddingHorizontal: layout.cardPadding,
                    paddingVertical: spacing.md,
                    borderBottomWidth: i === others.length - 1 ? 0 : 1,
                    borderBottomColor: colors.border.hairline,
                    backgroundColor: pressed || selected ? colors.background.sunken : 'transparent',
                  })}
                >
                  <View
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: 5,
                      backgroundColor: colors.palette.navy[selected ? 900 : 300],
                    }}
                  />
                  <View style={{ flex: 1 }}>
                    <Text variant="callout" style={{ fontFamily: 'Inter_500Medium' }}>
                      {z.name}
                    </Text>
                    <Text variant="caption" tone="secondary">
                      {z.area}
                    </Text>
                  </View>
                  <TrustTag source="open" label={PUBLIC_PLANS} />
                </Pressable>
              );
            })}
          </Card>
        </Animated.View>

        {/* transportation */}
        <Animated.View entering={enter(4)}>
          <SectionHeader title="Getting around" />
          <Card padding="lg" style={{ gap: spacing.md }}>
            <TrustTag source="estimated" label="General guidance" />
            <EstimateRow
              Icon={CarFront}
              text="Large events usually mean heavier traffic and limited parking near venues."
            />
            <EstimateRow
              Icon={TrainFront}
              text="Transit can avoid parking, but transfers and waits add time. Compare routes first."
            />
            <EstimateRow
              Icon={Megaphone}
              text="Any event-specific transit or road plans will come from official sources. Check them closer to the Games."
            />
          </Card>
        </Animated.View>

        {/* accessibility resources */}
        <Animated.View entering={enter(5)}>
          <SectionHeader
            title="Accessibility resources"
            caption="Where to check official, up-to-date information."
          />
          <Card padding="lg" style={{ gap: spacing.md }}>
            <EstimateRow
              Icon={Landmark}
              text="LA28 publishes official venue and accessibility information."
            />
            <EstimateRow
              Icon={TrainFront}
              text="LA Metro shares accessible service and station elevator status."
            />
            <EstimateRow
              Icon={Accessibility}
              text="Access Services is LA County’s ADA paratransit provider."
            />
            <EstimateRow
              Icon={Building2}
              text="Venue operators handle accessible entrances, seating, and assistance."
            />
            <Text variant="caption" tone="secondary">
              ACCESS LA28 links you to these sources by name only and doesn’t speak for them.
            </Text>
          </Card>
        </Animated.View>

        {/* legend */}
        <Animated.View entering={enter(0)}>
          <SectionHeader title="About these labels" />
          <Card padding="none">
            <LegendRow
              tag={<TrustTag source="official" label="Official LA28 information" />}
              body="None shown. This prototype has no official LA28 data feed."
            />
            <LegendRow
              tag={<TrustTag source="open" label="Based on publicly announced plans" />}
              body="General venue areas from public announcements. Plans can change."
            />
            <LegendRow
              tag={<TrustTag source="estimated" label={ESTIMATE} />}
              body="Our own estimates and general guidance, not official."
              last
            />
          </Card>
        </Animated.View>

        <Disclaimer />
      </ScrollView>
    </GradientBackground>
  );
}

function LegendRow({ tag, body, last }: { tag: React.ReactNode; body: string; last?: boolean }) {
  return (
    <View
      style={{
        gap: spacing.sm,
        padding: layout.cardPadding,
        borderBottomWidth: last ? 0 : 1,
        borderBottomColor: colors.border.hairline,
      }}
    >
      {tag}
      <Text variant="caption" tone="secondary">
        {body}
      </Text>
    </View>
  );
}

function EstimateRow({ Icon, text }: { Icon: LucideIcon; text: string }) {
  return (
    <View style={{ flexDirection: 'row', gap: spacing.md, alignItems: 'flex-start' }}>
      <View
        style={{
          width: 30,
          height: 30,
          borderRadius: radii.sm,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: colors.background.sunken,
        }}
      >
        <Icon size={16} color={colors.text.secondary} strokeWidth={2.2} />
      </View>
      <Text variant="callout" style={{ flex: 1, paddingTop: 4 }}>
        {text}
      </Text>
    </View>
  );
}
