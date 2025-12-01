import React from 'react';
import { LayoutProps } from '@/types/component.types';
import { buildComponentStyles } from '@/utils/styleBuilder';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { NotificationCenter } from '@/components/NotificationCenter';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

export const Header: React.FC<LayoutProps> = ({ children, content, htmlContent, ...baseProps }) => {
  const { style, className } = buildComponentStyles(
    baseProps,
    'bg-layout-header-bg text-layout-header-fg border-b transition-base'
  );
  const { isAuthenticated, logout, user } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      toast.success(t('auth.logoutSuccess'));
      navigate('/');
    } catch (error) {
      toast.error(t('common.error'));
    }
  };

  if (baseProps.hidden) return null;

  return (
    <header
      className={className}
      style={{ ...style, minHeight: '64px' }}
    >
      <div className="container mx-auto px-4 h-full flex items-center justify-between gap-4">
        <div className="flex-1">
          {htmlContent ? (
            <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
          ) : content ? (
            <div>{content}</div>
          ) : (
            children
          )}
        </div>
        <div className="flex items-center gap-2">
          {isAuthenticated ? (
            <>
              <span className="text-sm text-muted-foreground hidden sm:inline">
                {user?.email}
              </span>
              <NotificationCenter />
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                {t('auth.logout')}
              </Button>
            </>
          ) : (
            <Button variant="ghost" size="sm" onClick={() => navigate('/auth')}>
              {t('auth.login')}
            </Button>
          )}
          <LanguageSwitcher />
        </div>
      </div>
    </header>
  );
};
