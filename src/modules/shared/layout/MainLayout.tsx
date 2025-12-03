import React, { useState, useEffect } from 'react';
import { Header } from './Header';
import { Footer } from './Footer';
import { Sidebar } from './Sidebar';
import { Content } from './Content';
import { LayoutProps } from '@/types/component.types';
import { useIsMobile } from '@/hooks/use-mobile';

interface MainLayoutProps {
  headerProps?: LayoutProps;
  footerProps?: LayoutProps;
  sidebarProps?: LayoutProps & { collapsible?: boolean };
  contentProps?: LayoutProps;
  children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({
  headerProps = {},
  footerProps = {},
  sidebarProps = {},
  contentProps = {},
  children,
}) => {
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);

  // Close sidebar on mobile when route changes or on initial mobile load
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    } else {
      setSidebarOpen(true);
    }
  }, [isMobile]);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  return (
    <div className="min-h-screen flex flex-col w-full overflow-x-hidden">
      {!headerProps.hidden && (
        <Header 
          {...headerProps} 
          onMenuToggle={toggleSidebar}
          showMenuButton={!sidebarProps.hidden}
        >
          {headerProps.children || (
            <div className="flex items-center justify-between w-full">
              <h1 className="text-lg sm:text-xl font-heading font-semibold truncate">Dynamic App</h1>
              <nav className="hidden md:flex gap-4">
                <a href="/" className="hover:text-primary transition-base">Home</a>
                <a href="/demo" className="hover:text-primary transition-base">Demo</a>
              </nav>
            </div>
          )}
        </Header>
      )}

      <div className="flex-1 flex overflow-hidden relative">
        {/* Mobile sidebar overlay */}
        {isMobile && sidebarOpen && !sidebarProps.hidden && (
          <div 
            className="fixed inset-0 bg-black/50 z-40 transition-opacity"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {!sidebarProps.hidden && (
          <Sidebar 
            {...sidebarProps} 
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
            isMobile={isMobile}
          >
            {sidebarProps.children || (
              <nav className="space-y-2">
                <a
                  href="/"
                  className="block px-3 py-2 rounded hover:bg-layout-sidebar-active transition-base"
                  onClick={() => isMobile && setSidebarOpen(false)}
                >
                  Dashboard
                </a>
                <a
                  href="/demo"
                  className="block px-3 py-2 rounded hover:bg-layout-sidebar-active transition-base"
                  onClick={() => isMobile && setSidebarOpen(false)}
                >
                  Components Demo
                </a>
              </nav>
            )}
          </Sidebar>
        )}

        <Content {...contentProps}>
          {children}
        </Content>
      </div>

      {!footerProps.hidden && (
        <Footer {...footerProps}>
          {footerProps.children || (
            <p className="text-xs sm:text-sm text-center">© 2024 Dynamic App. Built with flexibility in mind.</p>
          )}
        </Footer>
      )}
    </div>
  );
};
