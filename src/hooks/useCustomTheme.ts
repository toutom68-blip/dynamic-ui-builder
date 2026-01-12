import { useState, useEffect, useCallback } from 'react';
import { useTheme } from '@/contexts/ThemeContext';

interface CustomColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  foreground: string;
  muted: string;
}

interface CustomFonts {
  heading: string;
  body: string;
}

interface CustomAnimations {
  preset: string;
  transition: string;
  hover: string;
  speed: number;
}

const DEFAULT_COLORS: CustomColors = {
  primary: '215 85% 35%',
  secondary: '160 75% 45%',
  accent: '160 60% 50%',
  background: '210 20% 98%',
  foreground: '215 25% 15%',
  muted: '210 15% 94%',
};

const DEFAULT_FONTS: CustomFonts = {
  heading: "'Outfit', 'Inter', system-ui, sans-serif",
  body: "'Inter', system-ui, sans-serif",
};

const DEFAULT_ANIMATIONS: CustomAnimations = {
  preset: 'smooth',
  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
  hover: 'scale(1.02)',
  speed: 200,
};

export const useCustomTheme = () => {
  const { currentTheme, isDark } = useTheme();

  const [customColors, setCustomColors] = useState<CustomColors>(() => {
    const saved = localStorage.getItem('custom-theme-colors');
    return saved ? JSON.parse(saved) : DEFAULT_COLORS;
  });

  const [customFonts, setCustomFonts] = useState<CustomFonts>(() => {
    const saved = localStorage.getItem('custom-theme-fonts');
    return saved ? JSON.parse(saved) : DEFAULT_FONTS;
  });

  const [customAnimations, setCustomAnimations] = useState<CustomAnimations>(() => {
    const saved = localStorage.getItem('custom-theme-animations');
    return saved ? JSON.parse(saved) : DEFAULT_ANIMATIONS;
  });

  const [customRadius, setCustomRadius] = useState<string>(() => {
    const saved = localStorage.getItem('custom-theme-radius');
    return saved || '0.5rem';
  });

  // Apply custom styles to document
  const applyCustomStyles = useCallback(() => {
    const root = document.documentElement;
    
    // Apply colors
    root.style.setProperty('--primary', customColors.primary);
    root.style.setProperty('--secondary', customColors.secondary);
    root.style.setProperty('--accent', customColors.accent);
    root.style.setProperty('--background', customColors.background);
    root.style.setProperty('--foreground', customColors.foreground);
    root.style.setProperty('--muted', customColors.muted);
    
    // Apply fonts
    root.style.setProperty('--font-heading', customFonts.heading);
    root.style.setProperty('--font-body', customFonts.body);
    
    // Apply animations
    root.style.setProperty('--transition', customAnimations.transition);
    root.style.setProperty('--animation-hover-scale', customAnimations.hover);
    
    // Apply radius
    root.style.setProperty('--radius', customRadius);
  }, [customColors, customFonts, customAnimations, customRadius]);

  useEffect(() => {
    applyCustomStyles();
  }, [applyCustomStyles]);

  const updateColors = (updates: Partial<CustomColors>) => {
    setCustomColors(prev => {
      const newColors = { ...prev, ...updates };
      return newColors;
    });
  };

  const updateFonts = (updates: Partial<CustomFonts>) => {
    setCustomFonts(prev => {
      const newFonts = { ...prev, ...updates };
      return newFonts;
    });
  };

  const updateAnimations = (updates: Partial<CustomAnimations>) => {
    setCustomAnimations(prev => {
      const newAnimations = { ...prev, ...updates };
      if (updates.speed !== undefined) {
        newAnimations.transition = `all ${updates.speed}ms cubic-bezier(0.4, 0, 0.2, 1)`;
      }
      return newAnimations;
    });
  };

  const updateRadius = (radius: string) => {
    setCustomRadius(radius);
  };

  const resetCustomizations = () => {
    setCustomColors(DEFAULT_COLORS);
    setCustomFonts(DEFAULT_FONTS);
    setCustomAnimations(DEFAULT_ANIMATIONS);
    setCustomRadius('0.5rem');
    localStorage.removeItem('custom-theme-colors');
    localStorage.removeItem('custom-theme-fonts');
    localStorage.removeItem('custom-theme-animations');
    localStorage.removeItem('custom-theme-radius');
  };

  const saveCustomizations = () => {
    localStorage.setItem('custom-theme-colors', JSON.stringify(customColors));
    localStorage.setItem('custom-theme-fonts', JSON.stringify(customFonts));
    localStorage.setItem('custom-theme-animations', JSON.stringify(customAnimations));
    localStorage.setItem('custom-theme-radius', customRadius);
  };

  return {
    customColors,
    customFonts,
    customAnimations,
    customRadius,
    updateColors,
    updateFonts,
    updateAnimations,
    updateRadius,
    resetCustomizations,
    saveCustomizations,
  };
};
