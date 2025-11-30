import React from 'react';
import { LayoutProps } from '@/types/component.types';
import { buildComponentStyles } from '@/utils/styleBuilder';

export const Content: React.FC<LayoutProps> = ({ children, content, htmlContent, ...baseProps }) => {
  const { style, className } = buildComponentStyles(
    baseProps,
    'bg-layout-content-bg transition-base flex-1'
  );

  if (baseProps.hidden) return null;

  return (
    <main
      className={className}
      style={style}
    >
      <div className="container mx-auto px-4 py-6 h-full overflow-y-auto">
        {htmlContent ? (
          <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
        ) : content ? (
          <div>{content}</div>
        ) : (
          children
        )}
      </div>
    </main>
  );
};
