import React from 'react';
import { LayoutProps } from '@/types/component.types';
import { buildComponentStyles } from '@/utils/styleBuilder';

export const Sidebar: React.FC<LayoutProps> = ({ children, content, htmlContent, ...baseProps }) => {
  const { style, className } = buildComponentStyles(
    baseProps,
    'bg-layout-sidebar-bg text-layout-sidebar-fg border-r transition-base'
  );

  if (baseProps.hidden) return null;

  return (
    <aside
      className={className}
      style={{ ...style, minWidth: '250px', maxWidth: '300px' }}
    >
      <div className="h-full overflow-y-auto p-4">
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
