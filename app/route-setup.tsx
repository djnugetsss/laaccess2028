import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { ArrowRight, ArrowUpDown, MapPin } from 'lucide-react-native';
import { useState } from 'react';
import { KeyboardAvoidingView, Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  BackButton,
  Card,
  GradientBackground,
  PlaceField,
  PreferenceCard,
  PrimaryButton,
  preferenceTone,
  ScreenHeader,
  Text,
  TextLink,
} from '@/components';
import { PREFERENCE_BY_KEY, ROUTE_PREFERENCE_KEYS } from '@/lib/preferences';
import { DEMO_FROM_PLACE, DEMO_TO_PLACE, useTrip } from '@/lib/trip';
import { colors, layout, screenPadding, shadows, spacing } from '@/theme';

const DEMO_PLACES = [DEMO_FROM_PLACE, DEMO_TO_PLACE];

/** Field height (SearchField) + card padding, so the swap button sits between the two fields. */
const SWAP_TOP = spacing.sm + 58 + spacing.xs - 18;

/** Pair items into rows of two for the grid. */
const rows = <T,>(items: readonly T[]) =>
  Array.from({ length: Math.ceil(items.length / 2) }, (_, i) => items.slice(i * 2, i * 2 + 2));

export default function RouteSetup() {
  const insets = useSafeAreaInsets();
  const {
    from,
    to,
    fromPlace,
    toPlace,
    setFrom,
    setTo,
    selectFrom,
    selectTo,
    swap,
    preferences,
    togglePreference,
    hasPreference,
  } = useTrip();
  const [editing, setEditing] = useState<'from' | 'to' | null>(null);
  const canSearch = !!fromPlace && !!toPlace;
  // The swap button floats between the fields, so hide it whenever a dropdown or hint shifts them.
  const showSwap = editing === null && (!!fromPlace || from.trim().length === 0);

  return (
    <GradientBackground>
      <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }}>
        <ScrollView
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingTop: insets.top + spacing.sm,
            paddingHorizontal: screenPadding,
            paddingBottom: 140 + insets.bottom,
          }}
        >
          <BackButton />
          <View style={{ height: layout.stack }} />
          <ScreenHeader
            title="Plan a Route"
            subtitle="Tell us where you’re going and what matters most."
          />
          <View style={{ height: layout.section }} />

          {/* from / to */}
          <Card padding="sm" style={{ gap: spacing.sm }}>
            <PlaceField
              label="From"
              value={from}
              place={fromPlace}
              onChangeText={setFrom}
              onSelect={selectFrom}
              featured={DEMO_PLACES}
              onFocusChange={(f) => setEditing(f ? 'from' : null)}
              placeholder="Search an address or place"
              icon={
                <View
                  style={{
                    width: 14,
                    height: 14,
                    borderRadius: 7,
                    borderWidth: 3.5,
                    borderColor: colors.text.primary,
                  }}
                />
              }
            />
            <PlaceField
              label="To"
              value={to}
              place={toPlace}
              onChangeText={setTo}
              onSelect={selectTo}
              featured={DEMO_PLACES}
              onFocusChange={(f) => setEditing(f ? 'to' : null)}
              placeholder="Search an address or place"
              icon={<MapPin size={20} color={colors.action.primary} strokeWidth={2.4} />}
            />
            {showSwap && (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Swap start and destination"
                onPress={swap}
                hitSlop={6}
                style={({ pressed }) => [
                  {
                    position: 'absolute',
                    right: spacing.xl,
                    top: SWAP_TOP,
                    width: 36,
                    height: 36,
                    borderRadius: 18,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: colors.background.surface,
                    borderWidth: 1,
                    borderColor: colors.border.hairline,
                    transform: [{ scale: pressed ? 0.92 : 1 }],
                  },
                  shadows.sm,
                ]}
              >
                <ArrowUpDown size={16} color={colors.text.primary} strokeWidth={2.2} />
              </Pressable>
            )}
          </Card>

          {/* preferences */}
          <View style={{ marginTop: layout.section, marginBottom: layout.stack, gap: spacing.xs }}>
            <Text variant="heading" accessibilityRole="header">
              What matters to you?
            </Text>
            <Text variant="callout" tone="secondary">
              Pick as many as you like. We’ll rank routes around them.
            </Text>
            <TextLink
              title="What each preference does"
              onPress={() => router.push('/accessibility')}
            />
          </View>

          <View style={{ gap: spacing.md }}>
            {rows(ROUTE_PREFERENCE_KEYS).map((row) => (
              <View key={row.join()} style={{ flexDirection: 'row', gap: spacing.md }}>
                {row.map((key) => (
                  <PreferenceCard
                    key={key}
                    option={PREFERENCE_BY_KEY[key]}
                    selected={hasPreference(key)}
                    onToggle={() => togglePreference(key)}
                    tone={preferenceTone(key)}
                  />
                ))}
              </View>
            ))}
          </View>
        </ScrollView>

        {/* sticky footer */}
        <View
          pointerEvents="box-none"
          style={{ position: 'absolute', left: 0, right: 0, bottom: 0 }}
        >
          <LinearGradient
            colors={['rgba(245,246,249,0)', 'rgba(245,246,249,0.96)', colors.palette.canvas.bottom]}
            locations={[0, 0.35, 1]}
            style={{
              paddingTop: spacing['2xl'],
              paddingHorizontal: screenPadding,
              paddingBottom: Math.max(insets.bottom, spacing.lg),
              gap: spacing.sm,
            }}
          >
            <PrimaryButton
              title="Find Routes"
              disabled={!canSearch}
              onPress={() => router.push('/results')}
              trailingIcon={
                <ArrowRight size={18} color={colors.action.onPrimary} strokeWidth={2.4} />
              }
            />
            <Text variant="caption" tone="secondary" style={{ textAlign: 'center' }}>
              {!canSearch
                ? 'Choose a suggestion for both From and To'
                : preferences.length === 0
                  ? 'No preferences — routes ranked by overall ACCESS SCORE'
                  : `${preferences.length} preference${preferences.length === 1 ? '' : 's'} selected`}
            </Text>
          </LinearGradient>
        </View>
      </KeyboardAvoidingView>
    </GradientBackground>
  );
}
