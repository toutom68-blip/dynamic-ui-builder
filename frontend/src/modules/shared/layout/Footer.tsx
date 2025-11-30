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
      style={{ ...style, minHeight: '80px' }}
    >
      <div className="container mx-auto px-4 h-full flex items-center justify-center">
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
