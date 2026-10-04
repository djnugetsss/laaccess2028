import { router, useLocalSearchParams } from 'expo-router';
import {
  Accessibility,
  Clock,
  Footprints,
  ShieldCheck,
  Sun,
  TrainFront,
} from 'lucide-react-native';
import type { ReactNode } from 'react';
import { ScrollView, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  AccessScoreRing,
  BAND_LABEL,
  BackButton,
  Card,
  ComingSoon,
  DataConfidenceBadge,
  GradientBackground,
  Notice,
  ReasonList,
  ScoreBar,
  ScreenHeader,
  SecondaryButton,
  SectionHeader,
  Text,
  TextLink,
  TrustTag,
} from '@/components';
import { SHORT_DISCLAIMER } from '@/lib/constants';
import { scoreBand } from '@/lib/score';
import { useRouteSet } from '@/lib/routes';
import { rankRoutes, SCORE_MAX } from '@/lib/scoreEngine';
import { useTrip } from '@/lib/trip';
import type { MappedRoute, TrustLevel } from '@/lib/types';
import { colors, layout, radii, screenPadding, spacing } from '@/theme';

const SCORE_FOOTNOTE =
  'The ACCESS SCORE is a transparent route-comparison score based on walking distance, known accessibility information, transfers, estimated outdoor exposure, and route complexity. It is not an official or medical rating.';

const TRUST_DESCRIPTION: Record<TrustLevel, string> = {
  official: 'From published agency or venue information',
  open: 'From open or community datasets',
  estimated: 'Modeled estimate. Verify before relying on it',
};

const UNAVAILABLE = 'Information unavailable';

/** What the route's distance and time are based on. Real and demo are never shown alike. */
const ROUTE_SOURCE: Record<
  MappedRoute['source'],
  { tag: TrustLevel; label: string; body: string }
> = {
  mapbox: {
    tag: 'open',
    label: 'Mapbox',
    body: 'Real route, distance, and travel time from Mapbox Directions',
  },
  demo: {
    tag: 'estimated',
    label: 'Demo data',
    body: 'Demo transit data, not real schedules or routing',
  },
  fallback: {
    tag: 'estimated',
    label: 'Demo data',
    body: 'Real directions failed to load, so this is the demo route',
  },
};

const goBack = () => (router.canGoBack() ? router.back() : router.replace('/results'));

export default function RouteDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const route = useRouteSet().getRoute(id);

  if (!route) {
    return (
      <ComingSoon
        title="Route not found"
        subtitle="This route isn’t available. Go back and pick another."
      />
    );
  }
  return <Details route={route} />;
}

function Details({ route }: { route: MappedRoute }) {
  const insets = useSafeAreaInsets();
  const { preferences } = useTrip();
  const { routes } = useRouteSet();
  const rank = rankRoutes(routes, preferences).find((r) => r.route.id === route.id)?.rank;
  const real = route.source === 'mapbox';
  const source = ROUTE_SOURCE[route.source];

  const accessUnknown = route.accessible === null;
  const stairsUnknown = route.stairs < 0;

  const breakdown = [
    {
      label: 'Accessibility',
      value: route.accessibilityScore,
      max: SCORE_MAX.accessibility,
      Icon: Accessibility,
    },
    { label: 'Walking', value: route.walkingScore, max: SCORE_MAX.walking, Icon: Footprints },
    { label: 'Heat', value: route.heatScore, max: SCORE_MAX.heat, Icon: Sun },
    { label: 'Transit', value: route.transitScore, max: SCORE_MAX.transit, Icon: TrainFront },
    {
      label: 'Reliability',
      value: route.reliabilityScore,
      max: SCORE_MAX.reliability,
      Icon: Clock,
    },
  ];

  const enter = (i: number) => FadeInDown.delay(80 + i * 70).duration(420);

  return (
    <GradientBackground>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: insets.top + spacing.sm,
          paddingBottom: insets.bottom + layout.section,
          paddingHorizontal: screenPadding,
          gap: layout.section,
        }}
      >
        <View>
          <BackButton onPress={goBack} />
          <View style={{ height: layout.stack }} />
          <ScreenHeader
            eyebrow={
              rank === 1
                ? 'Recommended for your preferences'
                : rank
                  ? `#${rank} of ${routes.length} for your preferences`
                  : undefined
            }
            title={route.label}
            subtitle={`${route.mode} · ${route.durationMinutes} min`}
          />
        </View>

        {/* ─── score ─── */}
        <Animated.View entering={enter(0)}>
          <Card padding="lg" style={{ alignItems: 'center', gap: layout.stack }}>
            <AccessScoreRing score={route.totalAccessScore} size={160} />
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 6,
                paddingHorizontal: spacing.md,
                paddingVertical: 5,
                borderRadius: radii.full,
                backgroundColor: colors.signal[scoreBand(route.totalAccessScore)].soft,
              }}
            >
              <View
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: 4,
                  backgroundColor: colors.signal[scoreBand(route.totalAccessScore)].solid,
                }}
              />
              <Text
                variant="caption"
                style={{ color: colors.signal[scoreBand(route.totalAccessScore)].text }}
              >
                {capitalize(BAND_LABEL[scoreBand(route.totalAccessScore)])} score range
              </Text>
            </View>
            <View style={{ alignSelf: 'center' }}>
              <TextLink title="How scoring works" onPress={() => router.push('/accessibility')} />
            </View>
          </Card>
        </Animated.View>

        {/* ─── honest notice for unknown data ─── */}
        {(accessUnknown || stairsUnknown) && (
          <Animated.View entering={enter(1)}>
            <Notice
              tone="caution"
              title={
                accessUnknown
                  ? 'Accessibility information unavailable'
                  : 'Stair information unavailable'
              }
              body="Check official venue information before traveling."
            />
          </Animated.View>
        )}

        {/* ─── at a glance ─── */}
        <Animated.View entering={enter(2)}>
          <Section title="At a glance">
            <Card padding="none">
              <Fact
                label="Step-free access"
                value={
                  route.accessible === null
                    ? UNAVAILABLE
                    : route.accessible
                      ? 'Yes, based on available data'
                      : 'Not step-free'
                }
                unknown={route.accessible === null}
              />
              <Fact
                label="Known stairs"
                value={
                  stairsUnknown
                    ? UNAVAILABLE
                    : route.stairs === 0
                      ? 'No known stairs based on available data'
                      : `${route.stairs}`
                }
                unknown={stairsUnknown}
              />
              <Fact
                label="Walking"
                value={
                  route.walkingMiles === 0 && route.id === 'driving'
                    ? 'None in the drive · parking walk not included'
                    : `${route.walkingMiles} mi · ${route.walkingMinutes} min`
                }
              />
              <Fact
                label="Transfers"
                value={route.transfers === 0 ? 'None' : `${route.transfers}`}
              />
              <Fact
                label="Outdoor exposure"
                value={
                  route.outdoorExposure === null
                    ? 'Unavailable'
                    : `${capitalize(route.outdoorExposure)}${route.confidenceByCategory.heat === 'estimated' ? ' (estimated)' : ''}`
                }
                unknown={route.outdoorExposure === null}
              />
              <Fact
                label="Typical cost"
                value={
                  route.estimatedCostUsd === null
                    ? 'Unavailable'
                    : `≈ ${usd(route.estimatedCostUsd)}`
                }
                unknown={route.estimatedCostUsd === null}
                last
              />
            </Card>
          </Section>
        </Animated.View>

        {/* ─── breakdown ─── */}
        <Animated.View entering={enter(3)}>
          <Section
            title="Score breakdown"
            caption="Points earned in each category, out of its maximum."
          >
            <Card padding="lg" style={{ gap: layout.stack }}>
              {breakdown.map((b, i) => (
                <ScoreBar key={b.label} {...b} delay={450 + i * 110} />
              ))}
            </Card>
          </Section>
        </Animated.View>

        {/* ─── why ─── */}
        <Animated.View entering={enter(4)}>
          <Section title="Why this route?">
            <Card padding="lg">
              <ReasonList
                reasons={[
                  ...route.whyThisRoute,
                  ...(accessUnknown
                    ? ['Accessibility information unavailable for this route']
                    : []),
                ]}
              />
            </Card>
          </Section>
        </Animated.View>

        {/* ─── data confidence ─── */}
        <Animated.View entering={enter(5)}>
          <Section title="Data confidence">
            <Card padding="none">
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: layout.cardPadding,
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
                  <ShieldCheck size={18} color={colors.text.secondary} />
                  <Text variant="bodyStrong">Overall</Text>
                </View>
                {real ? (
                  <DataConfidenceBadge level={route.dataConfidence} />
                ) : (
                  <DataConfidenceBadge level="low" label="Demo data" />
                )}
              </View>
              <Source
                label="Route & travel time"
                level={source.tag}
                tagLabel={source.label}
                description={source.body}
              />
              {/* Demo routes show every category as demo — their mock values aren't sourced data. */}
              <Source
                label="Accessibility"
                level={real ? route.confidenceByCategory.accessibility : 'estimated'}
                tagLabel={real ? undefined : 'Demo data'}
              />
              <Source
                label="Heat & exposure"
                level={real ? route.confidenceByCategory.heat : 'estimated'}
                tagLabel={real ? undefined : 'Demo data'}
              />
              {!real && <Source label="Transit" level="estimated" tagLabel="Demo data" />}
            </Card>
            <Text variant="caption" tone="secondary" style={{ marginTop: layout.stack }}>
              {real
                ? 'Distance and time are real. Accessibility, heat, and reliability scores are estimates until live data is connected.'
                : 'This route uses illustrative demo data.'}{' '}
              {SCORE_FOOTNOTE}
            </Text>
          </Section>
        </Animated.View>

        <SecondaryButton title="Back to routes" onPress={goBack} />

        <Text variant="caption" tone="tertiary" style={{ textAlign: 'center' }}>
          {SHORT_DISCLAIMER}
        </Text>
      </ScrollView>
    </GradientBackground>
  );
}

// ───────────────────────────── local pieces ─────────────────────────────

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const usd = (n: number) => (Number.isInteger(n) ? `$${n}` : `$${n.toFixed(2)}`);

function Section({
  title,
  caption,
  children,
}: {
  title: string;
  caption?: string;
  children: ReactNode;
}) {
  return (
    <View>
      <SectionHeader title={title} caption={caption} />
      {children}
    </View>
  );
}

function Fact({
  label,
  value,
  unknown,
  last,
}: {
  label: string;
  value: string;
  unknown?: boolean;
  last?: boolean;
}) {
  return (
    <View
      accessible
      accessibilityLabel={`${label}: ${value}`}
      style={{
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: layout.cardPadding,
        paddingHorizontal: layout.cardPadding,
        paddingVertical: spacing.md,
        borderBottomWidth: last ? 0 : 1,
        borderBottomColor: colors.border.hairline,
      }}
    >
      <Text variant="callout" tone="secondary" style={{ width: 128 }}>
        {label}
      </Text>
      <Text
        variant="callout"
        tone={unknown ? 'secondary' : 'primary'}
        style={{
          flex: 1,
          textAlign: 'right',
          fontFamily: unknown ? 'Inter_400Regular' : 'Inter_500Medium',
        }}
      >
        {value}
      </Text>
    </View>
  );
}

function Source({
  label,
  level,
  tagLabel,
  description,
}: {
  label: string;
  level: TrustLevel;
  tagLabel?: string;
  description?: string;
}) {
  return (
    <View
      style={{
        gap: spacing.xs,
        paddingHorizontal: layout.cardPadding,
        paddingVertical: spacing.md,
        borderTopWidth: 1,
        borderTopColor: colors.border.hairline,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Text variant="callout" style={{ fontFamily: 'Inter_500Medium' }}>
          {label}
        </Text>
        <TrustTag source={level} label={tagLabel} />
      </View>
      <Text variant="caption" tone="secondary">
        {description ??
          (tagLabel === 'Demo data'
            ? 'Illustrative demo value, not sourced data'
            : TRUST_DESCRIPTION[level])}
      </Text>
    </View>
  );
}
