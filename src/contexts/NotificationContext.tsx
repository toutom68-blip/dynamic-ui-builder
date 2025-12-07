import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { Notification } from '@/modules/notifications/notifications.types';
import { notificationService } from '@/modules/notifications/notifications.service';
import { useAuth } from '@/contexts/AuthContext';

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  refreshNotifications: () => Promise<void>;
  addNotification: (notification: Notification) => void;
}

const NotificationContext = createContext < NotificationContextType | undefined > (undefined);

const POLL_INTERVAL = 30000; // Poll every 30 seconds

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState < Notification[] > ([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState < string | null > (null);
  const pollIntervalRef = useRef < NodeJS.Timeout | null > (null);

  const unreadCount = notifications.filter(n => !n.read).length;

  // Load cached notifications on mount
  useEffect(() => {
    if (isAuthenticated) {
      const cached = notificationService.getCachedNotifications();
      if (cached.length > 0) {
        setNotifications(cached);
      }
    }
  }, [isAuthenticated]);

  // Fetch notifications from backend
  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated) return;

    setIsLoading(true);
    setError(null);

    try {
      // const response = await notificationService.fetchNotifications();
      // setNotifications(response.notifications);
    } catch (err) {
      setError('Failed to fetch notifications');
      console.error('Notification fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  // Poll for new notifications
  const pollForNewNotifications = useCallback(async () => {
    if (!isAuthenticated) return;

    try {
      // const newNotifications = await notificationService.fetchNewNotifications();
      // if (newNotifications.length > 0) {
      //   setNotifications(prev => {
      //     const existingIds = new Set(prev.map(n => n.id));
      //     const uniqueNew = newNotifications.filter(n => !existingIds.has(n.id));
      //     return [...uniqueNew, ...prev];
      //   });
      // }
    } catch (err) {
      console.error('Polling error:', err);
    }
  }, [isAuthenticated]);

  // Initial fetch and setup polling
  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();

      // Setup polling interval
      pollIntervalRef.current = setInterval(pollForNewNotifications, POLL_INTERVAL);

      return () => {
        if (pollIntervalRef.current) {
          clearInterval(pollIntervalRef.current);
        }
      };
    } else {
      // Clear notifications when logged out
      setNotifications([]);
      notificationService.clearCache();
    }
  }, [isAuthenticated, fetchNotifications, pollForNewNotifications]);

  const markAsRead = useCallback(async (id: string) => {
    // Optimistic update
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );

    try {
      await notificationService.markAsRead([id]);
    } catch (err) {
      // Revert on error
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, read: false } : n)
      );
      throw err;
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    // Optimistic update
    const previousNotifications = [...notifications];
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));

    try {
      await notificationService.markAllAsRead();
    } catch (err) {
      // Revert on error
      setNotifications(previousNotifications);
      throw err;
    }
  }, [notifications]);

  const deleteNotification = useCallback(async (id: string) => {
    // Optimistic update
    const previousNotifications = [...notifications];
    setNotifications(prev => prev.filter(n => n.id !== id));

    try {
      await notificationService.deleteNotification(id);
    } catch (err) {
      // Revert on error
      setNotifications(previousNotifications);
      throw err;
    }
  }, [notifications]);

  const refreshNotifications = useCallback(async () => {
    await fetchNotifications();
  }, [fetchNotifications]);

  // Add notification locally (for real-time events)
  const addNotification = useCallback((notification: Notification) => {
    setNotifications(prev => {
      const exists = prev.some(n => n.id === notification.id);
      if (exists) return prev;
      return [notification, ...prev];
    });
  }, []);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        isLoading,
        error,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        refreshNotifications,
        addNotification,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
