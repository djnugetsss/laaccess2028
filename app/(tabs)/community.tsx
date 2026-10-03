import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { ChevronRight, MapPin } from 'lucide-react-native';
import { Pressable, ScrollView, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Text as SvgText } from 'react-native-svg';

import {
  Card,
  Disclaimer,
  GradientBackground,
  ScreenHeader,
  SectionHeader,
  Text,
  TrustTag,
  useTabBarSpace,
} from '@/components';
import { COMMUNITY_AREAS, VALLEY_TONES, type CommunityArea } from '@/lib/community';
import { MOCK_ROUTES } from '@/lib/mockRoutes';
import { PREFERENCE_OPTIONS } from '@/lib/preferences';
import { SCORE_MAX } from '@/lib/scoreEngine';
import { useTrip } from '@/lib/trip';
import { colors, radii, screenPadding, shadows, spacing } from '@/theme';

export default function Community() {
  const insets = useSafeAreaInsets();
  const tabSpace = useTabBarSpace();
  const { setFrom } = useTrip();
  const enter = (i: number) => FadeInDown.delay(60 + i * 70).duration(450);

  const planFrom = (area: CommunityArea) => {
    setFrom(`${area.name}, CA`);
    router.push('/route-setup');
  };

  return (
    <GradientBackground>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: insets.top + spacing.lg,
          paddingHorizontal: screenPadding,
          paddingBottom: tabSpace,
          gap: spacing['2xl'],
        }}
      >
        <ScreenHeader title="Your LA" subtitle="ACCESS LA28 was designed around the people who live here." />

        {/* banner */}
        <Animated.View entering={enter(0)} style={{ marginTop: -spacing.xl }}>
          <View style={[{ borderRadius: radii['2xl'], borderCurve: 'continuous', overflow: 'hidden' }, shadows.md]}>
            <LinearGradient
              colors={[colors.palette.pink[100], colors.palette.green[50], colors.palette.blue[100]]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ padding: spacing.xl, gap: spacing.sm }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
                <MapPin size={18} color={colors.text.primary} strokeWidth={2.4} />
                <Text variant="overline" style={{ color: colors.text.primary }}>
                  California · District 27
                </Text>
              </View>
              <Text variant="title" accessibilityRole="header">
                You’re in CA-27.
              </Text>
              <Text variant="callout" style={{ color: colors.palette.navy[700] }}>
                Communities across the San Fernando, Santa Clarita, and Antelope Valleys.
              </Text>
              <Text variant="caption" style={{ color: colors.palette.navy[600] }}>
                Prototype setting — ACCESS LA28 doesn’t use your location.
              </Text>
            </LinearGradient>
          </View>
        </Animated.View>

        {/* three valleys graphic */}
        <Animated.View entering={enter(1)}>
          <SectionHeader title="Three valleys, one district" />
          <Card padding="md" style={{ gap: spacing.sm }}>
            <ValleysGraphic />
            <Text variant="caption" tone="secondary" style={{ textAlign: 'center' }}>
              Illustrative — not a district map or to scale.
            </Text>
          </Card>
        </Animated.View>

        {/* local areas */}
        <Animated.View entering={enter(2)}>
          <SectionHeader
            title="Local areas"
            caption="Among the CA-27 communities across the San Fernando Valley, Santa Clarita Valley, and Antelope Valley."
          />
          <View style={{ gap: spacing.md }}>
            {COMMUNITY_AREAS.map((area) => (
              <AreaCard key={area.id} area={area} onPlan={() => planFrom(area)} />
            ))}
          </View>
        </Animated.View>

        {/* local impact */}
        <Animated.View entering={enter(3)}>
          <SectionHeader title="Built for local trips" caption="What the prototype does for a trip like Granada Hills → Valley Zone." />
          <LocalImpact />
        </Animated.View>

        <Disclaimer />
      </ScrollView>
    </GradientBackground>
  );
}

function AreaCard({ area, onPlan }: { area: CommunityArea; onPlan: () => void }) {
  const tone = colors.accent[VALLEY_TONES[area.valley]];
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${area.name}, ${area.valley}. ${area.note}`}
      accessibilityHint="Plans a route starting here"
      onPress={onPlan}
      style={({ pressed }) => [
        {
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing.md,
          padding: spacing.lg,
          borderRadius: radii.xl,
          borderCurve: 'continuous',
          backgroundColor: colors.background.surface,
          borderWidth: 0.5,
          borderColor: colors.border.hairline,
          transform: [{ scale: pressed ? 0.985 : 1 }],
        },
        shadows.sm,
      ]}
    >
      <View style={{ width: 6, alignSelf: 'stretch', borderRadius: 3, backgroundColor: tone.border }} />
      <View style={{ flex: 1, gap: 4 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: spacing.sm }}>
          <Text variant="subheading">{area.name}</Text>
          {area.isDemoOrigin && (
            <View
              style={{
                paddingHorizontal: 7,
                paddingVertical: 2,
                borderRadius: radii.full,
                backgroundColor: colors.action.primarySoft,
              }}
            >
              <Text variant="overline" tone="accent" style={{ letterSpacing: 0.4 }}>
                Demo start
              </Text>
            </View>
          )}
        </View>
        <Text variant="caption" style={{ color: tone.text }}>
          {area.valley}
        </Text>
        <Text variant="caption" tone="secondary">
          {area.note}
        </Text>
      </View>
      <View style={{ alignItems: 'center', gap: 2 }}>
        <ChevronRight size={18} color={colors.text.tertiary} />
      </View>
    </Pressable>
  );
}

/** Three soft overlapping circles — the district's three valleys. Decorative + labeled. */
function ValleysGraphic() {
  const { pink, green, blue, navy } = colors.palette;
  return (
    <View
      accessible
      accessibilityLabel="Illustration: San Fernando Valley, Santa Clarita Valley, and Antelope Valley, overlapping."
    >
      <Svg width="100%" height={180} viewBox="0 0 320 180">
        <Circle cx="110" cy="112" r="62" fill={pink[100]} opacity={0.9} />
        <Circle cx="168" cy="72" r="56" fill={green[100]} opacity={0.85} />
        <Circle cx="222" cy="112" r="62" fill={blue[100]} opacity={0.85} />
        <SvgText x="92" y="128" fontSize="11" fontFamily="Inter_600SemiBold" fill={pink[600]} textAnchor="middle">
          San Fernando
        </SvgText>
        <SvgText x="168" y="54" fontSize="11" fontFamily="Inter_600SemiBold" fill={green[600]} textAnchor="middle">
          Santa Clarita
        </SvgText>
        <SvgText x="240" y="128" fontSize="11" fontFamily="Inter_600SemiBold" fill={blue[600]} textAnchor="middle">
          Antelope
        </SvgText>
        <Circle cx="166" cy="102" r="5" fill={navy[900]} />
        <Circle cx="166" cy="102" r="10" fill={navy[900]} opacity={0.12} />
      </Svg>
    </View>
  );
}

/** Stats derived from the prototype itself — true by construction, labeled illustrative. */
function LocalImpact() {
  const walk = MOCK_ROUTES.map((r) => ({ label: r.label, miles: r.walkingMiles }));
  const maxWalk = Math.max(...walk.map((w) => w.miles));
  const minWalk = Math.min(...walk.map((w) => w.miles));
  const stats = [
    { value: `${MOCK_ROUTES.length}`, label: 'routes compared per trip' },
    { value: `${Object.keys(SCORE_MAX).length}`, label: 'factors in every ACCESS SCORE' },
    { value: `${PREFERENCE_OPTIONS.length}`, label: 'preferences to rank by' },
  ];

  return (
    <Card padding="lg" style={{ gap: spacing.xl }}>
      <TrustTag source="estimated" label="Illustrative · prototype demo data" />

      <View style={{ flexDirection: 'row', gap: spacing.sm }}>
        {stats.map((s) => (
          <View
            key={s.label}
            accessible
            accessibilityLabel={`${s.value} ${s.label}`}
            style={{
              flex: 1,
              padding: spacing.md,
              gap: 2,
              borderRadius: radii.lg,
              backgroundColor: colors.background.sunken,
            }}
          >
            <Text variant="title" style={{ fontVariant: ['tabular-nums'] }}>
              {s.value}
            </Text>
            <Text variant="caption" tone="secondary">
              {s.label}
            </Text>
          </View>
        ))}
      </View>

      <View style={{ gap: spacing.md }}>
        <Text variant="callout" style={{ fontFamily: 'Inter_500Medium' }}>
          Walking on each demo route
        </Text>
        {walk.map((w) => (
          <View
            key={w.label}
            accessible
            accessibilityLabel={`${w.label}: ${w.miles} miles of walking`}
            style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}
          >
            <Text variant="caption" tone="secondary" style={{ width: 104 }}>
              {w.label}
            </Text>
            <View style={{ flex: 1, height: 8, borderRadius: 4, backgroundColor: colors.palette.navy[50] }}>
              <View
                style={{
                  width: `${(w.miles / maxWalk) * 100}%`,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: colors.palette.blue[300],
                }}
              />
            </View>
            <Text variant="caption" style={{ width: 44, textAlign: 'right', fontVariant: ['tabular-nums'] }}>
              {w.miles} mi
            </Text>
          </View>
        ))}
        <Text variant="caption" tone="secondary">
          The lowest-walking demo route walks {Math.round(maxWalk / minWalk)}× less than the most walking-heavy one.
        </Text>
      </View>
    </Card>
  );
}
