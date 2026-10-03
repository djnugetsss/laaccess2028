import { createContext, use, useCallback, useMemo, useState, type ReactNode } from 'react';

import { DEFAULT_PREFERENCES } from './preferences';
import type { PreferenceKey } from './types';

/** The hero demo trip. Mock routes are drawn for exactly this origin/destination. */
export const DEMO_TRIP = { from: 'Granada Hills, CA', to: 'LA28 Valley Zone' } as const;

type TripState = {
  from: string;
  to: string;
  /** Selected preferences, kept in selection order. */
  preferences: PreferenceKey[];
  setFrom: (v: string) => void;
  setTo: (v: string) => void;
  swap: () => void;
  togglePreference: (key: PreferenceKey) => void;
  hasPreference: (key: PreferenceKey) => boolean;
};

const TripContext = createContext<TripState | null>(null);

/** In-memory trip state shared by Route Setup → Results → Details. No persistence yet. */
export function TripProvider({ children }: { children: ReactNode }) {
  const [from, setFrom] = useState<string>(DEMO_TRIP.from);
  const [to, setTo] = useState<string>(DEMO_TRIP.to);
  const [preferences, setPreferences] = useState<PreferenceKey[]>([...DEFAULT_PREFERENCES]);

  const swap = useCallback(() => {
    setFrom(to);
    setTo(from);
  }, [from, to]);

  const togglePreference = useCallback((key: PreferenceKey) => {
    setPreferences((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]));
  }, []);

  const value = useMemo<TripState>(
    () => ({
      from,
      to,
      preferences,
      setFrom,
      setTo,
      swap,
      togglePreference,
      hasPreference: (key) => preferences.includes(key),
    }),
    [from, to, preferences, swap, togglePreference],
  );

  return <TripContext value={value}>{children}</TripContext>;
}

export function useTrip(): TripState {
  const ctx = use(TripContext);
  if (!ctx) throw new Error('useTrip must be used inside <TripProvider>');
  return ctx;
}
