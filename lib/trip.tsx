import { createContext, use, useCallback, useMemo, useState, type ReactNode } from 'react';

import { DESTINATION, ORIGIN } from './mockRoutes';
import { DEFAULT_PREFERENCES } from './preferences';
import type { Place, PreferenceKey } from './types';

/** The hero demo trip. Demo transit routes exist for exactly this origin/destination. */
export const DEMO_TRIP = { from: 'Granada Hills, CA', to: 'LA28 Valley Zone' } as const;

export const DEMO_FROM_PLACE: Place = {
  name: ORIGIN.label,
  address: DEMO_TRIP.from,
  coordinate: ORIGIN.coordinate,
};
/** Fixed demo coordinates — the Valley Zone isn't a geocodable address. */
export const DEMO_TO_PLACE: Place = {
  name: DESTINATION.label,
  address: DEMO_TRIP.to,
  coordinate: DESTINATION.coordinate,
};

type TripState = {
  /** Field text. Typing clears the matching place until a suggestion is picked. */
  from: string;
  to: string;
  /** Resolved places with coordinates; null until the user picks a suggestion. */
  fromPlace: Place | null;
  toPlace: Place | null;
  /** Selected preferences, kept in selection order. */
  preferences: PreferenceKey[];
  setFrom: (text: string) => void;
  setTo: (text: string) => void;
  selectFrom: (place: Place) => void;
  selectTo: (place: Place) => void;
  swap: () => void;
  togglePreference: (key: PreferenceKey) => void;
  hasPreference: (key: PreferenceKey) => boolean;
};

const TripContext = createContext<TripState | null>(null);

/** In-memory trip state shared by Route Setup → Results → Details. No persistence yet. */
export function TripProvider({ children }: { children: ReactNode }) {
  const [from, setFromText] = useState<string>(DEMO_TRIP.from);
  const [to, setToText] = useState<string>(DEMO_TRIP.to);
  const [fromPlace, setFromPlace] = useState<Place | null>(DEMO_FROM_PLACE);
  const [toPlace, setToPlace] = useState<Place | null>(DEMO_TO_PLACE);
  const [preferences, setPreferences] = useState<PreferenceKey[]>([...DEFAULT_PREFERENCES]);

  const setFrom = useCallback((text: string) => {
    setFromText(text);
    setFromPlace((p) => (p && p.address === text ? p : null));
  }, []);
  const setTo = useCallback((text: string) => {
    setToText(text);
    setToPlace((p) => (p && p.address === text ? p : null));
  }, []);

  const selectFrom = useCallback((place: Place) => {
    setFromText(place.address);
    setFromPlace(place);
  }, []);
  const selectTo = useCallback((place: Place) => {
    setToText(place.address);
    setToPlace(place);
  }, []);

  const swap = useCallback(() => {
    setFromText(to);
    setToText(from);
    setFromPlace(toPlace);
    setToPlace(fromPlace);
  }, [from, to, fromPlace, toPlace]);

  const togglePreference = useCallback((key: PreferenceKey) => {
    setPreferences((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]));
  }, []);

  const value = useMemo<TripState>(
    () => ({
      from,
      to,
      fromPlace,
      toPlace,
      preferences,
      setFrom,
      setTo,
      selectFrom,
      selectTo,
      swap,
      togglePreference,
      hasPreference: (key) => preferences.includes(key),
    }),
    [
      from,
      to,
      fromPlace,
      toPlace,
      preferences,
      setFrom,
      setTo,
      selectFrom,
      selectTo,
      swap,
      togglePreference,
    ],
  );

  return <TripContext value={value}>{children}</TripContext>;
}

export function useTrip(): TripState {
  const ctx = use(TripContext);
  if (!ctx) throw new Error('useTrip must be used inside <TripProvider>');
  return ctx;
}
