import type { Config } from 'tailwindcss';

/**
 * AgriSense AI design tokens.
 *
 * Palette is grounded in the subject matter rather than generic AI defaults:
 *  - primary   (canopy green)   → growth, vegetation, the "sense" in AgriSense — main brand/action color
 *  - secondary (sprout green)   → a fresher, more saturated green for secondary actions/highlights
 *  - accent    (harvest gold)   → ripeness, data highlights, premium/upsell moments
 *  - soil      (umber brown)    → earth, grounding neutral for secondary UI
 *  - sky       (muted cyan)     → weather module, atmosphere, irrigation/water
 *  - neutral   (true gray)      → chrome: borders, dropdowns, tooltips, disabled states
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
        secondary: {
          50: 'rgb(var(--color-secondary-50) / <alpha-value>)',
          100: 'rgb(var(--color-secondary-100) / <alpha-value>)',
          200: 'rgb(var(--color-secondary-200) / <alpha-value>)',
          300: 'rgb(var(--color-secondary-300) / <alpha-value>)',
          400: 'rgb(var(--color-secondary-400) / <alpha-value>)',
          500: 'rgb(var(--color-secondary-500) / <alpha-value>)',
          600: 'rgb(var(--color-secondary-600) / <alpha-value>)',
          700: 'rgb(var(--color-secondary-700) / <alpha-value>)',
          800: 'rgb(var(--color-secondary-800) / <alpha-value>)',
          900: 'rgb(var(--color-secondary-900) / <alpha-value>)',
        },
        neutral: {
          50: 'rgb(var(--color-neutral-50) / <alpha-value>)',
          100: 'rgb(var(--color-neutral-100) / <alpha-value>)',
          200: 'rgb(var(--color-neutral-200) / <alpha-value>)',
          300: 'rgb(var(--color-neutral-300) / <alpha-value>)',
          400: 'rgb(var(--color-neutral-400) / <alpha-value>)',
          500: 'rgb(var(--color-neutral-500) / <alpha-value>)',
          600: 'rgb(var(--color-neutral-600) / <alpha-value>)',
          700: 'rgb(var(--color-neutral-700) / <alpha-value>)',
          800: 'rgb(var(--color-neutral-800) / <alpha-value>)',
          900: 'rgb(var(--color-neutral-900) / <alpha-value>)',
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
      /*
       * Explicit [size, {lineHeight, letterSpacing}] pairs so type never
       * drifts out of rhythm — every heading/body size carries its own
       * vetted line-height and tracking instead of relying on defaults.
       */
      fontSize: {
        xs: ['0.75rem', { lineHeight: '1rem', letterSpacing: '0' }],
        sm: ['0.875rem', { lineHeight: '1.25rem', letterSpacing: '0' }],
        base: ['1rem', { lineHeight: '1.5rem', letterSpacing: '0' }],
        lg: ['1.125rem', { lineHeight: '1.75rem', letterSpacing: '0' }],
        xl: ['1.25rem', { lineHeight: '1.75rem', letterSpacing: '-0.005em' }],
        '2xl': ['1.5rem', { lineHeight: '2rem', letterSpacing: '-0.01em' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem', letterSpacing: '-0.015em' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem', letterSpacing: '-0.02em' }],
        '5xl': ['3rem', { lineHeight: '1.15', letterSpacing: '-0.02em' }],
        '6xl': ['3.75rem', { lineHeight: '1.1', letterSpacing: '-0.025em' }],
      },
      spacing: {
        // Filling the 4px-grid gaps Tailwind's default scale skips.
        '4.5': '1.125rem',
        '13': '3.25rem',
        '18': '4.5rem',
        '22': '5.5rem',
      },
      borderRadius: {
        sm: '0.375rem',
        md: '0.625rem',
        xl: '0.875rem',
        '2xl': '1.25rem',
        '3xl': '1.75rem',
      },
      boxShadow: {
        xs: '0 1px 2px 0 rgb(var(--color-fg) / 0.04)',
        sm: '0 1px 3px 0 rgb(var(--color-fg) / 0.06), 0 1px 2px -1px rgb(var(--color-fg) / 0.06)',
        soft: '0 2px 10px -2px rgb(var(--color-fg) / 0.06)',
        md: '0 4px 14px -4px rgb(var(--color-fg) / 0.10)',
        lg: '0 10px 24px -6px rgb(var(--color-fg) / 0.14)',
        elevated: '0 12px 32px -8px rgb(var(--color-fg) / 0.16)',
        xl: '0 20px 44px -12px rgb(var(--color-fg) / 0.20)',
        glass: '0 8px 32px -8px rgb(var(--color-fg) / 0.18)',
      },
      transitionDuration: {
        fast: '120ms',
        base: '180ms',
        slow: '280ms',
      },
      keyframes: {
        'fade-in': { from: { opacity: '0' }, to: { opacity: '1' } },
        'slide-up': {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-in': {
          from: { opacity: '0', transform: 'scale(0.96)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.2s ease-out',
        'slide-up': 'slide-up 0.25s ease-out',
        'scale-in': 'scale-in 0.15s ease-out',
        shimmer: 'shimmer 1.6s ease-in-out infinite',
      },
    },
  },
  plugins: [],
} satisfies Config;
