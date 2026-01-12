import React from 'react';
import { cn } from '@/lib/utils';
import { useNavigation } from '@/contexts/NavigationContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { DynamicHeader } from './DynamicHeader';
import { DynamicSidebar } from './DynamicSidebar';
import { Footer } from './Footer';

interface DynamicLayoutProps {
  children: React.ReactNode;
  headerLogo?: React.ReactNode;
  sidebarLogo?: React.ReactNode;
  sidebarFooter?: React.ReactNode;
  footerContent?: React.ReactNode;
  headerActions?: React.ReactNode;
  showHeader?: boolean;
  showSidebar?: boolean;
  showFooter?: boolean;
  className?: string;
}

export const DynamicLayout: React.FC<DynamicLayoutProps> = ({
  children,
  headerLogo,
  sidebarLogo,
  sidebarFooter,
  footerContent,
  headerActions,
  showHeader = true,
  showSidebar = true,
  showFooter = true,
  className
}) => {
  const { layoutTheme, sidebarCollapsed } = useNavigation();
  const isMobile = useIsMobile();

  const isTopNavOnly = layoutTheme.layoutVariant === 'topnav-only';
  const hasSidebar = showSidebar && !isTopNavOnly;
  
  const getContentMargin = () => {
    if (!hasSidebar || isMobile) return '0';
    if (layoutTheme.sidebarPosition !== 'fixed') return '0';
    return sidebarCollapsed 
      ? layoutTheme.sidebarWidth.collapsed 
      : layoutTheme.sidebarWidth.expanded;
  };

  const getHeaderMargin = () => {
    if (!hasSidebar || isMobile) return '0';
    if (layoutTheme.sidebarPosition !== 'fixed') return '0';
    if (layoutTheme.headerPosition === 'fixed') {
      return sidebarCollapsed 
        ? layoutTheme.sidebarWidth.collapsed 
        : layoutTheme.sidebarWidth.expanded;
    }
    return '0';
  };

  return (
    <div className={cn('min-h-screen flex flex-col w-full', className)}>
      {/* Header */}
      {showHeader && (
        <div style={{ marginLeft: getHeaderMargin() }}>
          <DynamicHeader 
            logo={headerLogo}
            actions={headerActions}
          />
        </div>
      )}

      <div className="flex-1 flex relative">
        {/* Sidebar */}
        {hasSidebar && (
          <DynamicSidebar 
            logo={sidebarLogo}
            footer={sidebarFooter}
          />
        )}

        {/* Main Content */}
        <main 
          className={cn(
            'flex-1 min-h-0',
            'transition-all duration-300'
          )}
          style={{ 
            marginLeft: getContentMargin(),
            paddingTop: layoutTheme.headerPosition === 'fixed' ? '56px' : '0'
          }}
        >
          <div className="p-4 lg:p-6">
            {children}
          </div>
        </main>
      </div>

      {/* Footer */}
      {showFooter && (
        <div style={{ marginLeft: getContentMargin() }}>
          <Footer>
            {footerContent || (
              <p className="text-sm text-center text-muted-foreground">
                © 2024 Dynamic App. Built with flexibility in mind.
              </p>
            )}
          </Footer>
        </div>
      )}
    </div>
  );
};
