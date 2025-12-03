import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { ProfilePhotoUpload } from './ProfilePhotoUpload';
import { DynamicInput } from '@/modules/shared/components/DynamicInput';
import { DynamicButton } from '@/modules/shared/components/DynamicButton';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { authService } from '@/modules/auth/auth.service';

interface ProfileData {
  firstName: string;
  lastName: string;
  phone: string;
  bio: string;
  avatar?: string;
}

export const ProfileForm: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [profile, setProfile] = useState<ProfileData>({
    firstName: '',
    lastName: '',
    phone: '',
    bio: '',
    avatar: '',
  });

  useEffect(() => {
    // Load profile data from user object
    if (user) {
      setProfile({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phone: user.phone || '',
        bio: user.bio || '',
        avatar: user.avatar || '',
      });
    }
  }, [user]);

  const handleInputChange = (field: keyof ProfileData, value: string) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  const handlePhotoChange = (file: File | null) => {
    setPhotoFile(file);
    if (!file) {
      setProfile((prev) => ({ ...prev, avatar: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      // Upload photo if changed
      let avatarUrl = profile.avatar;
      if (photoFile) {
        avatarUrl = await authService.uploadAvatar(user.id, photoFile);
      }

      // Update profile
      await authService.completeProfile(user.id, {
        firstName: profile.firstName,
        lastName: profile.lastName,
        phone: profile.phone,
        bio: profile.bio,
        avatar: avatarUrl,
      });

      setProfile((prev) => ({ ...prev, avatar: avatarUrl }));
      setPhotoFile(null);
      toast.success(t('profile.updateSuccess'));
    } catch (error) {
      console.error('Profile update error:', error);
      toast.error(t('profile.updateError'));
    } finally {
      setLoading(false);
    }
  };

  const fullName = `${profile.firstName} ${profile.lastName}`.trim();

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Photo Upload Section */}
      <div className="flex justify-center pb-6 border-b">
        <ProfilePhotoUpload
          currentPhoto={profile.avatar}
          onPhotoChange={handlePhotoChange}
          userName={fullName}
        />
      </div>

      {/* Profile Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="firstName">{t('profile.firstName')}</Label>
          <DynamicInput
            name="firstName"
            value={profile.firstName}
            onChange={(value) => handleInputChange('firstName', value)}
            placeholder={t('profile.firstNamePlaceholder')}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="lastName">{t('profile.lastName')}</Label>
          <DynamicInput
            name="lastName"
            value={profile.lastName}
            onChange={(value) => handleInputChange('lastName', value)}
            placeholder={t('profile.lastNamePlaceholder')}
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="email">{t('profile.email')}</Label>
          <DynamicInput
            name="email"
            value={user?.email || ''}
            disabled
          />
          <p className="text-xs text-muted-foreground">
            {t('profile.emailHint')}
          </p>
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="phone">{t('profile.phone')}</Label>
          <DynamicInput
            name="phone"
            type="tel"
            value={profile.phone}
            onChange={(value) => handleInputChange('phone', value)}
            placeholder={t('profile.phonePlaceholder')}
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="bio">{t('profile.bio')}</Label>
          <Textarea
            id="bio"
            value={profile.bio}
            onChange={(e) => handleInputChange('bio', e.target.value)}
            placeholder={t('profile.bioPlaceholder')}
            rows={4}
            className="resize-none"
          />
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end pt-4 border-t">
        <DynamicButton
          type="submit"
          variant="primary"
          loading={loading}
        >
          {t('profile.save')}
        </DynamicButton>
      </div>
    </form>
  );
};
