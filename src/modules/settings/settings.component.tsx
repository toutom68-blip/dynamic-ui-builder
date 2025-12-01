import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MainLayout } from '@/modules/shared/layout/MainLayout';
import { DynamicForm } from '@/modules/shared/components/DynamicForm';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { settingsService } from './settings.service';
import { UserPreferences, NotificationSettings, AccountSettings } from './settings.types';
import { LANGUAGE_OPTIONS, THEME_OPTIONS, DATE_FORMAT_OPTIONS, TIMEZONE_OPTIONS } from './settings.constants';
import { DynamicFormField } from '@/types/component.types';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

export const Settings: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [notifications, setNotifications] = useState<NotificationSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const data = await settingsService.getSettings();
      setPreferences(data.preferences);
      setNotifications(data.notifications);
    } catch (error) {
      toast.error(t('settings.loadError'));
    } finally {
      setLoading(false);
    }
  };

  const preferencesFields: DynamicFormField[] = [
    {
      name: 'language',
      label: t('settings.preferences.language'),
      fieldType: 'select',
      options: LANGUAGE_OPTIONS,
      defaultValue: preferences?.language || 'en',
      required: true,
    },
    {
      name: 'theme',
      label: t('settings.preferences.theme'),
      fieldType: 'select',
      options: THEME_OPTIONS,
      defaultValue: preferences?.theme || 'system',
      required: true,
    },
    {
      name: 'dateFormat',
      label: t('settings.preferences.dateFormat'),
      fieldType: 'select',
      options: DATE_FORMAT_OPTIONS,
      defaultValue: preferences?.dateFormat || 'MM/DD/YYYY',
      required: true,
    },
    {
      name: 'timezone',
      label: t('settings.preferences.timezone'),
      fieldType: 'select',
      options: TIMEZONE_OPTIONS,
      defaultValue: preferences?.timezone || 'UTC',
      required: true,
    },
  ];

  const notificationsFields: DynamicFormField[] = [
    {
      name: 'emailNotifications',
      label: t('settings.notifications.emailNotifications'),
      fieldType: 'checkbox',
      defaultValue: notifications?.emailNotifications || false,
    },
    {
      name: 'pushNotifications',
      label: t('settings.notifications.pushNotifications'),
      fieldType: 'checkbox',
      defaultValue: notifications?.pushNotifications || false,
    },
    {
      name: 'marketingEmails',
      label: t('settings.notifications.marketingEmails'),
      fieldType: 'checkbox',
      defaultValue: notifications?.marketingEmails || false,
    },
    {
      name: 'securityAlerts',
      label: t('settings.notifications.securityAlerts'),
      fieldType: 'checkbox',
      defaultValue: notifications?.securityAlerts || true,
    },
    {
      name: 'weeklyDigest',
      label: t('settings.notifications.weeklyDigest'),
      fieldType: 'checkbox',
      defaultValue: notifications?.weeklyDigest || false,
    },
  ];

  const accountFields: DynamicFormField[] = [
    {
      name: 'email',
      label: t('settings.account.email'),
      fieldType: 'input',
      defaultValue: user?.email || '',
      required: true,
      validation: {
        required: true,
        pattern: '^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$',
      },
    },
    {
      name: 'currentPassword',
      label: t('settings.account.currentPassword'),
      fieldType: 'input',
      placeholder: t('settings.account.currentPasswordPlaceholder'),
    },
    {
      name: 'newPassword',
      label: t('settings.account.newPassword'),
      fieldType: 'input',
      placeholder: t('settings.account.newPasswordPlaceholder'),
      validation: {
        minLength: 8,
      },
    },
    {
      name: 'confirmPassword',
      label: t('settings.account.confirmPassword'),
      fieldType: 'input',
      placeholder: t('settings.account.confirmPasswordPlaceholder'),
    },
  ];

  const handlePreferencesSubmit = async (values: Record<string, any>) => {
    await settingsService.updatePreferences(values as UserPreferences);
    setPreferences(values as UserPreferences);
    toast.success(t('settings.preferences.updateSuccess'));
  };

  const handleNotificationsSubmit = async (values: Record<string, any>) => {
    await settingsService.updateNotifications(values as NotificationSettings);
    setNotifications(values as NotificationSettings);
    toast.success(t('settings.notifications.updateSuccess'));
  };

  const handleAccountSubmit = async (values: Record<string, any>) => {
    const accountData = values as AccountSettings;
    
    // Validate password match
    if (accountData.newPassword && accountData.confirmPassword) {
      if (accountData.newPassword !== accountData.confirmPassword) {
        toast.error(t('settings.account.passwordMismatch'));
        return;
      }
    }
    
    // If password fields are filled, change password
    if (accountData.currentPassword && accountData.newPassword) {
      await settingsService.changePassword(
        accountData.currentPassword,
        accountData.newPassword
      );
      toast.success(t('settings.account.passwordChangeSuccess'));
    }

    // Update email if changed
    if (accountData.email !== user?.email) {
      await settingsService.updateAccount({ email: accountData.email });
      toast.success(t('settings.account.updateSuccess'));
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto py-8 px-4 max-w-4xl">
        <h1 className="text-3xl font-bold mb-6">{t('settings.title')}</h1>

        <Tabs defaultValue="preferences" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="preferences">{t('settings.tabs.preferences')}</TabsTrigger>
            <TabsTrigger value="notifications">{t('settings.tabs.notifications')}</TabsTrigger>
            <TabsTrigger value="account">{t('settings.tabs.account')}</TabsTrigger>
          </TabsList>

          <TabsContent value="preferences">
            <Card>
              <CardHeader>
                <CardTitle>{t('settings.preferences.title')}</CardTitle>
                <CardDescription>{t('settings.preferences.description')}</CardDescription>
              </CardHeader>
              <CardContent>
                <DynamicForm
                  fields={preferencesFields}
                  onSubmit={handlePreferencesSubmit}
                  submitButtonText={t('settings.save')}
                  layout="vertical"
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>{t('settings.notifications.title')}</CardTitle>
                <CardDescription>{t('settings.notifications.description')}</CardDescription>
              </CardHeader>
              <CardContent>
                <DynamicForm
                  fields={notificationsFields}
                  onSubmit={handleNotificationsSubmit}
                  submitButtonText={t('settings.save')}
                  layout="vertical"
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="account">
            <Card>
              <CardHeader>
                <CardTitle>{t('settings.account.title')}</CardTitle>
                <CardDescription>{t('settings.account.description')}</CardDescription>
              </CardHeader>
              <CardContent>
                <DynamicForm
                  fields={accountFields}
                  onSubmit={handleAccountSubmit}
                  submitButtonText={t('settings.save')}
                  layout="vertical"
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};
