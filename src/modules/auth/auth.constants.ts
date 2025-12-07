/**
 * Auth module constants
 */

export const AUTH_ROUTES = {
  LOGIN: '/auth',
  HOME: '/',
  SETTINGS: '/settings',
} as const;

export const AUTH_STORAGE_KEYS = {
  USER: 'user',
  TOKEN: 'token',
} as const;

export const AUTH_CONFIG = {
  JWT_RENEW_THRESHOLD_SECONDS: 300, // 5 minutes before expiry
  PASSWORD_MIN_LENGTH: 8,
  OTP_LENGTH: 6,
} as const;

export const SOCIAL_PROVIDERS = {
  GOOGLE: 'google',
  FACEBOOK: 'facebook',
  MICROSOFT: 'microsoft',
  TWITTER: 'twitter',
  GITHUB: 'github',
  APPLE: 'apple',
} as const;
