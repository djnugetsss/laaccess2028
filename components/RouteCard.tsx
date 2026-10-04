import {
  Accessibility,
  Car,
  ChevronDown,
  ChevronRight,
  CircleParking,
  Sparkles,
  Sun,
  type LucideIcon,
} from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { Pressable, View } from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  FadeOut,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import type { RouteFlag, RouteOption, RouteSource } from '@/lib/types';
import { colors, layout, layoutSpring, radii, shadows, spacing } from '@/theme';

import { AccessScoreRing } from './AccessScoreRing';
import { DataConfidenceBadge } from './DataConfidenceBadge';
import { Text } from './Text';
import { TrustTag } from './TrustTag';

type Props = {
  route: RouteOption & { flags?: RouteFlag[]; source?: RouteSource };
  onPress?: () => void;
  selected?: boolean;
  /** Marks the top-ranked route with a "Recommended" tag. */
  recommended?: boolean;
  /** Plain secondary line in the expanded detail, e.g. "Best for Less Walking · Accessibility". */
  highlight?: string;
  onViewDetails?: () => void;
  showConfidence?: boolean;
  /** Controlled expanded state. When omitted, the card toggles itself on press. */
  expanded?: boolean;
};

const FLAGS: Record<RouteFlag, { Icon: LucideIcon; label: string }> = {
  eventTraffic: { Icon: Car, label: 'Event traffic risk' },
  limitedParking: { Icon: CircleParking, label: 'Limited parking' },
};

/** Hero tag for non-real data. Real Mapbox routes need no tag in the collapsed card. */
const SOURCE_TAG: Partial<Record<RouteSource, string>> = {
  demo: 'Demo transit data',
  fallback: 'Estimated / demo route',
};

/** One plain sentence in the expanded detail saying exactly what's real and what isn't. */
const SOURCE_NOTE: Record<RouteSource, string> = {
  mapbox:
    'Route, distance, and time from Mapbox Directions. Accessibility, heat, and reliability are estimates.',
  demo: 'Demo transit data: stops, times, and accessibility are illustrative, not real schedules or routing.',
  fallback:
    'Couldn’t load real directions, so this is the prototype’s demo route. Times are not real.',
};

const RING_SIZE = 64;
const SELECTED_BORDER = 1.5;

function plural(n: number, word: string) {
  return `${n} ${word}${n === 1 ? '' : 's'}`;
}

/** Honest, plain-language facts. Unknown data is stated as unknown — never filled in. */
function facts(route: RouteOption) {
  const access =
    route.accessible === null
      ? 'Accessibility information unavailable'
      : route.accessible
        ? 'Step-free, based on available data'
        : 'Not step-free';

  const stairs =
    route.stairs < 0
      ? 'Stair information unavailable'
      : route.stairs === 0
        ? 'No known stairs based on available data'
        : `${plural(route.stairs, 'known stair')} on this route`;

  const exposure =
    route.outdoorExposure === null
      ? 'Outdoor exposure data unavailable'
      : `${{ low: 'Low', moderate: 'Moderate', high: 'High' }[route.outdoorExposure]} outdoor exposure`;

  return { access, stairs, exposure };
}

/**
 * Route summary built around a hero + collapsible detail.
 * Collapsed: ACCESS SCORE ring (the focal point), label, mode. Expanded: trip stats,
 * accessibility facts, data confidence, and a link to the full breakdown.
 */
export function RouteCard({
  route,
  onPress,
  selected,
  recommended,
  highlight,
  onViewDetails,
  showConfidence = true,
  expanded,
}: Props) {
  const [ownOpen, setOwnOpen] = useState(false);
  const open = expanded ?? ownOpen;

  const chevron = useSharedValue(open ? 1 : 0);
  useEffect(() => {
    chevron.value = withTiming(open ? 1 : 0, { duration: 240, easing: Easing.out(Easing.cubic) });
  }, [open, chevron]);
  const chevronStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${chevron.value * 180}deg` }],
  }));

  const handlePress = () => {
    if (expanded === undefined) setOwnOpen((v) => !v);
    onPress?.();
  };

  return (
    // Two layers: the outer one carries the shadow, the inner one clips the content while the
    // height animates. Both share the reorder spring so expand and reorder feel like one motion.
    <Animated.View
      layout={layoutSpring}
      style={[{ borderRadius: radii.xl, backgroundColor: colors.background.surface }, shadows.md]}
    >
      <Animated.View
        layout={layoutSpring}
        style={{
          borderRadius: radii.xl,
          borderCurve: 'continuous',
          overflow: 'hidden',
          borderWidth: SELECTED_BORDER,
          borderColor: selected ? colors.action.primary : 'transparent',
        }}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ selected: !!selected, expanded: open }}
          accessibilityLabel={`${recommended ? 'Recommended. ' : ''}${route.source && SOURCE_TAG[route.source] ? `${SOURCE_TAG[route.source]}. ` : ''}${route.label}. ${route.mode}. Access score ${route.totalAccessScore} out of 100.`}
          accessibilityHint={
            open ? 'Hides route details' : 'Shows route details and selects this route on the map'
          }
          onPress={handlePress}
          style={({ pressed }) => ({
            padding: layout.cardPadding - SELECTED_BORDER,
            backgroundColor: pressed ? colors.background.sunken : colors.background.surface,
          })}
        >
          {/* ─── hero ─── */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: layout.cardPadding }}>
            <AccessScoreRing score={route.totalAccessScore} size={RING_SIZE} />
            <View style={{ flex: 1, gap: spacing.xxs }}>
              {(recommended || (route.source && SOURCE_TAG[route.source])) && (
                <View
                  style={{
                    flexDirection: 'row',
                    flexWrap: 'wrap',
                    gap: spacing.xs,
                    marginBottom: spacing.xxs,
                  }}
                >
                  {recommended && <RecommendedTag />}
                  {route.source && SOURCE_TAG[route.source] && (
                    <TrustTag source="estimated" label={SOURCE_TAG[route.source]} />
                  )}
                </View>
              )}
              <Text variant="subheading" numberOfLines={1}>
                {route.label}
              </Text>
              <Text variant="callout" tone="secondary" numberOfLines={1}>
                {route.mode}
              </Text>
            </View>
            <Animated.View style={chevronStyle}>
              <ChevronDown size={20} color={colors.text.tertiary} strokeWidth={2.2} />
            </Animated.View>
          </View>

          {/* ─── detail ─── */}
          {open && (
            <Animated.View
              entering={FadeIn.duration(220).delay(60)}
              exiting={FadeOut.duration(120)}
            >
              <Detail
                route={route}
                highlight={highlight}
                showConfidence={showConfidence}
                onViewDetails={onViewDetails}
              />
            </Animated.View>
          )}
        </Pressable>
      </Animated.View>
    </Animated.View>
  );
}

function RecommendedTag() {
  return (
    <View
      style={{
        alignSelf: 'flex-start',
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xxs,
        borderRadius: radii.full,
        backgroundColor: colors.background.sunken,
      }}
    >
      <Sparkles size={11} color={colors.text.primary} strokeWidth={2.5} />
      <Text variant="overline" style={{ letterSpacing: 0.5 }}>
        Recommended
      </Text>
    </View>
  );
}

function Detail({
  route,
  highlight,
  showConfidence,
  onViewDetails,
}: Pick<Props, 'route' | 'highlight' | 'showConfidence' | 'onViewDetails'>) {
  const f = facts(route);

  return (
    <View
      style={{
        marginTop: layout.cardPadding,
        paddingTop: layout.cardPadding,
        borderTopWidth: 1,
        borderTopColor: colors.border.hairline,
        gap: layout.cardPadding,
      }}
    >
      {/* trip stats */}
      <View style={{ flexDirection: 'row' }}>
        <Stat value={`${route.durationMinutes}`} unit="min" label="Duration" />
        <Stat value={`${route.walkingMiles}`} unit="mi" label="Walking" />
        <Stat
          value={`${route.transfers}`}
          label={route.transfers === 1 ? 'Transfer' : 'Transfers'}
        />
      </View>

      {/* accessibility + exposure facts */}
      <View style={{ gap: spacing.md }}>
        <FactRow
          Icon={Accessibility}
          text={f.access}
          secondary={f.stairs}
          unknown={route.accessible === null}
        />
        <FactRow Icon={Sun} text={f.exposure} unknown={route.outdoorExposure === null} />
        {route.flags?.map((flag) => (
          <FactRow key={flag} Icon={FLAGS[flag].Icon} text={FLAGS[flag].label} />
        ))}
      </View>

      {highlight ? (
        <Text variant="caption" tone="secondary">
          {highlight}
        </Text>
      ) : null}

      {route.source && (
        <View style={{ gap: spacing.xs }}>
          <TrustTag
            source={route.source === 'mapbox' ? 'open' : 'estimated'}
            label={route.source === 'mapbox' ? 'Mapbox route data' : SOURCE_TAG[route.source]}
          />
          <Text variant="caption" tone="secondary">
            {SOURCE_NOTE[route.source]}
          </Text>
        </View>
      )}

      {(showConfidence || onViewDetails) && (
        <View
          style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}
        >
          {showConfidence ? (
            route.source && route.source !== 'mapbox' ? (
              <DataConfidenceBadge level="low" label="Demo data" />
            ) : (
              <DataConfidenceBadge level={route.dataConfidence} />
            )
          ) : (
            <View />
          )}
          {onViewDetails && (
            <Pressable
              accessibilityRole="link"
              accessibilityLabel={`View details for ${route.label}`}
              onPress={onViewDetails}
              hitSlop={10}
              style={({ pressed }) => ({
                flexDirection: 'row',
                alignItems: 'center',
                gap: spacing.xxs,
                minHeight: 32,
                opacity: pressed ? 0.6 : 1,
              })}
            >
              <Text variant="caption" style={{ fontFamily: 'Inter_600SemiBold' }}>
                View details
              </Text>
              <ChevronRight size={15} color={colors.text.primary} strokeWidth={2.4} />
            </Pressable>
          )}
        </View>
      )}
    </View>
  );
}

function Stat({ value, unit, label }: { value: string; unit?: string; label: string }) {
  return (
    <View
      accessible
      accessibilityLabel={`${label}: ${value}${unit ? ` ${unit}` : ''}`}
      style={{ flex: 1, gap: spacing.xxs }}
    >
      <Text variant="subheading" style={{ fontVariant: ['tabular-nums'] }}>
        {value}
        {unit ? (
          <Text variant="caption" tone="secondary">
            {' '}
            {unit}
          </Text>
        ) : null}
      </Text>
      <Text variant="caption" tone="tertiary">
        {label}
      </Text>
    </View>
  );
}

function FactRow({
  Icon,
  text,
  secondary,
  unknown,
}: {
  Icon: LucideIcon;
  text: string;
  secondary?: string;
  unknown?: boolean;
}) {
  return (
    <View
      accessible
      accessibilityLabel={secondary ? `${text}. ${secondary}` : text}
      style={{ flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md }}
    >
      <Icon size={16} color={colors.text.tertiary} strokeWidth={2.2} style={{ marginTop: 2 }} />
      <View style={{ flex: 1, gap: spacing.xxs }}>
        <Text variant="callout" tone={unknown ? 'secondary' : 'primary'}>
          {text}
        </Text>
        {secondary ? (
          <Text variant="caption" tone="secondary">
            {secondary}
          </Text>
        ) : null}
      </View>
    </View>
  );
}
