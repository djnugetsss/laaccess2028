import { Eye } from 'lucide-react-native';
import { ScrollView, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  BackButton,
  Card,
  Disclaimer,
  GradientBackground,
  Notice,
  PreferencePill,
  preferenceTone,
  ScreenHeader,
  SectionHeader,
  Text,
} from '@/components';
import { PREFERENCE_BY_KEY } from '@/lib/preferences';
import { SCORE_MAX } from '@/lib/scoreEngine';
import { useTrip } from '@/lib/trip';
import type { PreferenceKey } from '@/lib/types';
import { colors, layout, radii, screenPadding, spacing } from '@/theme';

/** Plain-language explanation of each preference. Matches lib/scoreEngine.ts behavior. */
const TOPICS: {
  pref: PreferenceKey;
  title: string;
  does: string;
  unknown: string;
}[] = [
  {
    pref: 'accessibility',
    title: 'Wheelchairs & mobility devices',
    does: 'Gives much more weight to routes with step-free access — ramps, elevators, and level or ramped boarding — where that information exists.',
    unknown: 'Routes with unknown accessibility rank below known step-free routes. We never show “Accessible” when we don’t know.',
  },
  {
    pref: 'avoidStairs',
    title: 'Stairs',
    does: 'Routes with no known stairs rank highest. Routes with known stairs rank lower the more stairs they have.',
    unknown: 'When stair data is missing, the route is treated cautiously — ranked below routes with no known stairs.',
  },
  {
    pref: 'lessWalking',
    title: 'Walking distance',
    does: 'Favors routes with less total walking, including walks to stops and from drop-off to the venue entrance.',
    unknown: 'Walking distance is estimated from the route shape and may differ from the real path.',
  },
  {
    pref: 'transit',
    title: 'Accessible transit',
    does: 'Favors routes with stronger transit connections — fewer, simpler transfers and services designed for accessible boarding.',
    unknown: 'Elevator outages and service changes happen. Check the transit agency for current status.',
  },
  {
    pref: 'lessHeat',
    title: 'Heat & shade',
    does: 'Favors routes with less time outdoors in the sun. “Prefer Shade” also favors covered stops and shaded paths.',
    unknown: 'Outdoor exposure is usually an estimate. If it’s unavailable, we say so.',
  },
];

const SCORE_ROWS = [
  { label: 'Accessibility', max: SCORE_MAX.accessibility },
  { label: 'Walking', max: SCORE_MAX.walking },
  { label: 'Heat', max: SCORE_MAX.heat },
  { label: 'Transit', max: SCORE_MAX.transit },
  { label: 'Reliability', max: SCORE_MAX.reliability },
];

export default function AccessibilityScreen() {
  const insets = useSafeAreaInsets();
  const { hasPreference, togglePreference } = useTrip();
  const enter = (i: number) => FadeInDown.delay(60 + i * 60).duration(420);

  return (
    <GradientBackground>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: insets.top + spacing.sm,
          paddingHorizontal: screenPadding,
          paddingBottom: insets.bottom + layout.section,
          gap: layout.section,
        }}
      >
        <View style={{ gap: layout.stack }}>
          <BackButton />
          <ScreenHeader
            eyebrow="How it works"
            title="Accessibility"
            subtitle="ACCESS LA28 combines available transportation and accessibility information to help users compare routes."
          />
          <View style={{ height: spacing.sm }} />
          <Notice
            tone="caution"
            title="Please verify before you go"
            body="ACCESS LA28 does not independently verify every accessibility condition. Always check official venue information before traveling."
          />
        </View>

        <Animated.View entering={enter(0)}>
          <SectionHeader title="Your preferences" caption="Used when ranking routes. Change them anytime." />
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
            {(['accessibility', 'avoidStairs', 'lessWalking', 'transit', 'lessHeat', 'preferShade'] as const).map((key) => (
              <PreferencePill
                key={key}
                option={PREFERENCE_BY_KEY[key]}
                selected={hasPreference(key)}
                onToggle={() => togglePreference(key)}
                tone={preferenceTone(key)}
              />
            ))}
          </View>
        </Animated.View>

        <Animated.View entering={enter(1)}>
          <SectionHeader title="What each preference does" />
          <View style={{ gap: layout.stack }}>
            {TOPICS.map((t) => (
              <Topic key={t.pref} {...t} />
            ))}
          </View>
        </Animated.View>

        <Animated.View entering={enter(2)}>
          <SectionHeader
            title="How the ACCESS SCORE works"
            caption="A transparent route-comparison score out of 100. It is not an official or medical rating."
          />
          <Card padding="none">
            {SCORE_ROWS.map((r, i) => (
              <View
                key={r.label}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingHorizontal: layout.cardPadding,
                  paddingVertical: spacing.md,
                  borderBottomWidth: i === SCORE_ROWS.length - 1 ? 0 : 1,
                  borderBottomColor: colors.border.hairline,
                }}
              >
                <Text variant="callout">{r.label}</Text>
                <Text variant="callout" tone="secondary" style={{ fontVariant: ['tabular-nums'] }}>
                  up to {r.max}
                </Text>
              </View>
            ))}
          </Card>
          <Text variant="caption" tone="secondary" style={{ marginTop: layout.stack }}>
            Your preferences change the order routes are recommended in — not a route’s score. Every score
            is shown with its data confidence and sources.
          </Text>
        </Animated.View>

        <Animated.View entering={enter(3)}>
          <Card variant="tinted" tone="blue" padding="lg" style={{ gap: spacing.sm }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
              <Eye size={18} color={colors.accent.blue.text} strokeWidth={2.2} />
              <Text variant="subheading" style={{ color: colors.accent.blue.text }}>
                Built to be usable by everyone
              </Text>
            </View>
            <Text variant="callout" style={{ color: colors.palette.navy[700] }}>
              Works with VoiceOver and larger text sizes. Colors are always paired with text or icons, so
              scores and data confidence never rely on color alone.
            </Text>
          </Card>
        </Animated.View>

        <Disclaimer />
      </ScrollView>
    </GradientBackground>
  );
}

function Topic({ pref: prefKey, title, does, unknown }: (typeof TOPICS)[number]) {
  const option = PREFERENCE_BY_KEY[prefKey];
  const tone = colors.accent[preferenceTone(prefKey)];
  return (
    <Card padding="md" style={{ gap: spacing.md }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
        <View
          style={{
            width: 40,
            height: 40,
            borderRadius: radii.md,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: tone.fill,
          }}
        >
          <Text style={{ fontSize: 20, lineHeight: 24 }} importantForAccessibility="no">
            {option.emoji}
          </Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text variant="subheading" accessibilityRole="header">
            {title}
          </Text>
          <Text variant="caption" style={{ color: tone.text }}>
            Preference: {option.label}
          </Text>
        </View>
      </View>
      <Text variant="callout">{does}</Text>
      <InfoLine label="If data is missing" text={unknown} />
    </Card>
  );
}

function InfoLine({ label, text }: { label: string; text: string }) {
  return (
    <Text variant="caption" tone="secondary">
      <Text variant="caption" style={{ fontFamily: 'Inter_600SemiBold', color: colors.text.secondary }}>
        {label}:{' '}
      </Text>
      {text}
    </Text>
  );
}
