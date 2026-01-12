import React from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { useNavigation } from '@/contexts/NavigationContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { DynamicNavMenu } from '../components/DynamicNavMenu';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  X, 
  ChevronLeft, 
  ChevronRight,
  Sparkles
} from 'lucide-react';

interface DynamicSidebarProps {
  className?: string;
  logo?: React.ReactNode;
  footer?: React.ReactNode;
}

export const DynamicSidebar: React.FC<DynamicSidebarProps> = ({
  className,
  logo,
  footer
}) => {
  const { t } = useTranslation();
  const isMobile = useIsMobile();
  const { 
    layoutTheme, 
    menuGroups, 
    sidebarCollapsed, 
    sidebarOpen,
    toggleSidebar,
    setSidebarOpen
  } = useNavigation();

  // Don't render for top-nav only layout
  if (layoutTheme.layoutVariant === 'topnav-only') {
    return null;
  }

  const getSidebarStyleClasses = () => {
    const styles: Record<string, string> = {
      default: 'bg-sidebar border-r border-border',
      compact: 'bg-sidebar/95 border-r border-border',
      floating: 'm-3 rounded-xl bg-sidebar/95 backdrop-blur-sm shadow-lg border border-border/50',
      glass: 'bg-sidebar/60 backdrop-blur-xl border-r border-white/10',
      bordered: 'bg-sidebar border-r-2 border-primary/20',
      gradient: 'bg-gradient-to-b from-sidebar via-sidebar/95 to-sidebar/90 border-r border-border'
    };
    return styles[layoutTheme.sidebarStyle] || styles.default;
  };

  const sidebarWidth = sidebarCollapsed 
    ? layoutTheme.sidebarWidth.collapsed 
    : layoutTheme.sidebarWidth.expanded;

  // Mobile sidebar
  if (isMobile) {
    return (
      <>
        {/* Overlay */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-40 transition-opacity"
            onClick={() => setSidebarOpen(false)}
          />
        )}
        
        {/* Mobile Sidebar */}
        <aside
          className={cn(
            'fixed inset-y-0 left-0 z-50 flex flex-col',
            'w-[280px] max-w-[85vw]',
            getSidebarStyleClasses(),
            layoutTheme.animations.sidebar,
            sidebarOpen ? 'translate-x-0' : '-translate-x-full',
            className
          )}
        >
          {/* Mobile Header */}
          <div className="flex items-center justify-between p-4 border-b border-border/50">
            {logo || (
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                <span className="font-heading font-semibold">{t('common.appName')}</span>
              </div>
            )}
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Navigation */}
          <ScrollArea className="flex-1 p-3">
            <DynamicNavMenu 
              groups={menuGroups}
              style={layoutTheme.navMenuStyle}
              onItemClick={() => setSidebarOpen(false)}
            />
          </ScrollArea>

          {/* Footer */}
          {footer && (
            <div className="p-4 border-t border-border/50">
              {footer}
            </div>
          )}
        </aside>
      </>
    );
  }

  // Desktop sidebar
  return (
    <aside
      className={cn(
        'flex flex-col h-full shrink-0',
        getSidebarStyleClasses(),
        layoutTheme.animations.sidebar,
        layoutTheme.sidebarPosition === 'fixed' && 'fixed left-0 top-0 h-screen',
        layoutTheme.sidebarPosition === 'sticky' && 'sticky top-0 h-screen',
        layoutTheme.sidebarStyle === 'floating' && 'h-[calc(100vh-24px)]',
        className
      )}
      style={{ width: sidebarWidth }}
    >
      {/* Logo / Header */}
      {layoutTheme.showLogo && (
        <div className={cn(
          'flex items-center gap-3 p-4 border-b border-border/50',
          sidebarCollapsed && 'justify-center'
        )}>
          {logo || (
            <>
              <Sparkles className="h-6 w-6 text-primary shrink-0" />
              {!sidebarCollapsed && (
                <span className="font-heading font-semibold text-lg truncate">
                  {t('common.appName')}
                </span>
              )}
            </>
          )}
        </div>
      )}

      {/* Navigation */}
      <ScrollArea className="flex-1 p-3">
        <DynamicNavMenu 
          groups={menuGroups}
          style={layoutTheme.navMenuStyle}
          collapsed={sidebarCollapsed}
        />
      </ScrollArea>

      {/* Collapse Toggle */}
      <div className={cn(
        'p-3 border-t border-border/50',
        sidebarCollapsed && 'flex justify-center'
      )}>
        <Button 
          variant="ghost" 
          size={sidebarCollapsed ? 'icon' : 'sm'}
          onClick={toggleSidebar}
          className={cn(
            'text-muted-foreground hover:text-foreground',
            !sidebarCollapsed && 'w-full justify-start gap-2'
          )}
        >
          {sidebarCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <>
              <ChevronLeft className="h-4 w-4" />
              <span>{t('common.collapse')}</span>
            </>
          )}
        </Button>
      </div>

      {/* Footer */}
      {footer && !sidebarCollapsed && (
        <div className="p-4 border-t border-border/50">
          {footer}
        </div>
      )}
    </aside>
  );
};
