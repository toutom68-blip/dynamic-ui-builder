import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, Link } from 'react-router-dom';
import { ChevronDown, ChevronRight, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import { NavMenuItem, NavMenuGroup, NavMenuStyle } from '@/types/navigation.types';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

interface DynamicNavMenuProps {
  groups: NavMenuGroup[];
  style?: NavMenuStyle;
  collapsed?: boolean;
  onItemClick?: (item: NavMenuItem) => void;
  className?: string;
  orientation?: 'vertical' | 'horizontal';
}

export const DynamicNavMenu: React.FC<DynamicNavMenuProps> = ({
  groups,
  style = 'default',
  collapsed = false,
  onItemClick,
  className,
  orientation = 'vertical'
}) => {
  const { t } = useTranslation();
  const location = useLocation();
  const [openSubmenus, setOpenSubmenus] = useState<Record<string, boolean>>({});

  const isActive = (url?: string) => {
    if (!url) return false;
    return location.pathname === url || location.pathname.startsWith(url + '/');
  };

  const toggleSubmenu = (itemId: string) => {
    setOpenSubmenus(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };

  const getMenuItemClasses = (item: NavMenuItem, isSubmenuItem = false) => {
    const active = isActive(item.url);
    const disabled = item.disabled;

    const baseClasses = cn(
      'flex items-center gap-3 rounded-md transition-all duration-200',
      isSubmenuItem ? 'text-sm py-2 px-3' : 'py-2.5 px-3',
      collapsed && !isSubmenuItem && 'justify-center px-2',
      disabled && 'opacity-50 cursor-not-allowed pointer-events-none'
    );

    const styleClasses: Record<NavMenuStyle, string> = {
      default: cn(
        active 
          ? 'bg-primary text-primary-foreground font-medium' 
          : 'hover:bg-accent text-foreground'
      ),
      pills: cn(
        active 
          ? 'bg-primary/15 text-primary font-medium border border-primary/30' 
          : 'hover:bg-accent/50 text-muted-foreground'
      ),
      underline: cn(
        'rounded-none border-b-2',
        active 
          ? 'border-primary text-primary font-medium' 
          : 'border-transparent hover:border-muted-foreground/30 text-muted-foreground'
      ),
      tabs: cn(
        'rounded-t-md rounded-b-none border-b-2',
        active 
          ? 'bg-background border-primary text-foreground font-medium shadow-sm' 
          : 'border-transparent hover:bg-accent/30 text-muted-foreground'
      ),
      minimal: cn(
        active 
          ? 'text-primary font-medium' 
          : 'hover:text-foreground text-muted-foreground'
      )
    };

    return cn(baseClasses, styleClasses[style]);
  };

  const getBadgeVariant = (variant?: string) => {
    switch (variant) {
      case 'success': return 'bg-green-500/15 text-green-600 border-green-500/30';
      case 'warning': return 'bg-yellow-500/15 text-yellow-600 border-yellow-500/30';
      case 'error': return 'bg-red-500/15 text-red-600 border-red-500/30';
      default: return 'bg-primary/15 text-primary border-primary/30';
    }
  };

  const renderMenuItem = (item: NavMenuItem, isSubmenuItem = false) => {
    const Icon = item.icon;
    const hasChildren = item.children && item.children.length > 0;
    const isSubmenuOpen = openSubmenus[item.id];
    const label = item.translationKey ? t(item.translationKey) : item.label;

    const content = (
      <>
        {Icon && <Icon className={cn('shrink-0', collapsed && !isSubmenuItem ? 'h-5 w-5' : 'h-4 w-4')} />}
        {(!collapsed || isSubmenuItem) && (
          <>
            <span className="flex-1 truncate">{label}</span>
            {item.badge !== undefined && (
              <Badge 
                variant="outline" 
                className={cn('text-xs px-1.5 py-0.5 min-w-[20px] justify-center', getBadgeVariant(item.badgeVariant))}
              >
                {item.badge}
              </Badge>
            )}
            {hasChildren && (
              isSubmenuOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />
            )}
            {item.target === '_blank' && <ExternalLink className="h-3 w-3 opacity-50" />}
          </>
        )}
      </>
    );

    const menuItemElement = hasChildren ? (
      <Collapsible open={isSubmenuOpen} onOpenChange={() => toggleSubmenu(item.id)}>
        <CollapsibleTrigger asChild>
          <button 
            className={cn(getMenuItemClasses(item, isSubmenuItem), 'w-full')}
            onClick={() => item.onClick?.()}
          >
            {content}
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent className="ml-4 mt-1 space-y-1 border-l border-border/50 pl-2">
          {item.children?.map(child => (
            <div key={child.id}>
              {renderMenuItem(child, true)}
            </div>
          ))}
        </CollapsibleContent>
      </Collapsible>
    ) : item.url ? (
      <Link
        to={item.url}
        target={item.target}
        className={getMenuItemClasses(item, isSubmenuItem)}
        onClick={() => {
          item.onClick?.();
          onItemClick?.(item);
        }}
      >
        {content}
      </Link>
    ) : (
      <button 
        className={cn(getMenuItemClasses(item, isSubmenuItem), 'w-full')}
        onClick={() => {
          item.onClick?.();
          onItemClick?.(item);
        }}
      >
        {content}
      </button>
    );

    if (collapsed && !isSubmenuItem && Icon) {
      return (
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              {menuItemElement}
            </TooltipTrigger>
            <TooltipContent side="right" className="flex items-center gap-2">
              {label}
              {item.badge !== undefined && (
                <Badge variant="outline" className={cn('text-xs', getBadgeVariant(item.badgeVariant))}>
                  {item.badge}
                </Badge>
              )}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }

    return menuItemElement;
  };

  const renderGroup = (group: NavMenuGroup) => {
    const [isOpen, setIsOpen] = useState(group.defaultOpen ?? true);
    const groupLabel = group.translationKey ? t(group.translationKey) : group.label;

    return (
      <div key={group.id} className="mb-4">
        {groupLabel && !collapsed && (
          group.collapsible ? (
            <Collapsible open={isOpen} onOpenChange={setIsOpen}>
              <CollapsibleTrigger className="flex items-center justify-between w-full px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider hover:text-foreground transition-colors">
                {groupLabel}
                {isOpen ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-1 mt-1">
                {group.items.map(item => (
                  <div key={item.id}>{renderMenuItem(item)}</div>
                ))}
              </CollapsibleContent>
            </Collapsible>
          ) : (
            <>
              <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {groupLabel}
              </div>
              <div className="space-y-1">
                {group.items.map(item => (
                  <div key={item.id}>{renderMenuItem(item)}</div>
                ))}
              </div>
            </>
          )
        )}
        {(collapsed || !groupLabel) && (
          <div className={cn('space-y-1', collapsed && 'px-1')}>
            {group.items.map(item => (
              <div key={item.id}>{renderMenuItem(item)}</div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <nav 
      className={cn(
        orientation === 'horizontal' ? 'flex items-center gap-2' : 'flex flex-col',
        className
      )}
    >
      {groups.map(group => renderGroup(group))}
    </nav>
  );
};
