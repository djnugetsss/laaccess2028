import { createContext, use, useMemo, useState, type ReactNode } from 'react';

export type TempUnit = 'F' | 'C';

type Settings = {
  tempUnit: TempUnit;
  setTempUnit: (u: TempUnit) => void;
};

const SettingsContext = createContext<Settings | null>(null);

/** App settings. In memory only — the prototype persists nothing. */
export function SettingsProvider({ children }: { children: ReactNode }) {
  const [tempUnit, setTempUnit] = useState<TempUnit>('F');
  const value = useMemo(() => ({ tempUnit, setTempUnit }), [tempUnit]);
  return <SettingsContext value={value}>{children}</SettingsContext>;
}

export function useSettings(): Settings {
  const ctx = use(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used inside <SettingsProvider>');
  return ctx;
}

/** Format a Fahrenheit value in the user's unit, e.g. "95°F" / "35°C". */
export function formatTemp(fahrenheit: number, unit: TempUnit): string {
  return unit === 'F' ? `${Math.round(fahrenheit)}°F` : `${Math.round(((fahrenheit - 32) * 5) / 9)}°C`;
}
