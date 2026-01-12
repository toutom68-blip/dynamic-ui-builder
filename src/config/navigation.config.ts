import { 
  Home, 
  LayoutDashboard, 
  Settings, 
  Users, 
  FileText, 
  Calendar, 
  Map, 
  Grid3X3, 
  Filter, 
  Image, 
  Bell, 
  HelpCircle,
  LogOut,
  User,
  Shield,
  CreditCard,
  Building2,
  MessageSquare,
  BarChart3,
  Layers,
  Palette
} from 'lucide-react';
import { 
  NavMenuGroup, 
  NavMenuItem, 
  LayoutThemeConfig, 
  NavigationConfig 
} from '@/types/navigation.types';

// Layout theme configurations
export const layoutThemes: Record<string, LayoutThemeConfig> = {
  classic: {
    id: 'classic',
    name: 'Classic',
    translationKey: 'layouts.classic',
    icon: '📐',
    layoutVariant: 'sidebar-left',
    sidebarStyle: 'default',
    navMenuStyle: 'default',
    sidebarWidth: { collapsed: '64px', expanded: '280px' },
    sidebarPosition: 'fixed',
    headerPosition: 'sticky',
    showLogo: true,
    showUserMenu: true,
    showSearch: true,
    showBreadcrumbs: true,
    animations: {
      sidebar: 'transition-all duration-300 ease-in-out',
      menu: 'transition-all duration-200 ease-out',
      hover: 'hover:scale-[1.02] transition-transform'
    }
  },
  compact: {
    id: 'compact',
    name: 'Compact',
    translationKey: 'layouts.compact',
    icon: '📦',
    layoutVariant: 'sidebar-mini',
    sidebarStyle: 'compact',
    navMenuStyle: 'minimal',
    sidebarWidth: { collapsed: '48px', expanded: '200px' },
    sidebarPosition: 'fixed',
    headerPosition: 'sticky',
    showLogo: false,
    showUserMenu: true,
    showSearch: false,
    showBreadcrumbs: false,
    animations: {
      sidebar: 'transition-all duration-200 ease-out',
      menu: 'transition-all duration-150 ease-out',
      hover: 'hover:bg-accent/50 transition-colors'
    }
  },
  floating: {
    id: 'floating',
    name: 'Floating',
    translationKey: 'layouts.floating',
    icon: '🎈',
    layoutVariant: 'sidebar-left',
    sidebarStyle: 'floating',
    navMenuStyle: 'pills',
    sidebarWidth: { collapsed: '72px', expanded: '260px' },
    sidebarPosition: 'fixed',
    headerPosition: 'fixed',
    showLogo: true,
    showUserMenu: true,
    showSearch: true,
    showBreadcrumbs: true,
    animations: {
      sidebar: 'transition-all duration-300 ease-[cubic-bezier(0.68,-0.55,0.265,1.55)]',
      menu: 'transition-all duration-200 ease-out',
      hover: 'hover:translate-x-1 transition-transform'
    }
  },
  glass: {
    id: 'glass',
    name: 'Glass',
    translationKey: 'layouts.glass',
    icon: '🔮',
    layoutVariant: 'sidebar-left',
    sidebarStyle: 'glass',
    navMenuStyle: 'underline',
    sidebarWidth: { collapsed: '64px', expanded: '280px' },
    sidebarPosition: 'fixed',
    headerPosition: 'sticky',
    showLogo: true,
    showUserMenu: true,
    showSearch: true,
    showBreadcrumbs: true,
    animations: {
      sidebar: 'transition-all duration-400 ease-out backdrop-blur-lg',
      menu: 'transition-all duration-250 ease-out',
      hover: 'hover:bg-white/10 transition-colors'
    }
  },
  topNav: {
    id: 'topNav',
    name: 'Top Navigation',
    translationKey: 'layouts.topNav',
    icon: '📊',
    layoutVariant: 'topnav-only',
    sidebarStyle: 'default',
    navMenuStyle: 'tabs',
    sidebarWidth: { collapsed: '0px', expanded: '0px' },
    sidebarPosition: 'static',
    headerPosition: 'sticky',
    showLogo: true,
    showUserMenu: true,
    showSearch: true,
    showBreadcrumbs: true,
    animations: {
      sidebar: '',
      menu: 'transition-all duration-200 ease-out',
      hover: 'hover:text-primary transition-colors'
    }
  },
  dualSidebar: {
    id: 'dualSidebar',
    name: 'Dual Sidebar',
    translationKey: 'layouts.dualSidebar',
    icon: '📚',
    layoutVariant: 'dual-sidebar',
    sidebarStyle: 'bordered',
    navMenuStyle: 'default',
    sidebarWidth: { collapsed: '64px', expanded: '240px' },
    sidebarPosition: 'fixed',
    headerPosition: 'sticky',
    showLogo: true,
    showUserMenu: true,
    showSearch: true,
    showBreadcrumbs: true,
    animations: {
      sidebar: 'transition-all duration-300 ease-in-out',
      menu: 'transition-all duration-200 ease-out',
      hover: 'hover:border-primary transition-colors'
    }
  },
  gradient: {
    id: 'gradient',
    name: 'Gradient',
    translationKey: 'layouts.gradient',
    icon: '🌈',
    layoutVariant: 'sidebar-left',
    sidebarStyle: 'gradient',
    navMenuStyle: 'pills',
    sidebarWidth: { collapsed: '64px', expanded: '280px' },
    sidebarPosition: 'fixed',
    headerPosition: 'sticky',
    showLogo: true,
    showUserMenu: true,
    showSearch: true,
    showBreadcrumbs: true,
    animations: {
      sidebar: 'transition-all duration-350 ease-out',
      menu: 'transition-all duration-200 ease-out',
      hover: 'hover:shadow-lg transition-shadow'
    }
  }
};

// Default menu groups configuration
export const defaultMenuGroups: NavMenuGroup[] = [
  {
    id: 'main',
    translationKey: 'navigation.groups.main',
    collapsible: false,
    defaultOpen: true,
    items: [
      {
        id: 'home',
        label: 'Home',
        translationKey: 'navigation.home',
        url: '/',
        icon: Home
      },
      {
        id: 'dashboard',
        label: 'Dashboard',
        translationKey: 'navigation.dashboard',
        url: '/dashboard',
        icon: LayoutDashboard,
        badge: 'New',
        badgeVariant: 'success'
      }
    ]
  },
  {
    id: 'demos',
    translationKey: 'navigation.groups.demos',
    collapsible: true,
    defaultOpen: true,
    items: [
      {
        id: 'components',
        label: 'Components',
        translationKey: 'navigation.components',
        url: '/demo',
        icon: Layers
      },
      {
        id: 'grid',
        label: 'Grid Demo',
        translationKey: 'navigation.gridDemo',
        url: '/demo/grid',
        icon: Grid3X3
      },
      {
        id: 'filter',
        label: 'Filter Demo',
        translationKey: 'navigation.filterDemo',
        url: '/demo/filter',
        icon: Filter
      },
      {
        id: 'map',
        label: 'Map Search',
        translationKey: 'navigation.mapSearch',
        url: '/map',
        icon: Map,
        children: [
          {
            id: 'map-search',
            label: 'Search Properties',
            translationKey: 'navigation.searchProperties',
            url: '/map/search',
            icon: Map
          },
          {
            id: 'map-saved',
            label: 'Saved Locations',
            translationKey: 'navigation.savedLocations',
            url: '/map/saved',
            icon: Building2
          }
        ]
      },
      {
        id: 'calendar',
        label: 'Calendar',
        translationKey: 'navigation.calendar',
        url: '/calendar',
        icon: Calendar,
        children: [
          {
            id: 'calendar-events',
            label: 'Events',
            translationKey: 'navigation.events',
            url: '/calendar/events',
            icon: Calendar
          },
          {
            id: 'calendar-bookings',
            label: 'Bookings',
            translationKey: 'navigation.bookings',
            url: '/calendar/bookings',
            icon: CreditCard,
            badge: 3,
            badgeVariant: 'warning'
          }
        ]
      }
    ]
  },
  {
    id: 'content',
    translationKey: 'navigation.groups.content',
    collapsible: true,
    defaultOpen: false,
    items: [
      {
        id: 'pages',
        label: 'Pages',
        translationKey: 'navigation.pages',
        icon: FileText,
        children: [
          {
            id: 'page-list',
            label: 'All Pages',
            translationKey: 'navigation.allPages',
            url: '/pages'
          },
          {
            id: 'page-create',
            label: 'Create Page',
            translationKey: 'navigation.createPage',
            url: '/pages/new'
          }
        ]
      },
      {
        id: 'media',
        label: 'Media',
        translationKey: 'navigation.media',
        url: '/media',
        icon: Image
      },
      {
        id: 'messages',
        label: 'Messages',
        translationKey: 'navigation.messages',
        url: '/messages',
        icon: MessageSquare,
        badge: 12,
        badgeVariant: 'error'
      }
    ]
  },
  {
    id: 'admin',
    translationKey: 'navigation.groups.admin',
    collapsible: true,
    defaultOpen: false,
    items: [
      {
        id: 'users',
        label: 'Users',
        translationKey: 'navigation.users',
        url: '/admin/users',
        icon: Users,
        permissions: ['admin', 'manage_users'],
        roles: ['admin', 'moderator']
      },
      {
        id: 'analytics',
        label: 'Analytics',
        translationKey: 'navigation.analytics',
        url: '/admin/analytics',
        icon: BarChart3,
        permissions: ['admin', 'view_analytics'],
        roles: ['admin', 'analyst']
      },
      {
        id: 'security',
        label: 'Security',
        translationKey: 'navigation.security',
        url: '/admin/security',
        icon: Shield,
        permissions: ['admin'],
        roles: ['admin']
      },
      {
        id: 'appearance',
        label: 'Appearance',
        translationKey: 'navigation.appearance',
        url: '/admin/appearance',
        icon: Palette,
        permissions: ['admin', 'manage_appearance'],
        roles: ['admin', 'designer']
      },
      {
        id: 'settings',
        label: 'Settings',
        translationKey: 'navigation.settings',
        url: '/settings',
        icon: Settings
      }
    ]
  }
];

// User menu items
export const defaultUserMenuItems: NavMenuItem[] = [
  {
    id: 'profile',
    label: 'Profile',
    translationKey: 'navigation.profile',
    url: '/settings',
    icon: User
  },
  {
    id: 'notifications',
    label: 'Notifications',
    translationKey: 'navigation.notifications',
    url: '/notifications',
    icon: Bell,
    badge: 5
  },
  {
    id: 'help',
    label: 'Help & Support',
    translationKey: 'navigation.help',
    url: '/help',
    icon: HelpCircle
  },
  {
    id: 'logout',
    label: 'Logout',
    translationKey: 'auth.logout',
    icon: LogOut
  }
];

// Quick action items
export const defaultQuickActions: NavMenuItem[] = [
  {
    id: 'new-booking',
    label: 'New Booking',
    translationKey: 'navigation.newBooking',
    url: '/bookings/new',
    icon: Calendar
  },
  {
    id: 'add-property',
    label: 'Add Property',
    translationKey: 'navigation.addProperty',
    url: '/properties/new',
    icon: Building2
  }
];

// Default navigation configuration
export const getDefaultNavigationConfig = (
  layoutThemeId: string = 'classic',
  hiddenItems: string[] = [],
  disabledItems: string[] = []
): NavigationConfig => ({
  layoutTheme: layoutThemes[layoutThemeId] || layoutThemes.classic,
  menuGroups: defaultMenuGroups,
  hiddenItems,
  disabledItems,
  userMenuItems: defaultUserMenuItems,
  quickActions: defaultQuickActions
});

// Helper to filter menu items based on hidden/disabled arrays
export const filterMenuItems = (
  items: NavMenuItem[],
  hiddenItems: string[],
  disabledItems: string[]
): NavMenuItem[] => {
  return items
    .filter(item => !hiddenItems.includes(item.id) && !item.hidden)
    .map(item => ({
      ...item,
      disabled: disabledItems.includes(item.id) || item.disabled,
      children: item.children 
        ? filterMenuItems(item.children, hiddenItems, disabledItems)
        : undefined
    }));
};

// Helper to filter menu groups
export const filterMenuGroups = (
  groups: NavMenuGroup[],
  hiddenItems: string[],
  disabledItems: string[]
): NavMenuGroup[] => {
  return groups
    .filter(group => !hiddenItems.includes(group.id) && !group.hidden)
    .map(group => ({
      ...group,
      items: filterMenuItems(group.items, hiddenItems, disabledItems)
    }))
    .filter(group => group.items.length > 0);
};

// Helper to check if user has required permission
export const hasPermission = (
  userRoles: string[],
  requiredPermissions?: string[]
): boolean => {
  // If no permissions required, always show
  if (!requiredPermissions || requiredPermissions.length === 0) {
    return true;
  }
  // Check if user has any of the required permissions/roles
  return requiredPermissions.some(permission => 
    userRoles.includes(permission)
  );
};

// Filter menu items based on user permissions
export const filterMenuByPermissions = (
  items: NavMenuItem[],
  userRoles: string[]
): NavMenuItem[] => {
  return items
    .filter(item => hasPermission(userRoles, item.permissions) && hasPermission(userRoles, item.roles))
    .map(item => ({
      ...item,
      children: item.children 
        ? filterMenuByPermissions(item.children, userRoles)
        : undefined
    }));
};

// Filter menu groups based on user permissions
export const filterMenuGroupsByPermissions = (
  groups: NavMenuGroup[],
  userRoles: string[]
): NavMenuGroup[] => {
  return groups
    .map(group => ({
      ...group,
      items: filterMenuByPermissions(group.items, userRoles)
    }))
    .filter(group => group.items.length > 0);
};
