const palette = require('./theme/palette');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        canvas: palette.canvas,
        navy: palette.navy,
        coral: palette.coral,
        pink: palette.pink,
        green: palette.green,
        blue: palette.blue,
        signal: {
          high: palette.signal.high.solid,
          'high-soft': palette.signal.high.soft,
          'high-text': palette.signal.high.text,
          medium: palette.signal.medium.solid,
          'medium-soft': palette.signal.medium.soft,
          'medium-text': palette.signal.medium.text,
          low: palette.signal.low.solid,
          'low-soft': palette.signal.low.soft,
          'low-text': palette.signal.low.text,
        },
        // semantic aliases
        ink: palette.navy[900],
        muted: palette.navy[500],
        hairline: palette.navy[100],
        surface: palette.white,
      },
      fontFamily: {
        sans: ['Inter_400Regular'],
        medium: ['Inter_500Medium'],
        semibold: ['Inter_600SemiBold'],
        bold: ['Inter_700Bold'],
      },
      borderRadius: {
        xs: '6px',
        sm: '10px',
        md: '14px',
        lg: '16px',
        xl: '20px',
        '2xl': '28px',
      },
    },
  },
  plugins: [],
};
