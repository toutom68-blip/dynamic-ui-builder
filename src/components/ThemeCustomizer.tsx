import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme, themes, ThemeId } from '@/contexts/ThemeContext';
import { useCustomTheme } from '@/hooks/useCustomTheme';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from '@/components/ui/sheet';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Settings2, RotateCcw, Save, Palette, Type, Sparkles, Square } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface ColorPickerProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  presets?: string[];
}

const ColorPicker: React.FC<ColorPickerProps> = ({ label, value, onChange, presets }) => {
  const hslToHex = (hsl: string): string => {
    const parts = hsl.split(' ').map(p => parseFloat(p));
    if (parts.length < 3) return '#6366f1';
    const [h, s, l] = parts;
    const sDecimal = s / 100;
    const lDecimal = l / 100;
    const c = (1 - Math.abs(2 * lDecimal - 1)) * sDecimal;
    const x = c * (1 - Math.abs((h / 60) % 2 - 1));
    const m = lDecimal - c / 2;
    let r = 0, g = 0, b = 0;
    if (h < 60) { r = c; g = x; }
    else if (h < 120) { r = x; g = c; }
    else if (h < 180) { g = c; b = x; }
    else if (h < 240) { g = x; b = c; }
    else if (h < 300) { r = x; b = c; }
    else { r = c; b = x; }
    const toHex = (n: number) => Math.round((n + m) * 255).toString(16).padStart(2, '0');
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  };

  const hexToHsl = (hex: string): string => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) return value;
    const r = parseInt(result[1], 16) / 255;
    const g = parseInt(result[2], 16) / 255;
    const b = parseInt(result[3], 16) / 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s = 0;
    const l = (max + min) / 2;
    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = ((g - b) / d + (g < b ? 6 : 0)) * 60; break;
        case g: h = ((b - r) / d + 2) * 60; break;
        case b: h = ((r - g) / d + 4) * 60; break;
      }
    }
    return `${Math.round(h)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
  };

  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">{label}</Label>
      <div className="flex items-center gap-2">
        <div 
          className="w-10 h-10 rounded-md border border-border shadow-sm cursor-pointer overflow-hidden"
          style={{ backgroundColor: `hsl(${value})` }}
        >
          <input
            type="color"
            value={hslToHex(value)}
            onChange={(e) => onChange(hexToHsl(e.target.value))}
            className="w-full h-full opacity-0 cursor-pointer"
          />
        </div>
        <code className="text-xs bg-muted px-2 py-1 rounded flex-1 truncate">
          {value}
        </code>
      </div>
      {presets && (
        <div className="flex gap-1 flex-wrap">
          {presets.map((preset, i) => (
            <button
              key={i}
              className={cn(
                "w-6 h-6 rounded-full border-2 transition-transform hover:scale-110",
                value === preset ? "border-primary" : "border-transparent"
              )}
              style={{ backgroundColor: `hsl(${preset})` }}
              onClick={() => onChange(preset)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const FONT_OPTIONS = [
  { value: "'Inter', system-ui, sans-serif", label: "Inter" },
  { value: "'Outfit', system-ui, sans-serif", label: "Outfit" },
  { value: "'Space Grotesk', system-ui, sans-serif", label: "Space Grotesk" },
  { value: "'IBM Plex Sans', system-ui, sans-serif", label: "IBM Plex Sans" },
  { value: "'Playfair Display', Georgia, serif", label: "Playfair Display" },
  { value: "'Cormorant Garamond', Georgia, serif", label: "Cormorant Garamond" },
  { value: "'Source Sans 3', system-ui, sans-serif", label: "Source Sans 3" },
  { value: "'Nunito', system-ui, sans-serif", label: "Nunito" },
  { value: "'JetBrains Mono', monospace", label: "JetBrains Mono" },
  { value: "Georgia, serif", label: "Georgia" },
  { value: "system-ui, sans-serif", label: "System UI" },
];

const ANIMATION_PRESETS = [
  { value: 'none', label: 'None', transition: 'none', hover: 'none' },
  { value: 'subtle', label: 'Subtle', transition: 'all 0.15s ease-out', hover: 'scale(1.01)' },
  { value: 'smooth', label: 'Smooth', transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)', hover: 'scale(1.02)' },
  { value: 'bouncy', label: 'Bouncy', transition: 'all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)', hover: 'scale(1.05)' },
  { value: 'elegant', label: 'Elegant', transition: 'all 0.4s cubic-bezier(0.25, 0.1, 0.25, 1)', hover: 'translateY(-2px)' },
];

const COLOR_PRESETS = {
  primary: [
    '215 85% 35%', '220 70% 50%', '280 80% 60%', '25 95% 53%', 
    '140 50% 45%', '350 80% 55%', '200 90% 50%', '45 90% 50%'
  ],
  secondary: [
    '160 75% 45%', '220 15% 92%', '200 90% 50%', '45 90% 55%',
    '35 60% 55%', '320 80% 55%', '180 50% 45%', '0 0% 45%'
  ],
  accent: [
    '160 60% 50%', '200 80% 50%', '320 80% 55%', '350 80% 55%',
    '180 50% 45%', '45 90% 50%', '280 80% 60%', '25 95% 53%'
  ],
};

export const ThemeCustomizer: React.FC = () => {
  const { t } = useTranslation();
  const { currentTheme, setTheme } = useTheme();
  const { customColors, customFonts, customAnimations, customRadius, updateColors, updateFonts, updateAnimations, updateRadius, resetCustomizations, saveCustomizations } = useCustomTheme();
  
  const [isOpen, setIsOpen] = useState(false);

  const handleSave = () => {
    saveCustomizations();
    toast.success(t('themeCustomizer.saved'));
  };

  const handleReset = () => {
    resetCustomizations();
    toast.success(t('themeCustomizer.reset'));
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Settings2 className="h-4 w-4" />
          <span className="sr-only">{t('themeCustomizer.title')}</span>
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-lg overflow-hidden flex flex-col">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            {t('themeCustomizer.title')}
          </SheetTitle>
          <SheetDescription>
            {t('themeCustomizer.description')}
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="flex-1 -mx-6 px-6">
          <Tabs defaultValue="colors" className="mt-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="colors" className="text-xs sm:text-sm">
                <Palette className="h-4 w-4 mr-1 hidden sm:inline" />
                {t('themeCustomizer.tabs.colors')}
              </TabsTrigger>
              <TabsTrigger value="fonts" className="text-xs sm:text-sm">
                <Type className="h-4 w-4 mr-1 hidden sm:inline" />
                {t('themeCustomizer.tabs.fonts')}
              </TabsTrigger>
              <TabsTrigger value="animations" className="text-xs sm:text-sm">
                <Sparkles className="h-4 w-4 mr-1 hidden sm:inline" />
                {t('themeCustomizer.tabs.animations')}
              </TabsTrigger>
              <TabsTrigger value="spacing" className="text-xs sm:text-sm">
                <Square className="h-4 w-4 mr-1 hidden sm:inline" />
                {t('themeCustomizer.tabs.spacing')}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="colors" className="space-y-6 mt-4">
              <div className="space-y-4">
                <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                  {t('themeCustomizer.mainColors')}
                </h4>
                <ColorPicker
                  label={t('themeCustomizer.colors.primary')}
                  value={customColors.primary}
                  onChange={(v) => updateColors({ primary: v })}
                  presets={COLOR_PRESETS.primary}
                />
                <ColorPicker
                  label={t('themeCustomizer.colors.secondary')}
                  value={customColors.secondary}
                  onChange={(v) => updateColors({ secondary: v })}
                  presets={COLOR_PRESETS.secondary}
                />
                <ColorPicker
                  label={t('themeCustomizer.colors.accent')}
                  value={customColors.accent}
                  onChange={(v) => updateColors({ accent: v })}
                  presets={COLOR_PRESETS.accent}
                />
              </div>

              <div className="space-y-4">
                <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                  {t('themeCustomizer.backgroundColors')}
                </h4>
                <ColorPicker
                  label={t('themeCustomizer.colors.background')}
                  value={customColors.background}
                  onChange={(v) => updateColors({ background: v })}
                />
                <ColorPicker
                  label={t('themeCustomizer.colors.foreground')}
                  value={customColors.foreground}
                  onChange={(v) => updateColors({ foreground: v })}
                />
                <ColorPicker
                  label={t('themeCustomizer.colors.muted')}
                  value={customColors.muted}
                  onChange={(v) => updateColors({ muted: v })}
                />
              </div>

              {/* Live Preview */}
              <div className="space-y-2">
                <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                  {t('themeCustomizer.preview')}
                </h4>
                <div className="p-4 rounded-lg border bg-card space-y-3">
                  <div className="flex gap-2">
                    <Button size="sm">{t('themeCustomizer.previewPrimary')}</Button>
                    <Button size="sm" variant="secondary">{t('themeCustomizer.previewSecondary')}</Button>
                    <Button size="sm" variant="outline">{t('themeCustomizer.previewOutline')}</Button>
                  </div>
                  <div className="flex gap-2">
                    <div className="px-3 py-1 rounded text-xs bg-primary text-primary-foreground">Primary</div>
                    <div className="px-3 py-1 rounded text-xs bg-secondary text-secondary-foreground">Secondary</div>
                    <div className="px-3 py-1 rounded text-xs bg-accent text-accent-foreground">Accent</div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="fonts" className="space-y-6 mt-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>{t('themeCustomizer.fonts.heading')}</Label>
                  <Select
                    value={customFonts.heading}
                    onValueChange={(v) => updateFonts({ heading: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {FONT_OPTIONS.map((font) => (
                        <SelectItem key={font.value} value={font.value}>
                          <span style={{ fontFamily: font.value }}>{font.label}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p 
                    className="text-2xl mt-2"
                    style={{ fontFamily: customFonts.heading }}
                  >
                    {t('themeCustomizer.fonts.headingPreview')}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>{t('themeCustomizer.fonts.body')}</Label>
                  <Select
                    value={customFonts.body}
                    onValueChange={(v) => updateFonts({ body: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {FONT_OPTIONS.map((font) => (
                        <SelectItem key={font.value} value={font.value}>
                          <span style={{ fontFamily: font.value }}>{font.label}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p 
                    className="text-sm mt-2 text-muted-foreground"
                    style={{ fontFamily: customFonts.body }}
                  >
                    {t('themeCustomizer.fonts.bodyPreview')}
                  </p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="animations" className="space-y-6 mt-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>{t('themeCustomizer.animations.preset')}</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {ANIMATION_PRESETS.map((preset) => (
                      <Button
                        key={preset.value}
                        variant={customAnimations.preset === preset.value ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => updateAnimations({ 
                          preset: preset.value,
                          transition: preset.transition,
                          hover: preset.hover
                        })}
                        className="transition-all"
                        style={{ 
                          transition: preset.transition,
                        }}
                        onMouseEnter={(e) => {
                          if (preset.hover !== 'none') {
                            e.currentTarget.style.transform = preset.hover;
                          }
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'none';
                        }}
                      >
                        {preset.label}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>{t('themeCustomizer.animations.speed')}: {customAnimations.speed}ms</Label>
                  <Slider
                    value={[customAnimations.speed]}
                    onValueChange={([v]) => updateAnimations({ speed: v })}
                    min={0}
                    max={1000}
                    step={50}
                  />
                </div>

                {/* Animation Preview */}
                <div className="space-y-2">
                  <Label>{t('themeCustomizer.animations.preview')}</Label>
                  <div className="flex gap-4 p-4 bg-muted rounded-lg justify-center">
                    <div 
                      className="w-16 h-16 bg-primary rounded-lg cursor-pointer hover-theme"
                      style={{ transition: customAnimations.transition }}
                    />
                    <div 
                      className="w-16 h-16 bg-secondary rounded-lg cursor-pointer hover-card-theme"
                      style={{ transition: customAnimations.transition }}
                    />
                    <div 
                      className="w-16 h-16 bg-accent rounded-lg cursor-pointer"
                      style={{ 
                        transition: customAnimations.transition,
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = customAnimations.hover;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'none';
                      }}
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="spacing" className="space-y-6 mt-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>{t('themeCustomizer.spacing.borderRadius')}: {customRadius}rem</Label>
                  <Slider
                    value={[parseFloat(customRadius)]}
                    onValueChange={([v]) => updateRadius(`${v}rem`)}
                    min={0}
                    max={2}
                    step={0.125}
                  />
                </div>

                {/* Radius Preview */}
                <div className="space-y-2">
                  <Label>{t('themeCustomizer.spacing.preview')}</Label>
                  <div className="grid grid-cols-3 gap-4 p-4 bg-muted rounded-lg">
                    <div 
                      className="h-16 bg-primary"
                      style={{ borderRadius: customRadius }}
                    />
                    <div 
                      className="h-16 bg-secondary"
                      style={{ borderRadius: customRadius }}
                    />
                    <div 
                      className="h-16 bg-accent"
                      style={{ borderRadius: customRadius }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-2">
                  {['0rem', '0.25rem', '0.5rem', '0.75rem', '1rem', '1.5rem', '2rem', '9999px'].map((r) => (
                    <Button
                      key={r}
                      variant={customRadius === r ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => updateRadius(r)}
                      className="text-xs"
                    >
                      {r === '9999px' ? 'Full' : r}
                    </Button>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </ScrollArea>

        <SheetFooter className="flex-row gap-2 mt-4 pt-4 border-t">
          <Button variant="outline" onClick={handleReset} className="flex-1">
            <RotateCcw className="h-4 w-4 mr-2" />
            {t('themeCustomizer.resetBtn')}
          </Button>
          <Button onClick={handleSave} className="flex-1">
            <Save className="h-4 w-4 mr-2" />
            {t('themeCustomizer.saveBtn')}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};
