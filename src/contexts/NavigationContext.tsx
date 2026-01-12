import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { 
  NavigationConfig, 
  LayoutThemeConfig, 
  NavMenuGroup, 
  NavMenuItem 
} from '@/types/navigation.types';
import { 
  layoutThemes, 
  defaultMenuGroups,
  defaultUserMenuItems,
  defaultQuickActions,
  filterMenuGroups,
  filterMenuGroupsByPermissions,
  getDefaultNavigationConfig
} from '@/config/navigation.config';
import { useAuth } from '@/contexts/AuthContext';

interface NavigationContextType {
  config: NavigationConfig;
  layoutTheme: LayoutThemeConfig;
  menuGroups: NavMenuGroup[];
  hiddenItems: string[];
  disabledItems: string[];
  sidebarCollapsed: boolean;
  sidebarOpen: boolean;
  
  // Actions
  setLayoutTheme: (themeId: string) => void;
  setMenuGroups: (groups: NavMenuGroup[]) => void;
  setHiddenItems: (items: string[]) => void;
  setDisabledItems: (items: string[]) => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  loadConfigFromAPI: (config: Partial<NavigationConfig>) => void;
  addMenuItem: (groupId: string, item: NavMenuItem) => void;
  removeMenuItem: (itemId: string) => void;
  updateMenuItem: (itemId: string, updates: Partial<NavMenuItem>) => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

interface NavigationProviderProps {
  children: React.ReactNode;
  initialConfig?: Partial<NavigationConfig>;
  apiEndpoint?: string;
}

export const NavigationProvider: React.FC<NavigationProviderProps> = ({ 
  children, 
  initialConfig,
  apiEndpoint 
}) => {
  const { user, isAuthenticated } = useAuth();
  
  // Get user roles from auth context
  const userRoles = useMemo(() => {
    if (!user) return [];
    const roles: string[] = [];
    if (user.role) roles.push(user.role);
    if (user.roles) roles.push(...user.roles);
    return roles;
  }, [user]);

  const [layoutTheme, setLayoutThemeState] = useState<LayoutThemeConfig>(() => {
    const savedTheme = localStorage.getItem('nav-layout-theme');
    if (savedTheme && layoutThemes[savedTheme]) {
      return layoutThemes[savedTheme];
    }
    return initialConfig?.layoutTheme || layoutThemes.classic;
  });

  const [menuGroups, setMenuGroupsState] = useState<NavMenuGroup[]>(
    initialConfig?.menuGroups || defaultMenuGroups
  );

  const [hiddenItems, setHiddenItemsState] = useState<string[]>(
    initialConfig?.hiddenItems || []
  );

  const [disabledItems, setDisabledItemsState] = useState<string[]>(
    initialConfig?.disabledItems || []
  );

  const [sidebarCollapsed, setSidebarCollapsedState] = useState(() => {
    const saved = localStorage.getItem('nav-sidebar-collapsed');
    return saved === 'true';
  });

  const [sidebarOpen, setSidebarOpenState] = useState(true);

  // Load config from API if endpoint provided
  useEffect(() => {
    if (apiEndpoint) {
      fetch(apiEndpoint)
        .then(res => res.json())
        .then(data => {
          loadConfigFromAPI(data);
        })
        .catch(console.error);
    }
  }, [apiEndpoint]);

  // Persist layout theme
  useEffect(() => {
    localStorage.setItem('nav-layout-theme', layoutTheme.id);
  }, [layoutTheme]);

  // Persist sidebar collapsed state
  useEffect(() => {
    localStorage.setItem('nav-sidebar-collapsed', String(sidebarCollapsed));
  }, [sidebarCollapsed]);

  const setLayoutTheme = useCallback((themeId: string) => {
    if (layoutThemes[themeId]) {
      setLayoutThemeState(layoutThemes[themeId]);
    }
  }, []);

  const setMenuGroups = useCallback((groups: NavMenuGroup[]) => {
    setMenuGroupsState(groups);
  }, []);

  const setHiddenItems = useCallback((items: string[]) => {
    setHiddenItemsState(items);
  }, []);

  const setDisabledItems = useCallback((items: string[]) => {
    setDisabledItemsState(items);
  }, []);

  const toggleSidebar = useCallback(() => {
    setSidebarCollapsedState(prev => !prev);
  }, []);

  const setSidebarOpen = useCallback((open: boolean) => {
    setSidebarOpenState(open);
  }, []);

  const setSidebarCollapsed = useCallback((collapsed: boolean) => {
    setSidebarCollapsedState(collapsed);
  }, []);

  const loadConfigFromAPI = useCallback((config: Partial<NavigationConfig>) => {
    if (config.layoutTheme) {
      setLayoutThemeState(config.layoutTheme);
    }
    if (config.menuGroups) {
      setMenuGroupsState(config.menuGroups);
    }
    if (config.hiddenItems) {
      setHiddenItemsState(config.hiddenItems);
    }
    if (config.disabledItems) {
      setDisabledItemsState(config.disabledItems);
    }
  }, []);

  const addMenuItem = useCallback((groupId: string, item: NavMenuItem) => {
    setMenuGroupsState(prev => prev.map(group => {
      if (group.id === groupId) {
        return { ...group, items: [...group.items, item] };
      }
      return group;
    }));
  }, []);

  const removeMenuItem = useCallback((itemId: string) => {
    setMenuGroupsState(prev => prev.map(group => ({
      ...group,
      items: group.items.filter(item => item.id !== itemId)
    })));
  }, []);

  const updateMenuItem = useCallback((itemId: string, updates: Partial<NavMenuItem>) => {
    setMenuGroupsState(prev => prev.map(group => ({
      ...group,
      items: group.items.map(item => 
        item.id === itemId ? { ...item, ...updates } : item
      )
    })));
  }, []);

  // Build filtered config - apply hidden/disabled filters first, then permission filters
  const filteredGroups = useMemo(() => {
    const hiddenFiltered = filterMenuGroups(menuGroups, hiddenItems, disabledItems);
    // Apply permission-based filtering using user roles
    return filterMenuGroupsByPermissions(hiddenFiltered, userRoles);
  }, [menuGroups, hiddenItems, disabledItems, userRoles]);

  const config: NavigationConfig = useMemo(() => ({
    layoutTheme,
    menuGroups: filteredGroups,
    hiddenItems,
    disabledItems,
    userMenuItems: defaultUserMenuItems,
    quickActions: defaultQuickActions
  }), [layoutTheme, filteredGroups, hiddenItems, disabledItems]);

  return (
    <NavigationContext.Provider 
      value={{
        config,
        layoutTheme,
        menuGroups: filteredGroups,
        hiddenItems,
        disabledItems,
        sidebarCollapsed,
        sidebarOpen,
        setLayoutTheme,
        setMenuGroups,
        setHiddenItems,
        setDisabledItems,
        toggleSidebar,
        setSidebarOpen,
        setSidebarCollapsed,
        loadConfigFromAPI,
        addMenuItem,
        removeMenuItem,
        updateMenuItem
      }}
    >
      {children}
    </NavigationContext.Provider>
  );
};

export const useNavigation = () => {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
};

// Export layout themes for external use
export { layoutThemes };
