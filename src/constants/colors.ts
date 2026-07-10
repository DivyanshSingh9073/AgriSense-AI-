/**
 * Raw hex values mirroring the CSS variables in `src/styles/globals.css`.
 *
 * Tailwind classes (e.g. `bg-primary-600`) can't be read by JS, but chart
 * libraries like Recharts need real hex/rgb strings for `fill` / `stroke`
 * props. Keep this file in sync with globals.css whenever the palette changes.
 */
export const COLORS = {
  primary: {
    50: '#EAF3EF',
    100: '#CDE4DA',
    200: '#A0CBB8',
    300: '#6FAE93',
    400: '#429173',
    500: '#2A6B54',
    600: '#1F4D3A',
    700: '#183C2D',
    800: '#122B21',
    900: '#0C1D16',
  },
  accent: {
    50: '#FBF3E3',
    100: '#F5E1B8',
    200: '#EDCB86',
    300: '#E4B559',
    400: '#DEA84C',
    500: '#D9A441',
    600: '#BE8A2E',
    700: '#966B24',
    800: '#6E4E1A',
    900: '#4A3411',
  },
  soil: {
    50: '#F3EEE8',
    100: '#E3D5C5',
    300: '#B08F6C',
    500: '#8B5E34',
    700: '#604124',
    900: '#382615',
  },
  sky: {
    50: '#EBF5F7',
    100: '#CAE4E9',
    300: '#82BBC7',
    500: '#4A90A4',
    700: '#316473',
  },
  semantic: {
    success: '#2A7A54',
    warning: '#C88A19',
    danger: '#B2342E',
    info: '#3A6FB0',
  },
} as const;

/** Ordered palette used for multi-series charts (Recharts <Line>/<Bar>/<Pie>). */
export const CHART_PALETTE = [
  COLORS.primary[600],
  COLORS.accent[500],
  COLORS.sky[500],
  COLORS.soil[500],
  COLORS.primary[300],
  COLORS.accent[300],
] as const;
