import { ChevronRight, Sparkles } from 'lucide-react-native';
import { Pressable, View } from 'react-native';

import type { RouteFlag, RouteOption } from '@/lib/types';
import { colors, radii, shadows, spacing } from '@/theme';

import { AccessScoreRing } from './AccessScoreRing';
import { AttributePill } from './AttributePill';
import { DataConfidenceBadge } from './DataConfidenceBadge';
import { Text } from './Text';

type Props = {
  route: RouteOption & { flags?: RouteFlag[] };
  onPress?: () => void;
  selected?: boolean;
  /** Marks the top-ranked route with a "Recommended" chip. */
  recommended?: boolean;
  /** Short line under the header, e.g. "Best for Less Walking · Accessibility". */
  highlight?: string;
  onViewDetails?: () => void;
  showConfidence?: boolean;
};

const FLAG_LABELS: Record<RouteFlag, { icon: string; label: string }> = {
  eventTraffic: { icon: '🚦', label: 'Event traffic risk' },
  limitedParking: { icon: '🅿️', label: 'Limited parking' },
};

function plural(n: number, word: string) {
  return `${n} ${word}${n === 1 ? '' : 's'}`;
}

/**
 * Attribute pills in a fixed order so cards scan consistently. Unknown data is stated as
 * unknown — never filled in.
 */
function attributes(route: RouteOption) {
  const accessible =
    route.accessible === null
      ? { label: 'Accessibility information unavailable', tone: 'neutral' as const }
      : route.accessible
        ? { label: 'Step-free', tone: 'blue' as const }
        : { label: 'Not step-free', tone: 'neutral' as const };

  const stairs =
    route.stairs < 0 ? 'Stair data unavailable' : route.stairs === 0 ? 'No known stairs' : plural(route.stairs, 'stair');

  const exposure =
    route.outdoorExposure === null
      ? 'Exposure data unavailable'
      : { low: 'Low exposure', moderate: 'Moderate exposure', high: 'High exposure' }[route.outdoorExposure];

  return [
    { icon: '♿', ...accessible },
    { icon: '🚶', label: `${route.walkingMiles} mi walk`, tone: 'neutral' as const },
    { icon: '🪜', label: stairs, tone: 'neutral' as const },
    { icon: '🌡️', label: exposure, tone: 'neutral' as const },
    {
      icon: '🔄',
      label: route.transfers === 0 ? 'No transfers' : plural(route.transfers, 'transfer'),
      tone: 'neutral' as const,
    },
  ];
}

/** Route summary: label, ACCESS SCORE, duration, attribute pills, data confidence. */
export function RouteCard({
  route,
  onPress,
  selected,
  recommended,
  highlight,
  onViewDetails,
  showConfidence = true,
}: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: !!selected }}
      accessibilityLabel={`${recommended ? 'Recommended. ' : ''}${route.label}. ${route.mode}. ${route.durationMinutes} minutes. Access score ${route.totalAccessScore} out of 100.`}
      disabled={!onPress}
      onPress={onPress}
      style={({ pressed }) => [
        {
          padding: spacing.lg + 2,
          gap: spacing.lg,
          borderRadius: radii.xl,
          borderCurve: 'continuous',
          backgroundColor: colors.background.surface,
          borderWidth: selected ? 1.5 : 0.5,
          borderColor: selected ? colors.action.primary : colors.border.hairline,
          transform: [{ scale: pressed ? 0.985 : 1 }],
        },
        shadows.md,
      ]}
    >
      {/* header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
        <View style={{ flex: 1, gap: 4 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
            {recommended && (
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 4,
                  paddingHorizontal: 8,
                  paddingVertical: 3,
                  borderRadius: radii.full,
                  backgroundColor: colors.action.primarySoft,
                }}
              >
                <Sparkles size={11} color={colors.text.accent} strokeWidth={2.5} />
                <Text variant="overline" tone="accent" style={{ letterSpacing: 0.5 }}>
                  Recommended
                </Text>
              </View>
            )}
            <Text variant="overline" tone="secondary">
              {route.label}
            </Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6 }}>
            <Text variant="title" style={{ fontVariant: ['tabular-nums'] }}>
              {route.durationMinutes}
            </Text>
            <Text variant="bodyStrong" tone="secondary">
              min
            </Text>
          </View>
          <Text variant="callout" tone="secondary" numberOfLines={1}>
            {route.mode}
          </Text>
        </View>
        <AccessScoreRing score={route.totalAccessScore} size={64} />
      </View>

      {highlight ? (
        <Text variant="caption" tone="accent" style={{ marginTop: -spacing.sm }}>
          {highlight}
        </Text>
      ) : null}

      {/* attributes */}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
        {attributes(route).map((a) => (
          <AttributePill key={a.icon} icon={a.icon} label={a.label} tone={a.tone} />
        ))}
        {route.flags?.map((f) => (
          <AttributePill key={f} icon={FLAG_LABELS[f].icon} label={FLAG_LABELS[f].label} tone="pink" />
        ))}
      </View>

      {route.stairs === 0 && (
        <Text variant="caption" tone="secondary" style={{ marginTop: -spacing.sm }}>
          No known stairs based on available data.
        </Text>
      )}

      {(showConfidence || onViewDetails) && (
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderTopWidth: 1,
            borderTopColor: colors.border.hairline,
            paddingTop: spacing.md,
          }}
        >
          {showConfidence ? <DataConfidenceBadge level={route.dataConfidence} /> : <View />}
          {onViewDetails && (
            <Pressable
              accessibilityRole="link"
              accessibilityLabel={`View details for ${route.label}`}
              onPress={onViewDetails}
              hitSlop={10}
              style={({ pressed }) => ({
                flexDirection: 'row',
                alignItems: 'center',
                gap: 2,
                opacity: pressed ? 0.6 : 1,
              })}
            >
              <Text variant="caption" tone="accent" style={{ fontFamily: 'Inter_600SemiBold' }}>
                View details
              </Text>
              <ChevronRight size={15} color={colors.text.accent} strokeWidth={2.4} />
            </Pressable>
          )}
        </View>
      )}
    </Pressable>
  );
}
