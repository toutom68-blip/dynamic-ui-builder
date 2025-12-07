/**
 * Notifications module constants
 */

export const NOTIFICATION_STORAGE_KEYS = {
  NOTIFICATIONS: 'app_notifications',
  LAST_FETCH: 'notifications_last_fetch',
} as const;

export const NOTIFICATION_POLLING = {
  INTERVAL_MS: 30000, // 30 seconds
  DEFAULT_LIMIT: 50,
  DEFAULT_OFFSET: 0,
} as const;

export const NOTIFICATION_TYPES = {
  INFO: 'info',
  WARNING: 'warning',
  ERROR: 'error',
  SUCCESS: 'success',
} as const;
