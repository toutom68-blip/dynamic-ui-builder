import React, { useState } from 'react';
import { DropdownProps } from '@/types/component.types';
import { buildComponentStyles } from '@/utils/styleBuilder';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';

export const DynamicDropdown: React.FC<DropdownProps> = ({
  options,
  value,
  multiSelect = false,
  placeholder = 'Select...',
  searchable = false,
  maxSelections,
  onChange,
  ...baseProps
}) => {
  const { style, className } = buildComponentStyles(
    baseProps,
    'transition-base'
  );

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedValues, setSelectedValues] = useState < (string | number)[] > (
    Array.isArray(value) ? value : value ? [value] : []
  );

  if (baseProps.hidden) return null;

  const filteredOptions = searchable
    ? options.filter((opt) =>
      opt.label.toLowerCase().includes(searchTerm.toLowerCase())
    )
    : options;

  const handleSingleSelect = (val: string) => {
    if (onChange && !baseProps.disabled) {
      onChange(val);
    }
  };

  const handleMultiSelect = (val: string | number) => {
    if (baseProps.disabled) return;

    let newValues: (string | number)[];
    if (selectedValues.includes(val)) {
      newValues = selectedValues.filter((v) => v !== val);
    } else {
      if (maxSelections && selectedValues.length >= maxSelections) {
        return;
      }
      newValues = [...selectedValues, val];
    }
    setSelectedValues(newValues);
    if (onChange) {
      onChange(newValues);
    }
  };

  const removeValue = (val: string | number) => {
    const newValues = selectedValues.filter((v) => v !== val);
    setSelectedValues(newValues);
    if (onChange) {
      onChange(newValues);
    }
  };

  if (multiSelect) {
    return (
      <div className={className} style={style}>
        <div className="space-y-2">
          {selectedValues.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {selectedValues.map((val) => {
                const option = options.find((o) => o.value === val);
                return (
                  <Badge key={val} variant="secondary" className="gap-1">
                    {option?.icon}
                    {option?.label}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => removeValue(val)}
                    />
                  </Badge>
                );
              })}
            </div>
          )}
          <div className="border rounded-md p-2 max-h-60 overflow-y-auto bg-popover">
            {filteredOptions.map((option) => (
              <div
                key={option.value}
                className="flex items-center gap-2 p-2 hover:bg-accent rounded cursor-pointer"
                onClick={() => handleMultiSelect(option.value)}
              >
                <Checkbox
                  checked={selectedValues.includes(option.value)}
                  disabled={option.disabled || baseProps.disabled}
                />
                {option.icon}
                <span>{option.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <Select
      value={value as string}
      onValueChange={handleSingleSelect}
      disabled={baseProps.disabled}
    >
      <SelectTrigger className={className} style={style}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className="bg-popover z-50">
        {filteredOptions.map((option) => (
          <SelectItem
            key={option.value}
            value={option.value.toString()}
            disabled={option.disabled}
          >
            <div className="flex items-center gap-2">
              {option.icon}
              {option.label}
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
