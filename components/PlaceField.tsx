import { CircleAlert, MapPin, SearchX } from 'lucide-react-native';
import { useEffect, useState, type ReactNode } from 'react';
import { ActivityIndicator, Keyboard, Pressable, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { MapboxApiError, searchPlaces } from '@/lib/mapboxApi';
import type { Place } from '@/lib/types';
import { colors, radii, spacing } from '@/theme';

import { SearchField } from './SearchField';
import { Text } from './Text';

type Props = {
  label: string;
  value: string;
  /** The resolved place, or null while the text is unconfirmed. */
  place: Place | null;
  onChangeText: (text: string) => void;
  onSelect: (place: Place) => void;
  placeholder: string;
  icon: ReactNode;
  /** Local suggestions (e.g. demo places) shown above search results when the query matches. */
  featured?: Place[];
  /** Fired when the field gains/loses focus, so a parent can keep one dropdown open at a time. */
  onFocusChange?: (focused: boolean) => void;
};

type Status = 'idle' | 'loading' | 'done' | 'error';

const DEBOUNCE_MS = 300;
const MIN_QUERY = 2;

const matches = (p: Place, q: string) => {
  const hay = `${p.name} ${p.address}`.toLowerCase();
  return q
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .every((word) => hay.includes(word));
};

/** Address field with Mapbox autocomplete. Never throws — failures show an inline message. */
export function PlaceField({
  label,
  value,
  place,
  onChangeText,
  onSelect,
  placeholder,
  icon,
  featured = [],
  onFocusChange,
}: Props) {
  const [focused, setFocused] = useState(false);
  // The last finished search, tagged with its query; status is derived from it, never set in the effect.
  const [result, setResult] = useState<{ query: string; places: Place[]; error?: string } | null>(
    null,
  );

  const query = value.trim();
  const searching = focused && !place && query.length >= MIN_QUERY;
  const current = result?.query === query ? result : null;
  const status: Status = !searching
    ? 'idle'
    : !current
      ? 'loading'
      : current.error
        ? 'error'
        : 'done';
  const results = current?.places ?? [];

  useEffect(() => {
    if (!searching) return;
    const controller = new AbortController();
    const timer = setTimeout(() => {
      searchPlaces(query, controller.signal)
        .then((places) => setResult({ query, places }))
        .catch((e) => {
          if (controller.signal.aborted) return;
          setResult({
            query,
            places: [],
            error:
              e instanceof MapboxApiError && e.kind === 'noToken'
                ? 'Address search needs a Mapbox token.'
                : 'Couldn’t search right now. Check your connection and try again.',
          });
        });
    }, DEBOUNCE_MS);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [searching, query]);

  const local = searching ? featured.filter((p) => matches(p, query)) : [];
  const suggestions = [
    ...local.map((p) => ({ place: p, demo: true })),
    ...(status === 'done' ? results : []).map((p) => ({ place: p, demo: false })),
  ];

  const pick = (p: Place) => {
    onSelect(p);
    Keyboard.dismiss();
  };

  const setFocus = (f: boolean) => {
    setFocused(f);
    onFocusChange?.(f);
  };

  return (
    <View>
      <SearchField
        label={label}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        icon={icon}
        onFocus={() => setFocus(true)}
        onBlur={() => setFocus(false)}
        onSubmitEditing={() => suggestions[0] && pick(suggestions[0].place)}
      />

      {searching && (
        <Animated.View
          entering={FadeIn.duration(160)}
          accessibilityLiveRegion="polite"
          style={{ paddingTop: spacing.xs }}
        >
          {suggestions.map(({ place: p, demo }) => (
            <Pressable
              key={`${demo ? 'demo' : 'geo'}-${p.coordinate.join(',')}-${p.address}`}
              accessibilityRole="button"
              accessibilityLabel={`${p.address}${demo ? ', demo location' : ''}`}
              onPress={() => pick(p)}
              style={({ pressed }) => ({
                flexDirection: 'row',
                alignItems: 'center',
                gap: spacing.md,
                minHeight: 52,
                paddingHorizontal: spacing.md,
                paddingVertical: spacing.sm,
                borderRadius: radii.md,
                backgroundColor: pressed ? colors.background.sunken : 'transparent',
              })}
            >
              <MapPin size={16} color={colors.text.tertiary} strokeWidth={2.2} />
              <View style={{ flex: 1 }}>
                <Text variant="callout" numberOfLines={1} style={{ fontFamily: 'Inter_500Medium' }}>
                  {p.name}
                </Text>
                <Text variant="caption" tone="secondary" numberOfLines={1}>
                  {p.address}
                </Text>
              </View>
              {demo && (
                <Text variant="overline" tone="secondary">
                  Demo
                </Text>
              )}
            </Pressable>
          ))}

          {status === 'loading' && suggestions.length === 0 && (
            <Message
              icon={<ActivityIndicator size="small" color={colors.text.tertiary} />}
              text="Searching…"
            />
          )}
          {status === 'done' && suggestions.length === 0 && (
            <Message
              icon={<SearchX size={16} color={colors.text.tertiary} strokeWidth={2.2} />}
              text="No places found in the LA area. Try a street address or neighborhood."
            />
          )}
          {status === 'error' && (
            <Message
              icon={<CircleAlert size={16} color={colors.signal.medium.text} strokeWidth={2.2} />}
              text={current?.error ?? ''}
            />
          )}
        </Animated.View>
      )}

      {!focused && !place && query.length > 0 && (
        <Text
          variant="caption"
          tone="tertiary"
          style={{ paddingHorizontal: spacing.md, paddingTop: spacing.xs }}
        >
          Choose a suggestion to set this location.
        </Text>
      )}
    </View>
  );
}

function Message({ icon, text }: { icon: ReactNode; text: string }) {
  return (
    <View
      accessible
      accessibilityLabel={text}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        minHeight: 44,
        paddingHorizontal: spacing.md,
      }}
    >
      <View style={{ width: 16, alignItems: 'center' }}>{icon}</View>
      <Text variant="caption" tone="secondary" style={{ flex: 1 }}>
        {text}
      </Text>
    </View>
  );
}
