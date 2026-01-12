import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useNavigation } from '@/contexts/NavigationContext';
import { useAuth } from '@/contexts/AuthContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { DynamicNavMenu } from '../components/DynamicNavMenu';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { NotificationCenter } from '@/components/NotificationCenter';
import { ThemeSwitcher } from '@/components/ThemeSwitcher';
import { ThemeCustomizer } from '@/components/ThemeCustomizer';
import { 
  Menu, 
  Search, 
  User,
  LogOut,
  Settings,
  Sparkles
} from 'lucide-react';
import { toast } from 'sonner';

interface DynamicHeaderProps {
  className?: string;
  logo?: React.ReactNode;
  actions?: React.ReactNode;
  showSearch?: boolean;
}

export const DynamicHeader: React.FC<DynamicHeaderProps> = ({
  className,
  logo,
  actions,
  showSearch = true
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { isAuthenticated, logout, user } = useAuth();
  const { 
    layoutTheme, 
    menuGroups,
    setSidebarOpen,
    config
  } = useNavigation();

  const handleLogout = async () => {
    try {
      await logout();
      toast.success(t('auth.logoutSuccess'));
      navigate('/');
    } catch (error) {
      toast.error(t('common.error'));
    }
  };

  const getHeaderPositionClasses = () => {
    switch (layoutTheme.headerPosition) {
      case 'fixed': return 'fixed top-0 left-0 right-0';
      case 'sticky': return 'sticky top-0';
      default: return '';
    }
  };

  // For topnav-only layout, get first level items for horizontal nav
  const topNavItems = layoutTheme.layoutVariant === 'topnav-only' 
    ? menuGroups.flatMap(g => g.items).slice(0, 6)
    : [];

  return (
    <header
      className={cn(
        'bg-background border-b border-border z-30',
        'transition-all duration-200',
        getHeaderPositionClasses(),
        className
      )}
    >
      <div className="container mx-auto px-4 h-14 flex items-center justify-between gap-4">
        {/* Left section */}
        <div className="flex items-center gap-3">
          {/* Mobile menu button */}
          {layoutTheme.layoutVariant !== 'topnav-only' && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="lg:hidden shrink-0"
              onClick={() => setSidebarOpen(true)}
              aria-label={t('common.openMenu')}
            >
              <Menu className="h-5 w-5" />
            </Button>
          )}
          
          {/* Logo */}
          {logo || (
            <div 
              className="flex items-center gap-2 cursor-pointer" 
              onClick={() => navigate('/')}
            >
              <Sparkles className="h-5 w-5 text-primary" />
              <span className="font-heading font-semibold hidden sm:inline">
                {t('common.appName')}
              </span>
            </div>
          )}

          {/* Top nav items for topnav-only layout */}
          {layoutTheme.layoutVariant === 'topnav-only' && !isMobile && (
            <nav className="hidden md:flex items-center gap-1 ml-6">
              {topNavItems.map(item => {
                const Icon = item.icon;
                const label = item.translationKey ? t(item.translationKey) : item.label;
                return (
                  <Button
                    key={item.id}
                    variant="ghost"
                    size="sm"
                    className={cn(
                      'gap-2',
                      item.disabled && 'opacity-50 pointer-events-none'
                    )}
                    onClick={() => item.url && navigate(item.url)}
                  >
                    {Icon && <Icon className="h-4 w-4" />}
                    {label}
                  </Button>
                );
              })}
            </nav>
          )}
        </div>

        {/* Center section - Search */}
        {layoutTheme.showSearch && showSearch && !isMobile && (
          <div className="flex-1 max-w-md hidden md:block">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder={t('common.search')}
                className="pl-10 bg-muted/50"
              />
            </div>
          </div>
        )}

        {/* Right section */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Custom actions */}
          {actions}

          {/* Mobile search */}
          {layoutTheme.showSearch && showSearch && isMobile && (
            <Button variant="ghost" size="icon">
              <Search className="h-5 w-5" />
            </Button>
          )}

          {isAuthenticated ? (
            <>
              <NotificationCenter />
              
              {/* User Menu */}
              {layoutTheme.showUserMenu && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user?.avatarUrl} />
                        <AvatarFallback>
                          <User className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <div className="px-3 py-2">
                      <p className="text-sm font-medium truncate">{user?.email}</p>
                      <p className="text-xs text-muted-foreground">
                        {user?.role || t('common.user')}
                      </p>
                    </div>
                    <DropdownMenuSeparator />
                    {config.userMenuItems?.map(item => {
                      if (item.id === 'logout') return null;
                      const Icon = item.icon;
                      const label = item.translationKey ? t(item.translationKey) : item.label;
                      return (
                        <DropdownMenuItem 
                          key={item.id}
                          onClick={() => item.url && navigate(item.url)}
                          disabled={item.disabled}
                        >
                          {Icon && <Icon className="mr-2 h-4 w-4" />}
                          {label}
                        </DropdownMenuItem>
                      );
                    })}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      {t('auth.logout')}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </>
          ) : (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('/auth')}
            >
              {t('auth.login')}
            </Button>
          )}

          <ThemeCustomizer />
          <ThemeSwitcher />
          <LanguageSwitcher />
        </div>
      </div>
    </header>
  );
};
