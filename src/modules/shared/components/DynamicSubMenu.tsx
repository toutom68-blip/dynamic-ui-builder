import React, { useState } from 'react';
import { SubMenuProps, MenuItemConfig } from '@/types/component.types';
import { buildComponentStyles } from '@/utils/styleBuilder';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

const MenuItem: React.FC<{
  item: MenuItemConfig;
  level: number;
  collapsible: boolean;
  disabled?: boolean;
}> = ({ item, level, collapsible, disabled }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasChildren = item.children && item.children.length > 0;

  const handleClick = () => {
    if (disabled || item.disabled) return;
    
    if (hasChildren && collapsible) {
      setIsExpanded(!isExpanded);
    } else if (item.onClick) {
      item.onClick();
    }
  };

  return (
    <div>
      <div
        className={cn(
          'flex items-center gap-2 px-4 py-2 cursor-pointer transition-base',
          'hover:bg-accent rounded',
          (disabled || item.disabled) && 'opacity-50 cursor-not-allowed',
          level > 0 && 'pl-8'
        )}
        onClick={handleClick}
      >
        {item.image && (
          <img src={item.image} alt={item.label} className="h-5 w-5 object-cover rounded" />
        )}
        {item.icon && <span className="h-5 w-5">{item.icon}</span>}
        <span className="flex-1">{item.label}</span>
        {hasChildren && collapsible && (
          isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />
        )}
      </div>
      {hasChildren && isExpanded && (
        <div className="pl-4">
          {item.children!.map((child, idx) => (
            <MenuItem
              key={idx}
              item={child}
              level={level + 1}
              collapsible={collapsible}
              disabled={disabled}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export const DynamicSubMenu: React.FC<SubMenuProps> = ({
  items,
  orientation = 'vertical',
  collapsible = true,
  defaultExpanded = false,
  ...baseProps
}) => {
  const { style, className } = buildComponentStyles(
    baseProps,
    'transition-base'
  );

  if (baseProps.hidden) return null;

  return (
    <nav
      className={cn(
        className,
        'bg-card border rounded-lg p-2',
        orientation === 'horizontal' && 'flex gap-2'
      )}
      style={style}
    >
      {items.map((item, idx) => (
        <MenuItem
          key={idx}
          item={item}
          level={0}
          collapsible={collapsible}
          disabled={baseProps.disabled}
        />
      ))}
    </nav>
  );
};
