/**
 * Settings module API endpoints
 */

import { API_BASE } from '@/constants/api.constants';

export const SETTINGS_API = {
  GET_SETTINGS: API_BASE.API_SETTINGS,
  UPDATE_PREFERENCES: `${API_BASE.API_SETTINGS}/preferences`,
  UPDATE_NOTIFICATIONS: `${API_BASE.API_SETTINGS}/notifications`,
  UPDATE_ACCOUNT: `${API_BASE.API_SETTINGS}/account`,
  CHANGE_PASSWORD: `${API_BASE.API_SETTINGS}/password`,
} as const;
