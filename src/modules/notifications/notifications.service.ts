import { api } from '@/lib/axios';
import { Notification, NotificationResponse, NotificationUpdateRequest } from './notifications.types';
import { NOTIFICATIONS_API } from './notifications.api';
import { NOTIFICATION_STORAGE_KEYS, NOTIFICATION_POLLING } from './notifications.constants';
import { REQUEST_HEADERS } from '@/constants/api.constants';

class NotificationService {
  // Local storage helpers
  private getFromStorage(): Notification[] {
    try {
      const stored = localStorage.getItem(NOTIFICATION_STORAGE_KEYS.NOTIFICATIONS);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  private saveToStorage(notifications: Notification[]): void {
    try {
      localStorage.setItem(NOTIFICATION_STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
      localStorage.setItem(NOTIFICATION_STORAGE_KEYS.LAST_FETCH, new Date().toISOString());
    } catch (error) {
      console.error('Failed to save notifications to storage:', error);
    }
  }

  private getLastFetchTime(): Date | null {
    try {
      const stored = localStorage.getItem(NOTIFICATION_STORAGE_KEYS.LAST_FETCH);
      return stored ? new Date(stored) : null;
    } catch {
      return null;
    }
  }

  // Get cached notifications (for immediate display)
  getCachedNotifications(): Notification[] {
    return this.getFromStorage();
  }

  // Fetch notifications from backend
  async fetchNotifications(
    limit = NOTIFICATION_POLLING.DEFAULT_LIMIT,
    offset = NOTIFICATION_POLLING.DEFAULT_OFFSET
  ): Promise<NotificationResponse> {
    try {
      const response = await api.get<NotificationResponse>(NOTIFICATIONS_API.GET_ALL, {
        params: { limit, offset },
        headers: { [REQUEST_HEADERS.NO_LOADING]: 'true' }
      });

      // Update local storage with fresh data
      this.saveToStorage(response.data.notifications);

      return response.data;
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      // Return cached data on error
      const cached = this.getFromStorage();
      return {
        notifications: cached,
        unreadCount: cached.filter(n => !n.read).length,
        totalCount: cached.length
      };
    }
  }

  // Fetch only new notifications since last fetch
  async fetchNewNotifications(): Promise<Notification[]> {
    const lastFetch = this.getLastFetchTime();

    try {
      const response = await api.get<{ notifications: Notification[] }>(NOTIFICATIONS_API.GET_NEW, {
        params: { since: lastFetch?.toISOString() },
        headers: { [REQUEST_HEADERS.NO_LOADING]: 'true' }
      });

      if (response.data.notifications.length > 0) {
        // Merge new notifications with existing ones
        const existing = this.getFromStorage();
        const newIds = new Set(response.data.notifications.map(n => n.id));
        const merged = [
          ...response.data.notifications,
          ...existing.filter(n => !newIds.has(n.id))
        ];
        this.saveToStorage(merged);
      }

      return response.data.notifications;
    } catch (error) {
      console.error('Failed to fetch new notifications:', error);
      return [];
    }
  }

  // Mark notifications as read
  async markAsRead(notificationIds: string[]): Promise<void> {
    try {
      await api.patch<void>(NOTIFICATIONS_API.MARK_READ, {
        notificationIds,
        read: true
      } as NotificationUpdateRequest, {
        headers: { [REQUEST_HEADERS.NO_LOADING]: 'true' }
      });

      // Update local storage
      const notifications = this.getFromStorage();
      const updated = notifications.map(n =>
        notificationIds.includes(n.id) ? { ...n, read: true } : n
      );
      this.saveToStorage(updated);
    } catch (error) {
      console.error('Failed to mark notifications as read:', error);
      // Still update locally for better UX
      const notifications = this.getFromStorage();
      const updated = notifications.map(n =>
        notificationIds.includes(n.id) ? { ...n, read: true } : n
      );
      this.saveToStorage(updated);
      throw error;
    }
  }

  // Mark all notifications as read
  async markAllAsRead(): Promise<void> {
    try {
      await api.patch<void>(NOTIFICATIONS_API.MARK_ALL_READ, {}, {
        headers: { [REQUEST_HEADERS.NO_LOADING]: 'true' }
      });

      // Update local storage
      const notifications = this.getFromStorage();
      const updated = notifications.map(n => ({ ...n, read: true }));
      this.saveToStorage(updated);
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
      // Still update locally
      const notifications = this.getFromStorage();
      const updated = notifications.map(n => ({ ...n, read: true }));
      this.saveToStorage(updated);
      throw error;
    }
  }

  // Delete a notification
  async deleteNotification(notificationId: string): Promise<void> {
    try {
      await api.delete(NOTIFICATIONS_API.DELETE(notificationId), {
        headers: { [REQUEST_HEADERS.NO_LOADING]: 'true' }
      });

      // Update local storage
      const notifications = this.getFromStorage();
      const updated = notifications.filter(n => n.id !== notificationId);
      this.saveToStorage(updated);
    } catch (error) {
      console.error('Failed to delete notification:', error);
      throw error;
    }
  }

  // Clear local storage cache
  clearCache(): void {
    localStorage.removeItem(NOTIFICATION_STORAGE_KEYS.NOTIFICATIONS);
    localStorage.removeItem(NOTIFICATION_STORAGE_KEYS.LAST_FETCH);
  }
}

export const notificationService = new NotificationService();
