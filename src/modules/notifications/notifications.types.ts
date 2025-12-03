export interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: 'info' | 'success' | 'warning' | 'error';
  actionUrl?: string;
  metadata?: Record<string, any>;
}

export interface NotificationResponse {
  notifications: Notification[];
  unreadCount: number;
  totalCount: number;
}

export interface NotificationUpdateRequest {
  notificationIds: string[];
  read: boolean;
}
