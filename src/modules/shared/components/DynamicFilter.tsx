import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import {
  Filter,
  X,
  ChevronDown,
  Search,
  Calendar as CalendarIcon,
  LucideIcon,
} from 'lucide-react';
import { format } from 'date-fns';

// Types
export type FilterType = 'text' | 'number' | 'select' | 'multiselect' | 'range' | 'date' | 'daterange' | 'boolean';

export interface FilterOption {
  label: string;
  value: string | number;
}

export interface FilterConfig {
  id: string;
  name: string;
  icon: LucideIcon;
  type: FilterType;
  placeholder?: string;
  options?: FilterOption[];
  min?: number;
  max?: number;
  step?: number;
  defaultValue?: any;
}

export interface ActiveFilter {
  id: string;
  config: FilterConfig;
  value: any;
  position: number;
}

export interface DynamicFilterProps {
  filters: FilterConfig[];
  onFiltersChange?: (activeFilters: ActiveFilter[]) => void;
  onFilterApply?: (filter: ActiveFilter) => void;
  onFilterRemove?: (filterId: string) => void;
  onFilterCancel?: (filterId: string) => void;
  className?: string;
  buttonLabel?: string;
  searchButtonLabel?: string;
  cancelButtonLabel?: string;
  maxActiveFilters?: number;
}

interface FilterEditorProps {
  config: FilterConfig;
  value: any;
  onChange: (value: any) => void;
}

// Filter Editor Component
const FilterEditor: React.FC<FilterEditorProps> = ({ config, value, onChange }) => {
  const { t } = useTranslation();

  switch (config.type) {
    case 'text':
      return (
        <div className="space-y-2">
          <Label>{config.name}</Label>
          <Input
            placeholder={config.placeholder || t('grid.filters.search')}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            className="w-full"
          />
        </div>
      );

    case 'number':
      return (
        <div className="space-y-2">
          <Label>{config.name}</Label>
          <Input
            type="number"
            placeholder={config.placeholder}
            value={value || ''}
            onChange={(e) => onChange(e.target.value ? Number(e.target.value) : null)}
            min={config.min}
            max={config.max}
            step={config.step}
            className="w-full"
          />
        </div>
      );

    case 'select':
      return (
        <div className="space-y-2">
          <Label>{config.name}</Label>
          <Select value={value || ''} onValueChange={onChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder={config.placeholder || t('grid.filters.select')} />
            </SelectTrigger>
            <SelectContent className="bg-popover border border-border z-50">
              {config.options?.map((option) => (
                <SelectItem key={String(option.value)} value={String(option.value)}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      );

    case 'multiselect':
      return (
        <div className="space-y-2">
          <Label>{config.name}</Label>
          <div className="space-y-2 max-h-48 overflow-y-auto border border-border rounded-md p-2">
            {config.options?.map((option) => (
              <div key={String(option.value)} className="flex items-center space-x-2">
                <Checkbox
                  id={`${config.id}-${option.value}`}
                  checked={(value || []).includes(option.value)}
                  onCheckedChange={(checked) => {
                    const currentValue = value || [];
                    if (checked) {
                      onChange([...currentValue, option.value]);
                    } else {
                      onChange(currentValue.filter((v: any) => v !== option.value));
                    }
                  }}
                />
                <Label htmlFor={`${config.id}-${option.value}`} className="text-sm cursor-pointer">
                  {option.label}
                </Label>
              </div>
            ))}
          </div>
        </div>
      );

    case 'range':
      return (
        <div className="space-y-4">
          <Label>{config.name}</Label>
          <div className="px-2">
            <Slider
              value={value || [config.min || 0, config.max || 100]}
              min={config.min || 0}
              max={config.max || 100}
              step={config.step || 1}
              onValueChange={onChange}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-2">
              <span>{value?.[0] ?? config.min ?? 0}</span>
              <span>{value?.[1] ?? config.max ?? 100}</span>
            </div>
          </div>
        </div>
      );

    case 'date':
      return (
        <div className="space-y-2">
          <Label>{config.name}</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  'w-full justify-start text-left font-normal',
                  !value && 'text-muted-foreground'
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {value ? format(new Date(value), 'PPP') : config.placeholder || t('grid.filters.selectDate')}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 bg-popover border border-border z-50" align="start">
              <Calendar
                mode="single"
                selected={value ? new Date(value) : undefined}
                onSelect={(date) => onChange(date?.toISOString())}
                initialFocus
                className="pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>
      );

    case 'daterange':
      return (
        <div className="space-y-2">
          <Label>{config.name}</Label>
          <div className="flex gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'flex-1 justify-start text-left font-normal text-xs',
                    !value?.from && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-1 h-3 w-3" />
                  {value?.from ? format(new Date(value.from), 'PP') : t('grid.filters.from')}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-popover border border-border z-50" align="start">
                <Calendar
                  mode="single"
                  selected={value?.from ? new Date(value.from) : undefined}
                  onSelect={(date) => onChange({ ...value, from: date?.toISOString() })}
                  initialFocus
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'flex-1 justify-start text-left font-normal text-xs',
                    !value?.to && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-1 h-3 w-3" />
                  {value?.to ? format(new Date(value.to), 'PP') : t('grid.filters.to')}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-popover border border-border z-50" align="start">
                <Calendar
                  mode="single"
                  selected={value?.to ? new Date(value.to) : undefined}
                  onSelect={(date) => onChange({ ...value, to: date?.toISOString() })}
                  initialFocus
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
      );

    case 'boolean':
      return (
        <div className="flex items-center space-x-2">
          <Checkbox
            id={config.id}
            checked={value || false}
            onCheckedChange={onChange}
          />
          <Label htmlFor={config.id} className="cursor-pointer">
            {config.name}
          </Label>
        </div>
      );

    default:
      return null;
  }
};

// Active Filter Button Component
interface ActiveFilterButtonProps {
  filter: ActiveFilter;
  onRemove: () => void;
  onEdit: () => void;
  isEditing: boolean;
  editValue: any;
  onEditValueChange: (value: any) => void;
  onSearch: () => void;
  onCancel: () => void;
  searchButtonLabel: string;
  cancelButtonLabel: string;
}

const ActiveFilterButton: React.FC<ActiveFilterButtonProps> = ({
  filter,
  onRemove,
  onEdit,
  isEditing,
  editValue,
  onEditValueChange,
  onSearch,
  onCancel,
  searchButtonLabel,
  cancelButtonLabel,
}) => {
  const { t } = useTranslation();
  const Icon = filter.config.icon;
  const popoverRef = useRef < HTMLDivElement > (null);

  const getDisplayValue = useCallback(() => {
    if (!filter.value) return '';

    switch (filter.config.type) {
      case 'select':
        const option = filter.config.options?.find(o => String(o.value) === String(filter.value));
        return option?.label || filter.value;
      case 'multiselect':
        return t('dynamicFilter.selected', { count: filter.value.length });
      case 'range':
        return `${filter.value[0]} - ${filter.value[1]}`;
      case 'date':
        return format(new Date(filter.value), 'PP');
      case 'daterange':
        const from = filter.value.from ? format(new Date(filter.value.from), 'PP') : '...';
        const to = filter.value.to ? format(new Date(filter.value.to), 'PP') : '...';
        return `${from} - ${to}`;
      case 'boolean':
        return filter.value ? t('common.yes') : t('common.no');
      default:
        return String(filter.value);
    }
  }, [filter, t]);

  const onInteractOutside = (e: any) => {
    if (popoverRef.current && !popoverRef.current.contains(e.target)) {
      onCancel();
    }
    e.stopPropagation();
    return false;
  }

  return (
    <div id="dynamic-filters" className="flex items-center gap-1">
      <Popover open={isEditing}
        onOpenChange={(open) => {
          if (!open) {
            console.log('outside click detected >>> open : ', open);
            console.log('outside click detected >>> isEditing : ', isEditing);
            // onCancel(); // fermeture propre
          }
          // setIsEditing(open);
        }}

      >
        <PopoverTrigger asChild>
          <Button
            variant="secondary"
            size="sm"
            className="h-8 gap-1 pr-1"
            onClick={onEdit}
          >
            <Icon className="h-3.5 w-3.5" />
            <span className="text-xs">{filter.config.name}</span>
            {filter.value && (
              <span className="text-xs text-muted-foreground ml-1 max-w-24 truncate">
                : {getDisplayValue()}
              </span>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="h-5 w-5 p-0 ml-1 hover:bg-destructive/20"
              onClick={(e) => {
                e.stopPropagation();
                onRemove();
              }}
            >
              <X className="h-3 w-3" />
            </Button>
          </Button>
        </PopoverTrigger>
        <PopoverContent
          ref={popoverRef}
          className="w-72 p-4 bg-popover border border-border z-50"
          align="start"
          onPointerDownOutside={onInteractOutside}
        >
          <div className="space-y-4">
            <FilterEditor
              config={filter.config}
              value={editValue}
              onChange={onEditValueChange}
            />
            <div className="flex justify-end gap-2 pt-2 border-t border-border">
              <Button variant="outline" size="sm" onClick={onCancel}>
                {cancelButtonLabel}
              </Button>
              <Button size="sm" onClick={onSearch}>
                <Search className="h-3.5 w-3.5 mr-1" />
                {searchButtonLabel}
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

// Main DynamicFilter Component
export const DynamicFilter: React.FC<DynamicFilterProps> = ({
  filters,
  onFiltersChange,
  onFilterApply,
  onFilterRemove,
  onFilterCancel,
  className,
  buttonLabel,
  searchButtonLabel,
  cancelButtonLabel,
  maxActiveFilters,
}) => {
  const { t } = useTranslation();

  // State
  const [availableFilters, setAvailableFilters] = useState < FilterConfig[] > (filters);
  const [activeFilters, setActiveFilters] = useState < ActiveFilter[] > ([]);
  const [editingFilterId, setEditingFilterId] = useState < string | null > (null);
  const [editValue, setEditValue] = useState < any > (null);
  const [pendingFilter, setPendingFilter] = useState < { config: FilterConfig; position: number } | null > (null);
  const [menuOpen, setMenuOpen] = useState(false);

  // Labels
  const filterButtonLabel = buttonLabel || t('dynamicFilter.addFilter', 'Add Filter');
  const searchLabel = searchButtonLabel || t('dynamicFilter.search', 'Search');
  const cancelLabel = cancelButtonLabel || t('dynamicFilter.cancel', 'Cancel');

  // Sync available filters when filters prop changes
  useEffect(() => {
    const activeIds = activeFilters.map(f => f.id);
    setAvailableFilters(filters.filter(f => !activeIds.includes(f.id)));
  }, [filters, activeFilters]);

  // Notify parent of filter changes
  // useEffect(() => {
  //   onFiltersChange?.(activeFilters);
  // }, [activeFilters, onFiltersChange]);

  // Handle selecting a filter from menu
  const handleFilterSelect = useCallback((config: FilterConfig) => {
    const position = filters.findIndex(f => f.id === config.id);
    setPendingFilter({ config, position });
    setEditValue(config.defaultValue || null);
    setMenuOpen(false);

    // Add to active filters with pending state
    const newActiveFilter: ActiveFilter = {
      id: config.id,
      config,
      value: null,
      position,
    };

    setActiveFilters(prev => {
      const newFilters = [...prev, newActiveFilter];
      return newFilters.sort((a, b) => a.position - b.position);
    });

    setAvailableFilters(prev => prev.filter(f => f.id !== config.id));
    setEditingFilterId(config.id);
  }, [filters]);

  // Handle search (apply filter)
  const handleSearch = useCallback(() => {
    if (!editingFilterId) return;

    const hasValue = editValue !== null && editValue !== '' &&
      (Array.isArray(editValue) ? editValue.length > 0 : true);

    if (!hasValue) {
      // If no value selected, treat as cancel
      handleCancel();
      return;
    }

    setActiveFilters(prev =>
      prev.map(f =>
        f.id === editingFilterId
          ? { ...f, value: editValue }
          : f
      )
    );

    const appliedFilter = activeFilters.find(f => f.id === editingFilterId);
    if (appliedFilter) {
      onFilterApply?.({ ...appliedFilter, value: editValue });
    }

    setEditingFilterId(null);
    setEditValue(null);
    setPendingFilter(null);
  }, [editingFilterId, editValue, activeFilters, onFilterApply]);

  // Handle cancel (return filter to menu)
  const handleCancel = useCallback(() => {
    if (!editingFilterId) return;

    const filter = activeFilters.find(f => f.id === editingFilterId);

    // If filter has no value, remove it from active and return to available
    if (filter && !filter.value) {
      setActiveFilters(prev => prev.filter(f => f.id !== editingFilterId));
      setAvailableFilters(prev => {
        const updated = [...prev, filter.config];
        return updated.sort((a, b) => {
          const posA = filters.findIndex(f => f.id === a.id);
          const posB = filters.findIndex(f => f.id === b.id);
          return posA - posB;
        });
      });
    }

    onFilterCancel?.(editingFilterId);
    setEditingFilterId(null);
    setEditValue(null);
    setPendingFilter(null);
  }, [editingFilterId, activeFilters, filters, onFilterCancel]);

  // Handle remove filter
  const handleRemove = useCallback((filterId: string) => {
    const filter = activeFilters.find(f => f.id === filterId);
    if (!filter) return;

    setActiveFilters(prev => prev.filter(f => f.id !== filterId));
    setAvailableFilters(prev => {
      const updated = [...prev, filter.config];
      return updated.sort((a, b) => {
        const posA = filters.findIndex(f => f.id === a.id);
        const posB = filters.findIndex(f => f.id === b.id);
        return posA - posB;
      });
    });

    onFilterRemove?.(filterId);

    if (editingFilterId === filterId) {
      setEditingFilterId(null);
      setEditValue(null);
      setPendingFilter(null);
    }
  }, [activeFilters, filters, editingFilterId, onFilterRemove]);

  // Handle edit existing filter
  const handleEdit = useCallback((filterId: string) => {
    const filter = activeFilters.find(f => f.id === filterId);
    if (filter) {
      setEditingFilterId(filterId);
      setEditValue(filter.value);
    }
  }, [activeFilters]);

  // Check if max filters reached
  const maxReached = maxActiveFilters !== undefined && activeFilters.length >= maxActiveFilters;

  return (
    <div className={cn('flex flex-wrap items-center gap-2', className)}>
      {/* Add Filter Button */}
      {availableFilters.length > 0 && !maxReached && (
        <Popover open={menuOpen} onOpenChange={setMenuOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="h-8 gap-1">
              <Filter className="h-3.5 w-3.5" />
              <span className="text-xs">{filterButtonLabel}</span>
              <ChevronDown className="h-3 w-3" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-56 p-2 bg-popover border border-border z-50" align="start">
            <div className="space-y-1">
              {availableFilters.map((config) => {
                const Icon = config.icon;
                return (
                  <Button
                    key={config.id}
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start gap-2 h-9"
                    onClick={() => handleFilterSelect(config)}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{config.name}</span>
                  </Button>
                );
              })}
            </div>
          </PopoverContent>
        </Popover>
      )}

      {/* Active Filters */}
      {activeFilters.map((filter) => (
        <ActiveFilterButton
          key={filter.id}
          filter={filter}
          onRemove={() => handleRemove(filter.id)}
          onEdit={() => handleEdit(filter.id)}
          isEditing={editingFilterId === filter.id}
          editValue={editingFilterId === filter.id ? editValue : filter.value}
          onEditValueChange={setEditValue}
          onSearch={handleSearch}
          onCancel={handleCancel}
          searchButtonLabel={searchLabel}
          cancelButtonLabel={cancelLabel}
        />
      ))}
    </div>
  );
};

export default DynamicFilter;
