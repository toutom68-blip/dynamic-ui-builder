import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { buildComponentStyles } from '@/utils/styleBuilder';
import { Input } from '@/components/ui/input';
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Check, Loader2, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AutocompleteProps, AutocompleteOption } from '@/types/component.types';

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
  
  // Callbacks
  onChange,
  onSelect,
  onClear,
  onApiError,
  
  // Styling
  ...baseProps
}) => {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [selectedOption, setSelectedOption] = useState<AutocompleteOption | null>(null);
  const [filteredOptions, setFilteredOptions] = useState<AutocompleteOption[]>([]);
  const [apiOptions, setApiOptions] = useState<AutocompleteOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  
  const { style, className } = buildComponentStyles(baseProps, 'transition-base');

  // Normalize options to standard format
  const normalizeOption = useCallback((item: any): AutocompleteOption => {
    if (typeof item === 'string') {
      return { label: item, value: item };
    }
    
    const label = displayProperty ? getNestedValue(item, displayProperty) : item.label || String(item);
    const value = valueProperty ? getNestedValue(item, valueProperty) : item.value || item;
    const icon = iconProperty ? getNestedValue(item, iconProperty) : item.icon;
    
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
      value,
      icon,
      disabled: isDisabled,
      hidden: isHidden,
      originalData: item
    };
  }, [displayProperty, valueProperty, iconProperty, disabledProperties, hiddenProperties]);

  // Get nested value from object using dot notation
  const getNestedValue = (obj: any, path: string): any => {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  };

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
  }, [options, apiOptions, apiEndpoint, searchProperties, minSearchLength, maxResults, normalizeOption]);

  // Fetch from API
  const fetchFromApi = useCallback(async (searchTerm: string) => {
    if (!apiEndpoint || searchTerm.length < minSearchLength) {
      setApiOptions([]);
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
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
      
      const response = await fetch(url, fetchOptions);
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      let data = await response.json();
      
      // Extract data from nested path if specified
      if (apiResponsePath) {
        data = getNestedValue(data, apiResponsePath);
      }
      
      if (Array.isArray(data)) {
        setApiOptions(data);
      } else {
        setApiOptions([]);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'API fetch failed';
      setError(errorMessage);
      onApiError?.(err instanceof Error ? err : new Error(errorMessage));
      setApiOptions([]);
    } finally {
      setLoading(false);
    }
  }, [apiEndpoint, apiMethod, apiHeaders, apiQueryParam, apiResponsePath, minSearchLength, onApiError]);

  // Debounced API search
  const debouncedApiSearch = useCallback((searchTerm: string) => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    
    debounceRef.current = setTimeout(() => {
      fetchFromApi(searchTerm);
    }, apiDebounceMs);
  }, [fetchFromApi, apiDebounceMs]);

  // Update filtered options when input or source changes
  useEffect(() => {
    const filtered = filterLocalOptions(inputValue);
    setFilteredOptions(filtered);
  }, [inputValue, filterLocalOptions]);

  // Initialize selected option from value prop
  useEffect(() => {
    if (value !== undefined && value !== null) {
      const sourceOptions = apiEndpoint ? apiOptions : options;
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
  }, [value, options, apiOptions, apiEndpoint, normalizeOption]);

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    setOpen(true);
    
    if (apiEndpoint) {
      debouncedApiSearch(newValue);
    }
    
    // For freeSolo mode, also call onChange with input value
    if (freeSolo && onChange) {
      onChange(newValue);
    }
  };

  // Handle option select
  const handleSelect = (option: AutocompleteOption) => {
    if (option.disabled) return;
    
    setSelectedOption(option);
    setInputValue(option.label);
    setOpen(false);
    
    // Call onChange with value
    onChange?.(option.value);
    
    // Call onSelect with full option data
    onSelect?.(option);
  };

  // Handle clear
  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setInputValue('');
    setSelectedOption(null);
    setFilteredOptions([]);
    onChange?.(undefined);
    onClear?.();
    inputRef.current?.focus();
  };

  // Get output object
  const getOutputObject = useMemo(() => ({
    value: selectedOption?.value ?? (freeSolo ? inputValue : undefined),
    label: selectedOption?.label ?? inputValue,
    selectedOption,
    inputValue,
    originalData: selectedOption?.originalData
  }), [selectedOption, inputValue, freeSolo]);

  if (baseProps.hidden) return null;

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
        className="w-[var(--radix-popover-trigger-width)] p-0" 
        align="start"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <Command shouldFilter={false}>
          <CommandList>
            {error && (
              <div className="px-3 py-2 text-sm text-destructive">
                {error}
              </div>
            )}
            
            {!loading && filteredOptions.length === 0 && inputValue.length >= minSearchLength && (
              <CommandEmpty>No results found.</CommandEmpty>
            )}
            
            {inputValue.length < minSearchLength && !loading && (
              <div className="px-3 py-2 text-sm text-muted-foreground">
                Type at least {minSearchLength} character{minSearchLength > 1 ? 's' : ''} to search...
              </div>
            )}
            
            <CommandGroup>
              {filteredOptions.map((option, index) => (
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
                    
                    {selectedOption?.value === option.value && (
                      <Check className="h-4 w-4 flex-shrink-0 text-primary" />
                    )}
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default DynamicAutocomplete;
