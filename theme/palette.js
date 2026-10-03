/**
 * Raw color palette — the single source of truth for every color in the app.
 * Plain CommonJS so tailwind.config.js and the typed TS tokens (theme/colors.ts) share it.
 *
 * Rules:
 * - pink / green / blue are soft accents: use sparingly, mostly as tinted fills.
 * - coral is the primary action color. coral.600 is the AA-safe fill for white text (4.6:1).
 * - navy carries text and hierarchy.
 * - signal.* is reserved for data-confidence and score indicators. Never decorative.
 */
module.exports = {
  white: '#FFFFFF',

  canvas: {
    top: '#FFFFFF',
    mid: '#FBFAF8',
    bottom: '#F5F6F9',
  },

  navy: {
    950: '#0A1428',
    900: '#0E1B33', // primary text — 17:1 on white
    800: '#1A2A47',
    700: '#2B3B5C',
    600: '#45536F',
    500: '#5A667D', // secondary text — 5.8:1 on white
    450: '#636E82', // tertiary text — AA on white & sunken
    400: '#7A8599', // icons, placeholders, decorative only
    300: '#A9B1C0',
    200: '#D5DAE3',
    100: '#E9ECF2', // hairlines, tracks
    50: '#F4F6F9', // neutral fills
  },

  coral: {
    700: '#AE3D24',
    600: '#CC4A2E', // primary button fill
    500: '#EE6B4D', // brand coral — icons, highlights
    300: '#F7A994',
    100: '#FFE4DB',
    50: '#FFF3EF',
  },

  pink: {
    600: '#B23D61',
    300: '#F4B8C8',
    100: '#FBE3EA',
    50: '#FDF1F4',
  },

  green: {
    600: '#287147', // AA on green.100 (5.0:1)
    300: '#A6D9B8',
    100: '#DDF1E4',
    50: '#EFF8F2',
  },

  blue: {
    600: '#2F6AAE',
    300: '#A9CCF0',
    100: '#DCEBFA',
    50: '#EEF5FC',
  },

  // Data-confidence & score indicators ONLY.
  signal: {
    high: { solid: '#2F9E5B', soft: '#E6F5EC', text: '#1F7A45', ring: ['#5CC489', '#2F9E5B'] },
    medium: { solid: '#E0A021', soft: '#FDF4DF', text: '#8A5A00', ring: ['#F6C55A', '#E39A1E'] },
    low: { solid: '#E5533D', soft: '#FDECE8', text: '#B23A26', ring: ['#F59A7E', '#E5533D'] },
  },
};
