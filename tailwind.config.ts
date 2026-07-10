import type { Config } from 'tailwindcss';

/**
 * AgriSense AI design tokens.
 *
 * Palette is grounded in the subject matter rather than generic AI defaults:
 *  - primary  (canopy green)  → growth, vegetation, the "sense" in AgriSense
 *  - accent   (harvest gold)  → ripeness, data highlights, calls to action
 *  - soil     (umber brown)   → earth, grounding neutral for secondary UI
 *  - sky      (muted cyan)    → weather module, atmosphere, irrigation/water
 *
 * All colors are defined as CSS variables in `src/styles/globals.css` using
 * "R G B" triplets so Tailwind can apply opacity modifiers, e.g. bg-primary-600/50.
 */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: 'rgb(var(--color-primary-50) / <alpha-value>)',
          100: 'rgb(var(--color-primary-100) / <alpha-value>)',
          200: 'rgb(var(--color-primary-200) / <alpha-value>)',
          300: 'rgb(var(--color-primary-300) / <alpha-value>)',
          400: 'rgb(var(--color-primary-400) / <alpha-value>)',
          500: 'rgb(var(--color-primary-500) / <alpha-value>)',
          600: 'rgb(var(--color-primary-600) / <alpha-value>)',
          700: 'rgb(var(--color-primary-700) / <alpha-value>)',
          800: 'rgb(var(--color-primary-800) / <alpha-value>)',
          900: 'rgb(var(--color-primary-900) / <alpha-value>)',
        },
        accent: {
          50: 'rgb(var(--color-accent-50) / <alpha-value>)',
          100: 'rgb(var(--color-accent-100) / <alpha-value>)',
          200: 'rgb(var(--color-accent-200) / <alpha-value>)',
          300: 'rgb(var(--color-accent-300) / <alpha-value>)',
          400: 'rgb(var(--color-accent-400) / <alpha-value>)',
          500: 'rgb(var(--color-accent-500) / <alpha-value>)',
          600: 'rgb(var(--color-accent-600) / <alpha-value>)',
          700: 'rgb(var(--color-accent-700) / <alpha-value>)',
          800: 'rgb(var(--color-accent-800) / <alpha-value>)',
          900: 'rgb(var(--color-accent-900) / <alpha-value>)',
        },
        soil: {
          50: 'rgb(var(--color-soil-50) / <alpha-value>)',
          100: 'rgb(var(--color-soil-100) / <alpha-value>)',
          300: 'rgb(var(--color-soil-300) / <alpha-value>)',
          500: 'rgb(var(--color-soil-500) / <alpha-value>)',
          700: 'rgb(var(--color-soil-700) / <alpha-value>)',
          900: 'rgb(var(--color-soil-900) / <alpha-value>)',
        },
        sky: {
          50: 'rgb(var(--color-sky-50) / <alpha-value>)',
          100: 'rgb(var(--color-sky-100) / <alpha-value>)',
          300: 'rgb(var(--color-sky-300) / <alpha-value>)',
          500: 'rgb(var(--color-sky-500) / <alpha-value>)',
          700: 'rgb(var(--color-sky-700) / <alpha-value>)',
        },
        success: 'rgb(var(--color-success) / <alpha-value>)',
        warning: 'rgb(var(--color-warning) / <alpha-value>)',
        danger: 'rgb(var(--color-danger) / <alpha-value>)',
        info: 'rgb(var(--color-info) / <alpha-value>)',
        background: 'rgb(var(--color-bg) / <alpha-value>)',
        surface: 'rgb(var(--color-surface) / <alpha-value>)',
        'surface-muted': 'rgb(var(--color-surface-muted) / <alpha-value>)',
        border: 'rgb(var(--color-border) / <alpha-value>)',
        foreground: 'rgb(var(--color-fg) / <alpha-value>)',
        'foreground-muted': 'rgb(var(--color-fg-muted) / <alpha-value>)',
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'ui-sans-serif', 'sans-serif'],
        sans: ['Inter', 'ui-sans-serif', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        xl: '0.875rem',
        '2xl': '1.25rem',
      },
      boxShadow: {
        soft: '0 2px 10px -2px rgb(var(--color-fg) / 0.06)',
        elevated: '0 12px 32px -8px rgb(var(--color-fg) / 0.16)',
      },
      keyframes: {
        'fade-in': { from: { opacity: '0' }, to: { opacity: '1' } },
        'slide-up': {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.2s ease-out',
        'slide-up': 'slide-up 0.25s ease-out',
      },
    },
  },
  plugins: [],
} satisfies Config;
