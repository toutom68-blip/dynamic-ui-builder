export interface UserPreferences {
  language: string;
  theme: string;
  dateFormat: string;
  timezone: string;
}

export interface NotificationSettings {
  emailNotifications: boolean;
  pushNotifications: boolean;
  marketingEmails: boolean;
  securityAlerts: boolean;
  weeklyDigest: boolean;
}

export interface AccountSettings {
  email: string;
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
}

export interface SettingsResponse {
  preferences: UserPreferences;
  notifications: NotificationSettings;
  account: {
    email: string;
  };
}
