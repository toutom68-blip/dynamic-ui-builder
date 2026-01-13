import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { buildComponentStyles } from '@/utils/styleBuilder';
import { Input } from '@/components/ui/input';
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Check, Loader2, X, ChevronDown, RefreshCw, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AutocompleteProps, AutocompleteOption } from '@/types/component.types';
import { useDataFetch } from '@/hooks/useDataFetch';

// Skeleton component for loading state
const AutocompleteItemSkeleton: React.FC = () => (
  <div className="flex items-center gap-2 p-2 animate-pulse">
    <Skeleton className="h-4 w-4 rounded flex-shrink-0" />
    <div className="flex-1 space-y-1">
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-3 w-2/3" />
    </div>
  </div>
);

const AutocompleteLoadingSkeleton: React.FC<{ count?: number }> = ({ count = 4 }) => (
  <div className="p-1">
    {Array.from({ length: count }).map((_, i) => (
      <AutocompleteItemSkeleton key={i} />
    ))}
  </div>
);

// Error state component
const AutocompleteError: React.FC<{ 
  error: string; 
  onRetry?: () => void;
  retryCount?: number;
  maxRetries?: number;
}> = ({ error, onRetry, retryCount = 0, maxRetries = 3 }) => (
  <div className="p-3 space-y-2">
    <div className="flex items-center gap-2 text-destructive">
      <AlertCircle className="h-4 w-4 flex-shrink-0" />
      <span className="text-sm">{error}</span>
    </div>
    {onRetry && retryCount < maxRetries && (
      <Button
        variant="outline"
        size="sm"
        onClick={onRetry}
        className="w-full"
      >
        <RefreshCw className="h-3 w-3 mr-2" />
        Retry ({maxRetries - retryCount} attempts left)
      </Button>
    )}
  </div>
);

export const DynamicAutocomplete: React.FC<AutocompleteProps> = ({
  // Data source
  options = [],
  apiEndpoint,
  apiMethod = 'GET',
  apiHeaders,
  apiQueryParam = 'q',
  apiResponsePath,
  apiDebounceMs = 300,
  
  // Search configuration
  searchProperties = [],
  displayProperty = 'label',
  valueProperty = 'value',
  iconProperty,
  groupProperty,
  
  // Item visibility
  disabledProperties = [],
  hiddenProperties = [],
  
  // Component state
  value,
  placeholder = 'Search...',
  name,
  required,
  
  // Behavior
  minSearchLength = 1,
  maxResults = 10,
  clearable = true,
  freeSolo = false,
  multiSelect = false,
  maxSelections,
  
  // Callbacks
  onChange,
  onSelect,
  onClear,
  onApiError,
  onRemove,
  
  // Styling
  ...baseProps
}) => {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [selectedOption, setSelectedOption] = useState<AutocompleteOption | null>(null);
  const [selectedOptions, setSelectedOptions] = useState<AutocompleteOption[]>([]);
  const [filteredOptions, setFilteredOptions] = useState<AutocompleteOption[]>([]);
  
  const inputRef = useRef<HTMLInputElement>(null);
  
  const { style, className } = buildComponentStyles(baseProps, 'transition-base');

  // API fetcher function for useDataFetch
  const apiFetcher = useCallback(async (params?: Record<string, any>): Promise<any[]> => {
    const searchTerm = params?.searchTerm || '';
    if (!apiEndpoint || searchTerm.length < minSearchLength) {
      return [];
    }
    
    let url = apiEndpoint;
    const fetchOptions: RequestInit = {
      method: apiMethod,
      headers: {
        'Content-Type': 'application/json',
        ...apiHeaders
      }
    };
    
    if (apiMethod === 'GET') {
      const separator = url.includes('?') ? '&' : '?';
      url = `${url}${separator}${apiQueryParam}=${encodeURIComponent(searchTerm)}`;
    } else {
      fetchOptions.body = JSON.stringify({ [apiQueryParam]: searchTerm });
    }
    
    const response = await globalThis.fetch(url, fetchOptions);
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    return response.json();
  }, [apiEndpoint, apiMethod, apiHeaders, apiQueryParam, minSearchLength]);

  // Use the data fetch hook for API calls
  const {
    data: apiData,
    isLoading: loading,
    error: fetchError,
    showSkeleton,
    retryCount,
    fetch: fetchApiData,
    retry: retryFetch,
  } = useDataFetch<any[]>(apiFetcher, {
    initialData: [],
    debounceMs: apiDebounceMs,
    maxRetries: 3,
    responsePath: apiResponsePath,
    onError: (err) => onApiError?.(err),
  });

  const error = fetchError?.message || null;
  const apiOptions = apiData || [];

  // Get nested value from object using dot notation
  const getNestedValue = useCallback((obj: any, path: string): any => {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }, []);

  // Normalize options to standard format
  const normalizeOption = useCallback((item: any): AutocompleteOption => {
    if (typeof item === 'string') {
      return { label: item, value: item };
    }
    
    const label = displayProperty ? getNestedValue(item, displayProperty) : item.label || String(item);
    const optValue = valueProperty ? getNestedValue(item, valueProperty) : item.value || item;
    const icon = iconProperty ? getNestedValue(item, iconProperty) : item.icon;
    const group = groupProperty ? getNestedValue(item, groupProperty) : item.group;
    
    // Check if item should be disabled or hidden
    const isDisabled = disabledProperties.some(prop => {
      const propValue = getNestedValue(item, prop);
      return propValue === true || propValue === 'true' || propValue === 1;
    });
    
    const isHidden = hiddenProperties.some(prop => {
      const propValue = getNestedValue(item, prop);
      return propValue === true || propValue === 'true' || propValue === 1;
    });
    
    return {
      label: String(label),
      value: optValue,
      icon,
      group,
      disabled: isDisabled,
      hidden: isHidden,
      originalData: item
    };
  }, [displayProperty, valueProperty, iconProperty, groupProperty, disabledProperties, hiddenProperties, getNestedValue]);

  // Filter options based on search
  const filterLocalOptions = useCallback((searchTerm: string): AutocompleteOption[] => {
    if (!searchTerm || searchTerm.length < minSearchLength) {
      return [];
    }
    
    const lowerSearch = searchTerm.toLowerCase();
    const sourceOptions = apiEndpoint ? apiOptions : options;
    
    return sourceOptions
      .map(normalizeOption)
      .filter(option => {
        if (option.hidden) return false;
        
        // In multi-select, filter out already selected options
        if (multiSelect && selectedOptions.some(sel => sel.value === option.value)) {
          return false;
        }
        
        // If searchProperties specified, search in those
        if (searchProperties.length > 0 && option.originalData) {
          return searchProperties.some(prop => {
            const propValue = getNestedValue(option.originalData, prop);
            return String(propValue || '').toLowerCase().includes(lowerSearch);
          });
        }
        
        // Default: search in label
        return option.label.toLowerCase().includes(lowerSearch);
      })
      .slice(0, maxResults);
  }, [options, apiOptions, apiEndpoint, searchProperties, minSearchLength, maxResults, normalizeOption, multiSelect, selectedOptions, getNestedValue]);

  // Group options by their group property
  const groupedOptions = useMemo(() => {
    const groups: Record<string, AutocompleteOption[]> = {};
    const ungrouped: AutocompleteOption[] = [];
    
    filteredOptions.forEach(option => {
      if (option.group) {
        if (!groups[option.group]) {
          groups[option.group] = [];
        }
        groups[option.group].push(option);
      } else {
        ungrouped.push(option);
      }
    });
    
    return { groups, ungrouped };
  }, [filteredOptions]);

  // Trigger API fetch when input changes (using the hook)
  const triggerApiSearch = useCallback((searchTerm: string) => {
    if (apiEndpoint && searchTerm.length >= minSearchLength) {
      fetchApiData({ searchTerm });
    }
  }, [apiEndpoint, minSearchLength, fetchApiData]);

  // Update filtered options when input or source changes
  useEffect(() => {
    const filtered = filterLocalOptions(inputValue);
    setFilteredOptions(filtered);
  }, [inputValue, filterLocalOptions]);

  // Initialize selected option(s) from value prop
  useEffect(() => {
    if (value !== undefined && value !== null) {
      const sourceOptions = apiEndpoint ? apiOptions : options;
      
      if (multiSelect && Array.isArray(value)) {
        const foundOptions = value
          .map(v => sourceOptions.map(normalizeOption).find(opt => opt.value === v))
          .filter((opt): opt is AutocompleteOption => opt !== undefined);
        setSelectedOptions(foundOptions);
      } else if (!multiSelect) {
        const found = sourceOptions
          .map(normalizeOption)
          .find(opt => opt.value === value);
        
        if (found) {
          setSelectedOption(found);
          setInputValue(found.label);
        } else if (typeof value === 'string') {
          setInputValue(value);
        }
      }
    }
  }, [value, options, apiOptions, apiEndpoint, normalizeOption, multiSelect]);

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    setOpen(true);
    
    if (apiEndpoint) {
      triggerApiSearch(newValue);
    }
    
    // For freeSolo mode, also call onChange with input value
    if (freeSolo && onChange && !multiSelect) {
      onChange(newValue);
    }
  };

  // Handle option select
  const handleSelect = (option: AutocompleteOption) => {
    if (option.disabled) return;
    
    if (multiSelect) {
      // Check max selections
      if (maxSelections && selectedOptions.length >= maxSelections) {
        return;
      }
      
      const newSelected = [...selectedOptions, option];
      setSelectedOptions(newSelected);
      setInputValue('');
      
      // Call onChange with array of values
      onChange?.(newSelected.map(opt => opt.value));
      onSelect?.(option);
    } else {
      setSelectedOption(option);
      setInputValue(option.label);
      setOpen(false);
      
      // Call onChange with value
      onChange?.(option.value);
      onSelect?.(option);
    }
  };

  // Handle remove selected option (multi-select)
  const handleRemoveOption = (optionToRemove: AutocompleteOption, e?: React.MouseEvent) => {
    e?.stopPropagation();
    
    const newSelected = selectedOptions.filter(opt => opt.value !== optionToRemove.value);
    setSelectedOptions(newSelected);
    
    onChange?.(newSelected.map(opt => opt.value));
    onRemove?.(optionToRemove);
  };

  // Handle clear
  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setInputValue('');
    
    if (multiSelect) {
      setSelectedOptions([]);
      onChange?.([]);
    } else {
      setSelectedOption(null);
      onChange?.(undefined);
    }
    
    setFilteredOptions([]);
    onClear?.();
    inputRef.current?.focus();
  };

  // Render option item
  const renderOptionItem = (option: AutocompleteOption, index: number) => {
    const isSelected = multiSelect 
      ? selectedOptions.some(sel => sel.value === option.value)
      : selectedOption?.value === option.value;
    
    return (
      <CommandItem
        key={`${option.value}-${index}`}
        value={String(option.value)}
        onSelect={() => handleSelect(option)}
        disabled={option.disabled}
        className={cn(
          "cursor-pointer",
          option.disabled && "opacity-50 cursor-not-allowed"
        )}
      >
        <div className="flex items-center gap-2 w-full">
          {option.icon && (
            <span className="flex-shrink-0">
              {typeof option.icon === 'string' ? (
                <img 
                  src={option.icon} 
                  alt="" 
                  className="h-4 w-4 object-contain" 
                />
              ) : (
                option.icon
              )}
            </span>
          )}
          
          <span className="flex-1 truncate">{option.label}</span>
          
          {isSelected && (
            <Check className="h-4 w-4 flex-shrink-0 text-primary" />
          )}
        </div>
      </CommandItem>
    );
  };

  if (baseProps.hidden) return null;

  // Multi-select render
  if (multiSelect) {
    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <div 
            className={cn(
              "relative min-h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background",
              "focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
              baseProps.disabled && "opacity-50 cursor-not-allowed",
              className
            )} 
            style={style}
          >
            <div className="flex flex-wrap gap-1.5 items-center">
              {/* Selected badges */}
              {selectedOptions.map((option, idx) => (
                <Badge
                  key={`selected-${option.value}-${idx}`}
                  variant="secondary"
                  className="gap-1 pr-1"
                >
                  {option.icon && (
                    <span className="flex-shrink-0">
                      {typeof option.icon === 'string' ? (
                        <img src={option.icon} alt="" className="h-3 w-3 object-contain" />
                      ) : (
                        option.icon
                      )}
                    </span>
                  )}
                  <span className="truncate max-w-[150px]">{option.label}</span>
                  <button
                    type="button"
                    onClick={(e) => handleRemoveOption(option, e)}
                    className="ml-0.5 rounded-full hover:bg-muted-foreground/20 p-0.5"
                    disabled={baseProps.disabled}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
              
              {/* Input field */}
              <Input
                ref={inputRef}
                type="text"
                name={name}
                value={inputValue}
                onChange={handleInputChange}
                onFocus={() => setOpen(true)}
                placeholder={selectedOptions.length === 0 ? placeholder : ''}
                disabled={baseProps.disabled || (maxSelections !== undefined && selectedOptions.length >= maxSelections)}
                className="flex-1 min-w-[80px] border-0 p-0 h-6 focus-visible:ring-0 focus-visible:ring-offset-0"
              />
              
              {/* Loading / Clear / Chevron */}
              <div className="flex items-center gap-1 ml-auto">
                {loading && (
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                )}
                
                {clearable && selectedOptions.length > 0 && !loading && (
                  <button
                    type="button"
                    onClick={handleClear}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                    disabled={baseProps.disabled}
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
                
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>
          </div>
        </PopoverTrigger>
        
        <PopoverContent 
          className="w-[var(--radix-popover-trigger-width)] p-0 bg-popover border border-border shadow-lg z-50" 
          align="start"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <Command shouldFilter={false} className="bg-popover">
            <CommandList className="max-h-[300px]">
              {error && (
                <AutocompleteError 
                  error={error} 
                  onRetry={retryFetch}
                  retryCount={retryCount}
                  maxRetries={3}
                />
              )}
              
              {/* Loading skeleton */}
              {loading && inputValue.length >= minSearchLength && (
                <AutocompleteLoadingSkeleton count={4} />
              )}
              
              {!loading && filteredOptions.length === 0 && inputValue.length >= minSearchLength && (
                <CommandEmpty>No results found.</CommandEmpty>
              )}
              
              {inputValue.length < minSearchLength && !loading && (
                <div className="px-3 py-2 text-sm text-muted-foreground">
                  Type at least {minSearchLength} character{minSearchLength > 1 ? 's' : ''} to search...
                </div>
              )}
              
              {maxSelections && selectedOptions.length >= maxSelections && (
                <div className="px-3 py-2 text-sm text-muted-foreground">
                  Maximum {maxSelections} selection{maxSelections > 1 ? 's' : ''} reached.
                </div>
              )}
              
              {/* Render grouped options */}
              {!loading && Object.entries(groupedOptions.groups).map(([groupName, groupOptions]) => (
                <CommandGroup key={groupName} heading={groupName} className="bg-popover">
                  {groupOptions.map((option, index) => renderOptionItem(option, index))}
                </CommandGroup>
              ))}
              
              {/* Render ungrouped options */}
              {!loading && groupedOptions.ungrouped.length > 0 && (
                <CommandGroup className="bg-popover">
                  {groupedOptions.ungrouped.map((option, index) => renderOptionItem(option, index))}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    );
  }

  // Single select render
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div className={cn("relative", className)} style={style}>
          <Input
            ref={inputRef}
            type="text"
            name={name}
            value={inputValue}
            onChange={handleInputChange}
            onFocus={() => setOpen(true)}
            placeholder={placeholder}
            disabled={baseProps.disabled}
            required={required}
            className={cn(
              "w-full pr-8",
              loading && "pr-16"
            )}
          />
          
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
            {loading && (
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            )}
            
            {clearable && inputValue && !loading && (
              <button
                type="button"
                onClick={handleClear}
                className="text-muted-foreground hover:text-foreground transition-colors"
                disabled={baseProps.disabled}
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </PopoverTrigger>
      
      <PopoverContent 
        className="w-[var(--radix-popover-trigger-width)] p-0 bg-popover border border-border shadow-lg z-50" 
        align="start"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <Command shouldFilter={false} className="bg-popover">
          <CommandList className="max-h-[300px]">
            {error && (
              <AutocompleteError 
                error={error} 
                onRetry={retryFetch}
                retryCount={retryCount}
                maxRetries={3}
              />
            )}
            
            {/* Loading skeleton */}
            {loading && inputValue.length >= minSearchLength && (
              <AutocompleteLoadingSkeleton count={4} />
            )}
            
            {!loading && filteredOptions.length === 0 && inputValue.length >= minSearchLength && (
              <CommandEmpty>No results found.</CommandEmpty>
            )}
            
            {inputValue.length < minSearchLength && !loading && (
              <div className="px-3 py-2 text-sm text-muted-foreground">
                Type at least {minSearchLength} character{minSearchLength > 1 ? 's' : ''} to search...
              </div>
            )}
            
            {/* Render grouped options */}
            {!loading && Object.entries(groupedOptions.groups).map(([groupName, groupOptions]) => (
              <CommandGroup key={groupName} heading={groupName} className="bg-popover">
                {groupOptions.map((option, index) => renderOptionItem(option, index))}
              </CommandGroup>
            ))}
            
            {/* Render ungrouped options */}
            {!loading && groupedOptions.ungrouped.length > 0 && (
              <CommandGroup className="bg-popover">
                {groupedOptions.ungrouped.map((option, index) => renderOptionItem(option, index))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default DynamicAutocomplete;
