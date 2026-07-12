/**
 * Single source of truth for every path in the app. Import ROUTES instead of
 * hardcoding path strings, so a route can be renamed in one place.
 *
 * Nested objects group routes by area (auth, dashboard, ...) purely for
 * readability — the values are still flat, absolute paths.
 */
export const ROUTES = {
  home: '/',
  /** Internal, unlinked design-system gallery — not part of the product IA. */
  showcase: '/showcase',

  auth: {
    login: '/login',
    register: '/register',
    forgotPassword: '/forgot-password',
    resetPassword: '/reset-password',
    verifyEmail: '/verify-email',
  },

  dashboard: {
    root: '/dashboard',
    farmManagement: '/dashboard/farm-management',
    diseaseDetection: '/dashboard/disease-detection',
    cropRecommendation: '/dashboard/crop-recommendation',
    weather: '/dashboard/weather',
    aiChat: '/dashboard/ai-chat',
    reports: '/dashboard/reports',
    profile: '/dashboard/profile',
    settings: '/dashboard/settings',
  },

  notFound: '*',
  forbidden: '/403',
  serverError: '/500',
} as const;
