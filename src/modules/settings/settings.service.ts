import { api } from '@/lib/axios';
import { UserPreferences, NotificationSettings, AccountSettings, SettingsResponse } from './settings.types';
import { SETTINGS_API } from './settings.api';

export const settingsService = {
  async getSettings(): Promise<SettingsResponse> {
    const response = await api.get<SettingsResponse>(SETTINGS_API.GET_SETTINGS);
    return response.data;
  },

  async updatePreferences(preferences: Partial<UserPreferences>): Promise<void> {
    await api.put(SETTINGS_API.UPDATE_PREFERENCES, preferences);
  },

  async updateNotifications(notifications: Partial<NotificationSettings>): Promise<void> {
    await api.put(SETTINGS_API.UPDATE_NOTIFICATIONS, notifications);
  },

  async updateAccount(account: AccountSettings): Promise<void> {
    await api.put(SETTINGS_API.UPDATE_ACCOUNT, account);
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await api.put(SETTINGS_API.CHANGE_PASSWORD, { currentPassword, newPassword });
  },
};
