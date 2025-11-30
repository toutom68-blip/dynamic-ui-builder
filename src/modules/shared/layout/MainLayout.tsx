import React from 'react';
import { Header } from './Header';
import { Footer } from './Footer';
import { Sidebar } from './Sidebar';
import { Content } from './Content';
import { LayoutProps } from '@/types/component.types';

interface MainLayoutProps {
  headerProps?: LayoutProps;
  footerProps?: LayoutProps;
  sidebarProps?: LayoutProps;
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
  return (
    <div className="min-h-screen flex flex-col">
      {!headerProps.hidden && (
        <Header {...headerProps}>
          {headerProps.children || (
            <div className="flex items-center justify-between w-full">
              <h1 className="text-xl font-heading font-semibold">Dynamic App</h1>
              <nav className="flex gap-4">
                <a href="/" className="hover:text-primary transition-base">Home</a>
                <a href="/demo" className="hover:text-primary transition-base">Demo</a>
              </nav>
            </div>
          )}
        </Header>
      )}

      <div className="flex-1 flex overflow-hidden">
        {!sidebarProps.hidden && (
          <Sidebar {...sidebarProps}>
            {sidebarProps.children || (
              <nav className="space-y-2">
                <a
                  href="/"
                  className="block px-3 py-2 rounded hover:bg-layout-sidebar-active transition-base"
                >
                  Dashboard
                </a>
                <a
                  href="/demo"
                  className="block px-3 py-2 rounded hover:bg-layout-sidebar-active transition-base"
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
            <p className="text-sm">© 2024 Dynamic App. Built with flexibility in mind.</p>
          )}
        </Footer>
      )}
    </div>
  );
};
