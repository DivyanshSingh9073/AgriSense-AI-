/**
 * Central app configuration. Anything environment-dependent is read from
 * `import.meta.env` here ONCE, so the rest of the app never touches
 * `import.meta.env` directly.
 */
export const APP_CONFIG = {
  name: 'AgriSense AI',
  shortName: 'AgriSense',
  tagline: 'Precision Agriculture Platform',
  version: '0.1.0',
  env: import.meta.env.VITE_APP_ENV ?? 'development',
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5000/api/v1',
  isProd: import.meta.env.VITE_APP_ENV === 'production',
  supportEmail: 'support@agrisense.ai',
} as const;

/** Keys used for browser storage so they aren't scattered around as raw strings. */
export const STORAGE_KEYS = {
  theme: 'agrisense.theme',
  accessToken: 'agrisense.accessToken',
  refreshToken: 'agrisense.refreshToken',
} as const;
