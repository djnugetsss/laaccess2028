import palette from './palette';

/** Semantic color roles. Prefer these over raw palette values in components. */
export const colors = {
  palette,

  background: {
    gradient: [palette.canvas.top, palette.canvas.mid, palette.canvas.bottom] as const,
    surface: palette.white,
    sunken: palette.navy[50],
  },

  text: {
    primary: palette.navy[900],
    secondary: palette.navy[500],
    tertiary: palette.navy[450],
    inverse: palette.white,
    accent: palette.coral[700], // AA on white (6.0) and coral.50 (5.5)
  },

  border: {
    hairline: palette.navy[100],
    strong: palette.navy[200],
  },

  action: {
    primary: palette.coral[600],
    primaryPressed: palette.coral[700],
    primarySoft: palette.coral[50],
    onPrimary: palette.white,
  },

  /** Soft accent tones for selected states and tinted surfaces. */
  accent: {
    pink: { fill: palette.pink[50], strong: palette.pink[100], border: palette.pink[300], text: palette.pink[600] },
    green: { fill: palette.green[50], strong: palette.green[100], border: palette.green[300], text: palette.green[600] },
    blue: { fill: palette.blue[50], strong: palette.blue[100], border: palette.blue[300], text: palette.blue[600] },
    coral: { fill: palette.coral[50], strong: palette.coral[100], border: palette.coral[300], text: palette.coral[700] },
  },

  signal: palette.signal,
} as const;

export type AccentTone = keyof typeof colors.accent;
export type SignalLevel = keyof typeof colors.signal;
