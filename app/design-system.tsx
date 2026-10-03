import { ArrowRight } from 'lucide-react-native';
import { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  AccessScoreRing,
  AttributePill,
  BackButton,
  Card,
  DataConfidenceBadge,
  Disclaimer,
  GradientBackground,
  PreferenceCard,
  PreferencePill,
  PrimaryButton,
  RouteCard,
  ScreenHeader,
  SecondaryButton,
  Text,
  TrustTag,
} from '@/components';
import { MOCK_ROUTES } from '@/lib/mockRoutes';
import { PREFERENCE_OPTIONS } from '@/lib/preferences';
import type { PreferenceKey } from '@/lib/types';
import { colors, screenPadding } from '@/theme';

/** Design-system preview for visual QA. Not linked from the app; open /design-system. */
export default function DesignSystemPreview() {
  const insets = useSafeAreaInsets();
  const [selected, setSelected] = useState<Set<PreferenceKey>>(
    () => new Set<PreferenceKey>(['accessibility', 'lessHeat']),
  );
  const toggle = (key: PreferenceKey) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });

  const [best, ...others] = MOCK_ROUTES;

  return (
    <GradientBackground>
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + 12,
          paddingBottom: insets.bottom + 32,
          paddingHorizontal: screenPadding,
          gap: 28,
        }}
        showsVerticalScrollIndicator={false}
      >
        <BackButton />
        <ScreenHeader
          eyebrow="Design system"
          title="ACCESS LA28"
          subtitle="Tokens, components, and states for the accessible games-day navigator."
        />

        {/* hero score */}
        <Card padding="lg" style={{ alignItems: 'center', gap: 16 }}>
          <AccessScoreRing score={91} size={180} />
          <View style={{ alignItems: 'center', gap: 4 }}>
            <Text variant="heading">Excellent access</Text>
            <Text variant="callout" tone="secondary" style={{ textAlign: 'center' }}>
              Step-free, shaded, one transfer.
            </Text>
          </View>
          <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap', justifyContent: 'center' }}>
            <TrustTag source="official" category="Access" />
            <TrustTag source="open" category="Heat" />
            <TrustTag source="estimated" category="Transit" />
          </View>
        </Card>

        <Section title="Score bands">
          <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
            <AccessScoreRing score={91} size={88} />
            <AccessScoreRing score={68} size={88} />
            <AccessScoreRing score={42} size={88} />
          </View>
        </Section>

        <Section title="What matters to you?">
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {PREFERENCE_OPTIONS.slice(0, 6).map((o, i) => (
              <PreferencePill
                key={o.key}
                option={o}
                selected={selected.has(o.key)}
                onToggle={() => toggle(o.key)}
                tone={(['blue', 'pink', 'green'] as const)[i % 3]}
              />
            ))}
          </View>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            {PREFERENCE_OPTIONS.slice(0, 2).map((o) => (
              <PreferenceCard
                key={o.key}
                option={o}
                selected={selected.has(o.key)}
                onToggle={() => toggle(o.key)}
              />
            ))}
          </View>
        </Section>

        <Section title="Routes">
          <RouteCard route={best} recommended selected onPress={() => {}} onViewDetails={() => {}} />
          {others.map((r) => (
            <RouteCard key={r.id} route={r} onPress={() => {}} />
          ))}
        </Section>

        <Section title="Badges & tags">
          <Card style={{ gap: 14 }}>
            <Row label="Data confidence">
              <DataConfidenceBadge level="high" />
              <DataConfidenceBadge level="medium" />
              <DataConfidenceBadge level="low" />
            </Row>
            <Row label="Trust source">
              <TrustTag source="official" />
              <TrustTag source="open" />
              <TrustTag source="estimated" />
            </Row>
            <Row label="Attributes">
              <AttributePill icon="♿" label="Step-free" tone="blue" />
              <AttributePill icon="🚶" label="0.3 mi walk" />
              <AttributePill icon="🪜" label="No stairs" />
              <AttributePill icon="🌡️" label="Low exposure" />
              <AttributePill icon="🔄" label="1 transfer" />
            </Row>
          </Card>
        </Section>

        <Section title="Surfaces">
          <View style={{ flexDirection: 'row', gap: 10 }}>
            {(['pink', 'green', 'blue'] as const).map((tone) => (
              <Card key={tone} variant="tinted" tone={tone} padding="sm" style={{ flex: 1, height: 72 }}>
                <Text variant="caption" style={{ color: colors.accent[tone].text }}>
                  {tone}
                </Text>
              </Card>
            ))}
          </View>
          <Card variant="outlined">
            <Text variant="bodyStrong">Outlined card</Text>
            <Text variant="callout" tone="secondary">
              Hairline border, no shadow — for nested or dense content.
            </Text>
          </Card>
        </Section>

        <Section title="Type scale">
          <Card style={{ gap: 6 }}>
            <Text variant="display">Display 34</Text>
            <Text variant="title">Title 28</Text>
            <Text variant="heading">Heading 20</Text>
            <Text variant="subheading">Subheading 17</Text>
            <Text variant="body">Body 16 — readable, airy, calm.</Text>
            <Text variant="caption" tone="secondary">
              Caption 13 — secondary metadata
            </Text>
            <Text variant="overline" tone="accent">
              Overline 11
            </Text>
          </Card>
        </Section>

        <View style={{ gap: 12 }}>
          <PrimaryButton
            title="Plan my route"
            trailingIcon={<ArrowRight size={18} color={colors.action.onPrimary} strokeWidth={2.4} />}
          />
          <SecondaryButton title="Change preferences" />
        </View>

        <Disclaimer />
      </ScrollView>
    </GradientBackground>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={{ gap: 12 }}>
      <Text variant="overline" tone="secondary">
        {title}
      </Text>
      {children}
    </View>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={{ gap: 8 }}>
      <Text variant="caption" tone="secondary">
        {label}
      </Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>{children}</View>
    </View>
  );
}
