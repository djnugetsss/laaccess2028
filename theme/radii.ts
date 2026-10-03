export const radii = {
  xs: 6,
  sm: 10,
  md: 14,
  lg: 16,
  xl: 20, // cards
  '2xl': 28, // sheets, hero surfaces
  full: 999,
} as const;

export type Radius = keyof typeof radii;
