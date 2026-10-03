/** 4pt base scale. Mirrors Tailwind's default spacing (1 unit = 4px). */
export const spacing = {
  none: 0,
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 40,
  '5xl': 48,
} as const;

/**
 * 8pt layout rhythm. Every screen uses these for gutters, section gaps, card gaps and card
 * padding — so spacing reads the same everywhere. The 4pt steps above are only for tight
 * pairs inside a component (icon ↔ label, title ↔ caption).
 */
export const layout = {
  /** Horizontal page gutter. */
  gutter: spacing['2xl'],
  /** Between top-level sections on a screen. */
  section: spacing['3xl'],
  /** Between sibling cards, and from a section header to its content. */
  stack: spacing.lg,
  /** Inside cards and list rows. */
  cardPadding: spacing.lg,
  /** Inside hero / feature cards. */
  cardPaddingLg: spacing['2xl'],
  /** Between related inline elements. */
  inline: spacing.sm,
} as const;

/** Horizontal page gutter used by every screen. */
export const screenPadding = layout.gutter;

export type Spacing = keyof typeof spacing;
