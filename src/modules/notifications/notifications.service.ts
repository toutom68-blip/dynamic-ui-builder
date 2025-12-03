import axios from '@/lib/axios';
import { Notification, NotificationResponse, NotificationUpdateRequest } from './notifications.types';

const STORAGE_KEY = 'app_notifications';
const LAST_FETCH_KEY = 'notifications_last_fetch';

class NotificationService {
  // Local storage helpers
  private getFromStorage(): Notification[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  private saveToStorage(notifications: Notification[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
      localStorage.setItem(LAST_FETCH_KEY, new Date().toISOString());
    } catch (error) {
      console.error('Failed to save notifications to storage:', error);
    }
  }

  private getLastFetchTime(): Date | null {
    try {
      const stored = localStorage.getItem(LAST_FETCH_KEY);
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
  async fetchNotifications(limit = 50, offset = 0): Promise<NotificationResponse> {
    try {
      const response = await axios.get<NotificationResponse>('/notifications', {
        params: { limit, offset },
        headers: { 'x-no-loading': 'true' } // Don't show global loading for notifications
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
      const response = await axios.get<{ notifications: Notification[] }>('/notifications/new', {
        params: { since: lastFetch?.toISOString() },
        headers: { 'x-no-loading': 'true' }
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
      await axios.patch<void>('/notifications/read', {
        notificationIds,
        read: true
      } as NotificationUpdateRequest, {
        headers: { 'x-no-loading': 'true' }
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
      await axios.patch<void>('/notifications/read-all', {}, {
        headers: { 'x-no-loading': 'true' }
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
      await axios.delete(`/notifications/${notificationId}`, {
        headers: { 'x-no-loading': 'true' }
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
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(LAST_FETCH_KEY);
  }
}

export const notificationService = new NotificationService();
