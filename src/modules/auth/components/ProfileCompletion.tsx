import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { DynamicForm } from '@/modules/shared/components/DynamicForm';
import { DynamicFormField } from '@/types/component.types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { authService } from '../auth.service';

interface ProfileCompletionProps {
  userId: string;
  email?: string;
  phoneNbr?: string;
}

export const ProfileCompletion: React.FC<ProfileCompletionProps> = ({ userId, email, phoneNbr }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Parse profile fields from environment variables
  const getProfileFields = (): DynamicFormField[] => {
    const fieldsConfig = import.meta.env.VITE_PROFILE_FIELDS || '';
    const hiddenFields = (import.meta.env.VITE_PROFILE_HIDDEN_FIELDS || '').split(',').map((f: string) => f.trim());
    
    const fields: DynamicFormField[] = [];
    
    if (!fieldsConfig) return fields;

    const fieldConfigs = fieldsConfig.split(',');
    
    fieldConfigs.forEach((config: string) => {
      const [name, fieldType, required] = config.split(':');
      if (!name || !fieldType || hiddenFields.includes(name.trim())) return;

      const field: DynamicFormField = {
        name: name.trim(),
        fieldType: fieldType.trim() as any,
        label: t(`profile.${name.trim()}`) || name.trim(),
        required: required === 'true',
        validation: required === 'true' ? { required: true } : undefined,
      };

      // Add specific configurations based on field type
      if (fieldType === 'select' && name === 'gender') {
        field.options = [
          { label: t('profile.male'), value: 'male' },
          { label: t('profile.female'), value: 'female' },
          { label: t('profile.other'), value: 'other' },
        ];
      }

      if (name === 'dateOfBirth') {
        field.placeholder = 'YYYY-MM-DD';
      }

      fields.push(field);
    });

    return fields;
  };

  const handleSubmit = async (values: Record<string, any>) => {
    setIsSubmitting(true);
    try {
      // Handle file upload if avatar is present
      let avatarUrl = null;
      if (values.avatar && values.avatar instanceof File) {
        avatarUrl = await authService.uploadAvatar(userId, values.avatar);
        values.avatar = avatarUrl;
      }

      // Submit profile data
      await authService.completeProfile(userId, {
        ...values,
        email,
        phoneNbr,
      });

      toast.success(t('profile.completionSuccess'));
      navigate('/');
    } catch (error) {
      console.error('Profile completion error:', error);
      toast.error(t('profile.completionError'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const fields = getProfileFields();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>{t('profile.completeProfile')}</CardTitle>
          <CardDescription>{t('profile.completeProfileDescription')}</CardDescription>
        </CardHeader>
        <CardContent>
          <DynamicForm
            fields={fields}
            onSubmit={handleSubmit}
            submitButtonText={t('profile.complete')}
            layout="grid"
            columns={2}
            disabled={isSubmitting}
          />
        </CardContent>
      </Card>
    </div>
  );
};
