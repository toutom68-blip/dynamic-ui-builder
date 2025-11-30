import React from 'react';
import { LayoutProps } from '@/types/component.types';
import { buildComponentStyles } from '@/utils/styleBuilder';

export const Header: React.FC<LayoutProps> = ({ children, content, htmlContent, ...baseProps }) => {
  const { style, className } = buildComponentStyles(
    baseProps,
    'bg-layout-header-bg text-layout-header-fg border-b transition-base'
  );

  if (baseProps.hidden) return null;

  return (
    <header
      className={className}
      style={{ ...style, minHeight: '64px' }}
    >
      <div className="container mx-auto px-4 h-full flex items-center justify-between">
        {htmlContent ? (
          <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
        ) : content ? (
          <div>{content}</div>
        ) : (
          children
        )}
      </div>
    </header>
  );
};
