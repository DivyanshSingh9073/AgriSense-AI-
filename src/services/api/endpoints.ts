/**
 * Backend endpoint paths, relative to `APP_CONFIG.apiBaseUrl`.
 * Feature services (e.g. `auth.service.ts`, added in a later phase) import
 * from here instead of hardcoding path strings.
 */
export const API_ENDPOINTS = {
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    logout: '/auth/logout',
    me: '/auth/me',
    refresh: '/auth/refresh',
    forgotPassword: '/auth/forgot-password',
    resetPassword: '/auth/reset-password',
    verifyEmail: '/auth/verify-email',
    resendVerification: '/auth/resend-verification',
  },
  diseaseDetection: {
    analyze: '/disease-detection/analyze',
    history: '/disease-detection/history',
  },
  cropRecommendation: {
    recommend: '/crop-recommendation/recommend',
  },
  weather: {
    current: '/weather/current',
    forecast: '/weather/forecast',
  },
  aiChat: {
    conversations: '/ai-chat/conversations',
    message: '/ai-chat/message',
  },
  reports: {
    list: '/reports',
    generate: '/reports/generate',
  },
  farms: {
    list: '/farms',
    create: '/farms',
    detail: (farmId: number | string) => `/farms/${farmId}`,
  },
  users: {
    profile: '/users/profile',
  },
} as const;
