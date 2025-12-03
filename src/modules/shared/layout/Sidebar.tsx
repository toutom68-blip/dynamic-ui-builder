import React from 'react';
import { LayoutProps } from '@/types/component.types';
import { buildComponentStyles } from '@/utils/styleBuilder';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SidebarProps extends LayoutProps {
  isOpen?: boolean;
  onClose?: () => void;
  isMobile?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  children, 
  content, 
  htmlContent, 
  isOpen = true,
  onClose,
  isMobile = false,
  ...baseProps 
}) => {
  const { style, className } = buildComponentStyles(
    baseProps,
    'bg-layout-sidebar-bg text-layout-sidebar-fg border-r transition-all duration-300 ease-in-out'
  );

  if (baseProps.hidden) return null;

  const sidebarClasses = cn(
    className,
    // Base styles
    'flex flex-col',
    // Mobile styles
    isMobile && [
      'fixed inset-y-0 left-0 z-50',
      'w-[280px] max-w-[85vw]',
      isOpen ? 'translate-x-0' : '-translate-x-full',
    ],
    // Desktop styles
    !isMobile && [
      'relative',
      'w-[250px] lg:w-[280px] xl:w-[300px]',
      'hidden lg:flex',
    ]
  );

  return (
    <aside
      className={sidebarClasses}
      style={style}
    >
      {/* Mobile header with close button */}
      {isMobile && (
        <div className="flex items-center justify-between p-4 border-b border-layout-sidebar-active/20">
          <span className="font-heading font-semibold">Menu</span>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={onClose}
            className="text-layout-sidebar-fg hover:bg-layout-sidebar-active/20"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
      )}

      {/* Sidebar content */}
      <div className="flex-1 overflow-y-auto p-4 scrollbar-thin">
        {htmlContent ? (
          <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
        ) : content ? (
          <div>{content}</div>
        ) : (
          children
        )}
      </div>
    </aside>
  );
};
