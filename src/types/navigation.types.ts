import { LucideIcon } from 'lucide-react';

export interface NavMenuItem {
  id: string;
  label: string;
  translationKey?: string;
  url?: string;
  icon?: LucideIcon;
  iconName?: string;
  hidden?: boolean;
  disabled?: boolean;
  badge?: string | number;
  badgeVariant?: 'default' | 'success' | 'warning' | 'error';
  target?: '_blank' | '_self' | '_parent' | '_top';
  onClick?: () => void;
  children?: NavMenuItem[];
  permissions?: string[];
  roles?: string[];
}

export interface NavMenuGroup {
  id: string;
  label?: string;
  translationKey?: string;
  items: NavMenuItem[];
  hidden?: boolean;
  collapsible?: boolean;
  defaultOpen?: boolean;
}

export type LayoutVariant = 
  | 'sidebar-left'
  | 'sidebar-right'
  | 'sidebar-mini'
  | 'topnav-only'
  | 'topnav-with-sidebar'
  | 'dual-sidebar';

export type SidebarStyle = 
  | 'default'
  | 'compact'
  | 'floating'
  | 'glass'
  | 'bordered'
  | 'gradient';

export type NavMenuStyle = 
  | 'default'
  | 'pills'
  | 'underline'
  | 'tabs'
  | 'minimal';

export interface LayoutThemeConfig {
  id: string;
  name: string;
  translationKey?: string;
  icon: string;
  layoutVariant: LayoutVariant;
  sidebarStyle: SidebarStyle;
  navMenuStyle: NavMenuStyle;
  sidebarWidth: {
    collapsed: string;
    expanded: string;
  };
  sidebarPosition: 'fixed' | 'sticky' | 'static';
  headerPosition: 'fixed' | 'sticky' | 'static';
  showLogo: boolean;
  showUserMenu: boolean;
  showSearch: boolean;
  showBreadcrumbs: boolean;
  animations: {
    sidebar: string;
    menu: string;
    hover: string;
  };
}

export interface NavigationConfig {
  layoutTheme: LayoutThemeConfig;
  menuGroups: NavMenuGroup[];
  hiddenItems: string[];
  disabledItems: string[];
  userMenuItems?: NavMenuItem[];
  quickActions?: NavMenuItem[];
}
