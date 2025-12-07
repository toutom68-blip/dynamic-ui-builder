/**
 * Notifications module API endpoints
 */

import { API_BASE } from '@/constants/api.constants';

export const NOTIFICATIONS_API = {
  GET_ALL: API_BASE.NOTIFICATIONS,
  GET_NEW: `${API_BASE.NOTIFICATIONS}/new`,
  MARK_READ: `${API_BASE.NOTIFICATIONS}/read`,
  MARK_ALL_READ: `${API_BASE.NOTIFICATIONS}/read-all`,
  DELETE: (id: string) => `${API_BASE.NOTIFICATIONS}/${id}`,
} as const;
