import { api } from '@/lib/axios';
import { UserPreferences, NotificationSettings, AccountSettings, SettingsResponse } from './settings.types';

export const settingsService = {
  async getSettings(): Promise<SettingsResponse> {
    const response = await api.get<SettingsResponse>('/api/settings');
    return response.data;
  },

  async updatePreferences(preferences: Partial<UserPreferences>): Promise<void> {
    await api.put('/api/settings/preferences', preferences);
  },

  async updateNotifications(notifications: Partial<NotificationSettings>): Promise<void> {
    await api.put('/api/settings/notifications', notifications);
  },

  async updateAccount(account: AccountSettings): Promise<void> {
    await api.put('/api/settings/account', account);
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await api.put('/api/settings/password', { currentPassword, newPassword });
  },
};
