import React from 'react';
import { LayoutProps } from '@/types/component.types';
import { buildComponentStyles } from '@/utils/styleBuilder';

export const Footer: React.FC<LayoutProps> = ({ children, content, htmlContent, ...baseProps }) => {
  const { style, className } = buildComponentStyles(
    baseProps,
    'bg-layout-footer-bg text-layout-footer-fg border-t transition-base'
  );

  if (baseProps.hidden) return null;

  return (
    <footer
      className={className}
      style={{ ...style, minHeight: '60px' }}
    >
      <div className="container mx-auto px-3 sm:px-4 lg:px-6 h-full flex flex-col sm:flex-row items-center justify-center gap-2 py-4">
        {htmlContent ? (
          <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
        ) : content ? (
          <div>{content}</div>
        ) : (
          children
        )}
      </div>
    </footer>
  );
};
