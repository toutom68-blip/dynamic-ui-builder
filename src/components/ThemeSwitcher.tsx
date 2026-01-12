import React from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme, themes, ThemeId } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Palette, Moon, Sun, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export const ThemeSwitcher: React.FC = () => {
  const { t } = useTranslation();
  const { currentTheme, setTheme, isDark, toggleDark } = useTheme();

  const themeList = Object.values(themes);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Palette className="h-4 w-4" />
          <span className="sr-only">{t('theme.switchTheme')}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 bg-popover border border-border">
        <DropdownMenuLabel className="flex items-center gap-2">
          <Palette className="h-4 w-4" />
          {t('theme.selectTheme')}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {themeList.map((theme) => (
          <DropdownMenuItem
            key={theme.id}
            onClick={() => setTheme(theme.id as ThemeId)}
            className={cn(
              'flex items-center gap-3 cursor-pointer',
              currentTheme === theme.id && 'bg-accent'
            )}
          >
            <span className="text-lg">{theme.icon}</span>
            <div className="flex-1">
              <div className="font-medium">{t(`theme.themes.${theme.id}.name`)}</div>
              <div className="text-xs text-muted-foreground">
                {t(`theme.themes.${theme.id}.description`)}
              </div>
            </div>
            {currentTheme === theme.id && (
              <Check className="h-4 w-4 text-primary" />
            )}
          </DropdownMenuItem>
        ))}
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem
          onClick={toggleDark}
          className="flex items-center gap-3 cursor-pointer"
        >
          {isDark ? (
            <>
              <Sun className="h-4 w-4" />
              <span>{t('theme.lightMode')}</span>
            </>
          ) : (
            <>
              <Moon className="h-4 w-4" />
              <span>{t('theme.darkMode')}</span>
            </>
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
