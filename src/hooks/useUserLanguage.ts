import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { authService } from '@/modules/auth/auth.service';

/**
 * Hook to fetch and set user's language preference from the database
 */
export const useUserLanguage = () => {
  const { i18n } = useTranslation();
  const { user } = useAuth();

  useEffect(() => {
    const initializeLanguage = async () => {
      try {
        // Check if user is authenticated and has a language preference
        if (user?.language) {
          i18n.changeLanguage(user.language);
        } else {
          // Fall back to stored language or default
          const storedLanguage = localStorage.getItem('i18nextLng');
          if (!storedLanguage) {
            i18n.changeLanguage('en');
          }
        }
      } catch (error) {
        console.error('Failed to fetch user language:', error);
        i18n.changeLanguage('en');
      }
    };

    initializeLanguage();
  }, [i18n, user]);

  const changeLanguage = async (lang: string) => {
    await i18n.changeLanguage(lang);
    
    // Save language preference to backend
    if (user) {
      try {
        await authService.updateLanguage(lang);
      } catch (error) {
        console.error('Failed to save language preference:', error);
      }
    }
  };

  return { changeLanguage, currentLanguage: i18n.language };
};
