import React from 'react';
import { LayoutProps } from '@/types/component.types';
import { buildComponentStyles } from '@/utils/styleBuilder';

export const Content: React.FC<LayoutProps> = ({ children, content, htmlContent, ...baseProps }) => {
  const { style, className } = buildComponentStyles(
    baseProps,
    'bg-layout-content-bg transition-base flex-1 min-w-0'
  );

  if (baseProps.hidden) return null;

  return (
    <main
      className={className}
      style={style}
    >
      <div className="w-full h-full overflow-y-auto overflow-x-hidden">
        <div className="container mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 py-4 sm:py-6 lg:py-8">
          {htmlContent ? (
            <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
          ) : content ? (
            <div>{content}</div>
          ) : (
            children
          )}
        </div>
      </div>
    </main>
  );
};
