import React, { createContext, useContext, useEffect, useState } from 'react';

export type ThemeId = 'default' | 'commerce' | 'admin' | 'ai' | 'nature';

export interface ThemeConfig {
  id: ThemeId;
  name: string;
  description: string;
  icon: string;
  fonts: {
    heading: string;
    body: string;
  };
  animations: {
    transition: string;
    transitionSlow: string;
    buttonHover: string;
    cardHover: string;
  };
  inputs: {
    borderRadius: string;
    focusRing: string;
  };
  outputs: {
    successColor: string;
    errorColor: string;
    warningColor: string;
    infoColor: string;
  };
}

export const themes: Record<ThemeId, ThemeConfig> = {
  default: {
    id: 'default',
    name: 'Classic',
    description: 'Clean and professional design',
    icon: '🎨',
    fonts: {
      heading: "'Outfit', 'Inter', system-ui, sans-serif",
      body: "'Inter', system-ui, sans-serif",
    },
    animations: {
      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
      transitionSlow: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      buttonHover: 'scale(1.02)',
      cardHover: 'translateY(-2px)',
    },
    inputs: {
      borderRadius: '0.5rem',
      focusRing: '0 0 0 2px hsl(215 85% 35% / 0.3)',
    },
    outputs: {
      successColor: '160 75% 45%',
      errorColor: '0 70% 55%',
      warningColor: '45 90% 50%',
      infoColor: '200 85% 50%',
    },
  },
  commerce: {
    id: 'commerce',
    name: 'Commerce',
    description: 'Bold and conversion-focused',
    icon: '🛒',
    fonts: {
      heading: "'Playfair Display', Georgia, serif",
      body: "'Source Sans 3', system-ui, sans-serif",
    },
    animations: {
      transition: 'all 0.15s ease-out',
      transitionSlow: 'all 0.25s ease-out',
      buttonHover: 'scale(1.05)',
      cardHover: 'translateY(-4px) scale(1.01)',
    },
    inputs: {
      borderRadius: '0.375rem',
      focusRing: '0 0 0 3px hsl(25 95% 55% / 0.4)',
    },
    outputs: {
      successColor: '145 70% 40%',
      errorColor: '0 80% 50%',
      warningColor: '40 95% 50%',
      infoColor: '210 80% 55%',
    },
  },
  admin: {
    id: 'admin',
    name: 'Administration',
    description: 'Professional and data-focused',
    icon: '📊',
    fonts: {
      heading: "'IBM Plex Sans', system-ui, sans-serif",
      body: "'IBM Plex Sans', system-ui, sans-serif",
    },
    animations: {
      transition: 'all 0.1s ease-in-out',
      transitionSlow: 'all 0.2s ease-in-out',
      buttonHover: 'scale(1.01)',
      cardHover: 'translateY(-1px)',
    },
    inputs: {
      borderRadius: '0.25rem',
      focusRing: '0 0 0 2px hsl(220 70% 50% / 0.3)',
    },
    outputs: {
      successColor: '120 60% 45%',
      errorColor: '0 65% 50%',
      warningColor: '35 90% 55%',
      infoColor: '220 70% 50%',
    },
  },
  ai: {
    id: 'ai',
    name: 'AI / Tech',
    description: 'Futuristic and innovative',
    icon: '🤖',
    fonts: {
      heading: "'Space Grotesk', system-ui, sans-serif",
      body: "'JetBrains Mono', 'Fira Code', monospace",
    },
    animations: {
      transition: 'all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      transitionSlow: 'all 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      buttonHover: 'scale(1.03) rotate(0.5deg)',
      cardHover: 'translateY(-6px) rotate(-0.5deg)',
    },
    inputs: {
      borderRadius: '0.75rem',
      focusRing: '0 0 0 3px hsl(280 80% 60% / 0.4)',
    },
    outputs: {
      successColor: '150 80% 50%',
      errorColor: '350 80% 55%',
      warningColor: '50 100% 55%',
      infoColor: '280 80% 60%',
    },
  },
  nature: {
    id: 'nature',
    name: 'Nature',
    description: 'Organic and calming',
    icon: '🌿',
    fonts: {
      heading: "'Cormorant Garamond', Georgia, serif",
      body: "'Nunito', system-ui, sans-serif",
    },
    animations: {
      transition: 'all 0.35s cubic-bezier(0.25, 0.1, 0.25, 1)',
      transitionSlow: 'all 0.6s cubic-bezier(0.25, 0.1, 0.25, 1)',
      buttonHover: 'scale(1.02)',
      cardHover: 'translateY(-3px)',
    },
    inputs: {
      borderRadius: '1rem',
      focusRing: '0 0 0 2px hsl(140 50% 45% / 0.3)',
    },
    outputs: {
      successColor: '140 50% 45%',
      errorColor: '0 55% 50%',
      warningColor: '35 80% 55%',
      infoColor: '180 50% 45%',
    },
  },
};

interface ThemeContextType {
  currentTheme: ThemeId;
  themeConfig: ThemeConfig;
  setTheme: (theme: ThemeId) => void;
  isDark: boolean;
  toggleDark: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState<ThemeId>(() => {
    const saved = localStorage.getItem('app-theme');
    return (saved as ThemeId) || 'default';
  });

  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('app-dark-mode');
    return saved === 'true';
  });

  const themeConfig = themes[currentTheme];

  useEffect(() => {
    localStorage.setItem('app-theme', currentTheme);
    document.documentElement.setAttribute('data-theme', currentTheme);
    
    // Apply theme-specific fonts
    const config = themes[currentTheme];
    document.documentElement.style.setProperty('--font-heading', config.fonts.heading);
    document.documentElement.style.setProperty('--font-body', config.fonts.body);
    document.documentElement.style.setProperty('--transition', config.animations.transition);
    document.documentElement.style.setProperty('--transition-slow', config.animations.transitionSlow);
    document.documentElement.style.setProperty('--radius', config.inputs.borderRadius);
  }, [currentTheme]);

  useEffect(() => {
    localStorage.setItem('app-dark-mode', String(isDark));
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  const setTheme = (theme: ThemeId) => {
    setCurrentTheme(theme);
  };

  const toggleDark = () => {
    setIsDark(!isDark);
  };

  return (
    <ThemeContext.Provider value={{ currentTheme, themeConfig, setTheme, isDark, toggleDark }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
