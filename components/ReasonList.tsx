import {
  Accessibility,
  ArrowLeftRight,
  Bus,
  Car,
  Check,
  Clock,
  Footprints,
  Sun,
  TriangleAlert,
  type LucideIcon,
} from 'lucide-react-native';
import { View } from 'react-native';

import { colors, radii, spacing } from '@/theme';

import { Text } from './Text';

/** Keyword → icon. First match wins, so order from most to least specific. */
const ICON_RULES: [RegExp, LucideIcon][] = [
  [/traffic|parking|drive|car\b/i, Car],
  [/transfer/i, ArrowLeftRight],
  [/stair|ramp|elevator|step|level boarding|low-floor|accessible/i, Accessibility],
  [/walk|on foot|\bft\b|\bmi\b/i, Footprints],
  [/shade|heat|sun|outdoor|exposure/i, Sun],
  [/bus|shuttle|line|train|rail|station/i, Bus],
  [/time|fast|minute|door-to-door/i, Clock],
];

/** Reasons that describe a downside get a caution style instead of a check. */
const CAUTION = /delay|risk|can add|waiting|limited|unavailable|longer|more time/i;

export function reasonIcon(text: string): LucideIcon {
  return ICON_RULES.find(([re]) => re.test(text))?.[1] ?? Check;
}

export function isCaution(text: string): boolean {
  return CAUTION.test(text);
}

/** Bulleted "why" reasons, each with a small matching icon tile. */
export function ReasonList({ reasons }: { reasons: readonly string[] }) {
  return (
    <View style={{ gap: spacing.md }}>
      {reasons.map((reason) => {
        const caution = isCaution(reason);
        const Icon = caution ? TriangleAlert : reasonIcon(reason);
        const tone = caution ? colors.accent.pink : colors.accent.green;
        return (
          <View key={reason} style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
            <View
              style={{
                width: 32,
                height: 32,
                borderRadius: radii.sm,
                borderCurve: 'continuous',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: tone.fill,
              }}
            >
              <Icon size={16} color={tone.text} strokeWidth={2.2} />
            </View>
            <Text variant="callout" style={{ flex: 1 }}>
              {caution ? <Text variant="callout" tone="secondary">Heads up: </Text> : null}
              {reason}
            </Text>
          </View>
        );
      })}
    </View>
  );
}
