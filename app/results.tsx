import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { ArrowRight, Info } from 'lucide-react-native';
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import {
  AccessibilityInfo,
  ScrollView,
  useWindowDimensions,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  BackButton,
  PreferencePill,
  preferenceTone,
  RouteCard,
  RouteMap,
  Text,
  TextLink,
} from '@/components';
import { SHORT_DISCLAIMER } from '@/lib/constants';
import { DESTINATION, MOCK_ROUTES, ORIGIN } from '@/lib/mockRoutes';
import { PREFERENCE_BY_KEY, ROUTE_PREFERENCE_KEYS } from '@/lib/preferences';
import { rankRoutes } from '@/lib/scoreEngine';
import { DEMO_TRIP, useTrip } from '@/lib/trip';
import type { PreferenceKey } from '@/lib/types';
import { colors, layout, layoutSpring, radii, screenPadding, shadows, spacing } from '@/theme';

/** Live reorder spring. Shared with the card expand animation so both move as one. */
const REORDER = layoutSpring;

const MAP_FRACTION = 0.5;
const SHEET_OVERLAP = 28;

export default function Results() {
  const insets = useSafeAreaInsets();
  const { height: screenH } = useWindowDimensions();
  const { from, to, preferences, togglePreference, hasPreference } = useTrip();

  const ranked = useMemo(() => rankRoutes(MOCK_ROUTES, preferences), [preferences]);
  const top = ranked[0];

  // Follow the recommended route until the user explicitly picks one.
  const [pickedId, setPickedId] = useState<string | null>(null);
  const selectedId = pickedId ?? top.route.id;

  // At most one card open at a time; all collapsed on load so scores compare at a glance.
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const onCardPress = (id: string) => {
    setPickedId(id);
    setExpandedId((open) => (open === id ? null : id));
  };

  const listRef = useRef<ScrollView>(null);
  const prevTop = useRef(top.route.id);
  useEffect(() => {
    if (prevTop.current === top.route.id) return;
    prevTop.current = top.route.id;
    listRef.current?.scrollTo({ y: 0, animated: true });
    AccessibilityInfo.announceForAccessibility(`${top.route.label} is now recommended.`);
  }, [top.route.id, top.route.label]);

  const onToggle = (key: PreferenceKey) => {
    togglePreference(key);
    setPickedId(null);
  };

  const mapHeight = screenH * MAP_FRACTION + SHEET_OVERLAP;
  const headerHeight = insets.top + 56;
  const isDemoTrip = from.trim() === DEMO_TRIP.from && to.trim() === DEMO_TRIP.to;

  return (
    <View style={{ flex: 1, backgroundColor: colors.palette.canvas.bottom }}>
      {/* ─── map ─── */}
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, height: mapHeight }}>
        <RouteMap
          routes={MOCK_ROUTES}
          selectedId={selectedId}
          origin={ORIGIN}
          destination={DESTINATION}
          onSelectRoute={setPickedId}
          insets={{ top: headerHeight, bottom: SHEET_OVERLAP }}
        />
      </View>

      {/* ─── floating header ─── */}
      <View
        pointerEvents="box-none"
        style={{
          position: 'absolute',
          top: insets.top + spacing.sm,
          left: screenPadding,
          right: screenPadding,
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing.sm,
        }}
      >
        <BackButton />
        <View
          accessible
          accessibilityLabel={`From ${from} to ${to}`}
          style={[
            {
              flex: 1,
              height: 40,
              flexDirection: 'row',
              alignItems: 'center',
              gap: spacing.sm,
              paddingHorizontal: spacing.lg,
              borderRadius: radii.full,
              backgroundColor: 'rgba(255,255,255,0.96)',
            },
            shadows.sm,
          ]}
        >
          <Text variant="caption" numberOfLines={1} style={{ flexShrink: 1, fontFamily: 'Inter_600SemiBold' }}>
            {from}
          </Text>
          <ArrowRight size={13} color={colors.text.tertiary} strokeWidth={2.4} />
          <Text variant="caption" numberOfLines={1} style={{ flexShrink: 1, fontFamily: 'Inter_600SemiBold' }}>
            {to}
          </Text>
        </View>
      </View>

      {/* ─── sheet ─── */}
      <View
        style={[
          {
            position: 'absolute',
            top: mapHeight - SHEET_OVERLAP,
            left: 0,
            right: 0,
            bottom: 0,
            borderTopLeftRadius: radii['2xl'],
            borderTopRightRadius: radii['2xl'],
            borderCurve: 'continuous',
            backgroundColor: colors.palette.canvas.mid,
          },
          shadows.lg,
        ]}
      >
        <View style={{ alignItems: 'center', paddingTop: spacing.sm }}>
          <View style={{ width: 36, height: 5, borderRadius: 3, backgroundColor: colors.border.strong }} />
        </View>

        {/* quiet header */}
        <View style={{ paddingHorizontal: screenPadding, paddingTop: spacing.sm, gap: spacing.xxs }}>
          <Text variant="subheading" accessibilityRole="header">
            {ranked.length} routes
          </Text>
          <Animated.View key={top.route.id} entering={FadeIn.duration(260)} exiting={FadeOut.duration(120)}>
            <Text variant="caption" tone="secondary">
              {preferences.length === 0 ? 'Ranked by overall ACCESS SCORE · ' : 'Ranked for your preferences · '}
              <Text variant="caption" style={{ fontFamily: 'Inter_600SemiBold' }}>
                {top.route.label}
              </Text>{' '}
              recommended
            </Text>
          </Animated.View>
          {!isDemoTrip && (
            <Text variant="caption" tone="tertiary">
              Prototype: showing demo routes for {DEMO_TRIP.from} → {DEMO_TRIP.to}.
            </Text>
          )}
        </View>

        {/* live preference bar */}
        <PreferenceScroller>
          {ROUTE_PREFERENCE_KEYS.map((key) => (
            <PreferencePill
              key={key}
              size="sm"
              option={PREFERENCE_BY_KEY[key]}
              selected={hasPreference(key)}
              onToggle={() => onToggle(key)}
              tone={preferenceTone(key)}
            />
          ))}
        </PreferenceScroller>

        {/* ranked cards */}
        <ScrollView
          ref={listRef}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: screenPadding,
            paddingTop: spacing.xs,
            paddingBottom: insets.bottom + layout.section,
            gap: layout.stack,
          }}
        >
          {ranked.map(({ route, rank, bestFor }) => (
            <Animated.View key={route.id} layout={REORDER}>
              <RouteCard
                route={route}
                recommended={rank === 1}
                selected={route.id === selectedId}
                expanded={route.id === expandedId}
                highlight={
                  bestFor.length > 0
                    ? `Best for ${bestFor
                        .slice(0, 3)
                        .map((k) => PREFERENCE_BY_KEY[k].label)
                        .join(' · ')}`
                    : undefined
                }
                onPress={() => onCardPress(route.id)}
                onViewDetails={() => router.push({ pathname: '/route-details', params: { id: route.id } })}
              />
            </Animated.View>
          ))}

          <Animated.View layout={REORDER} style={{ flexDirection: 'row', gap: spacing.sm, paddingTop: spacing.sm }}>
            <Info size={14} color={colors.text.tertiary} style={{ marginTop: 2 }} />
            <View style={{ flex: 1, gap: spacing.xs }}>
              <Text variant="caption" tone="tertiary">
                ACCESS SCORE compares these routes using available data. It is not a safety rating or
                official guidance. Route data is illustrative. {SHORT_DISCLAIMER}
              </Text>
              <TextLink title="How scoring works" onPress={() => router.push('/accessibility')} />
            </View>
          </Animated.View>
        </ScrollView>
      </View>
    </View>
  );
}

// ───────────────────────────── local pieces ─────────────────────────────

const FADE_WIDTH = 32;
const SHEET_BG = colors.palette.canvas.mid;
const SHEET_BG_CLEAR = 'rgba(251,250,248,0)'; // canvas.mid at 0 alpha

/**
 * Horizontal pill row with soft edge fades. The right fade shows while more pills are off
 * screen, the left one once you've scrolled — so it's always clear the row continues.
 */
function PreferenceScroller({ children }: { children: ReactNode }) {
  const [edges, setEdges] = useState({ start: false, end: true });

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { contentOffset, contentSize, layoutMeasurement } = e.nativeEvent;
    const start = contentOffset.x > 4;
    const end = contentOffset.x + layoutMeasurement.width < contentSize.width - 4;
    if (start !== edges.start || end !== edges.end) setEdges({ start, end });
  };

  return (
    <View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={32}
        style={{ flexGrow: 0 }}
        contentContainerStyle={{
          paddingHorizontal: screenPadding,
          paddingVertical: layout.stack,
          gap: spacing.sm,
        }}
      >
        {children}
      </ScrollView>
      <EdgeFade side="left" visible={edges.start} />
      <EdgeFade side="right" visible={edges.end} />
    </View>
  );
}

function EdgeFade({ side, visible }: { side: 'left' | 'right'; visible: boolean }) {
  const colorsLR = side === 'left' ? [SHEET_BG, SHEET_BG_CLEAR] : [SHEET_BG_CLEAR, SHEET_BG];
  return (
    <LinearGradient
      pointerEvents="none"
      colors={colorsLR as [string, string]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={{
        position: 'absolute',
        top: 0,
        bottom: 0,
        [side]: 0,
        width: FADE_WIDTH,
        opacity: visible ? 1 : 0,
      }}
    />
  );
}
