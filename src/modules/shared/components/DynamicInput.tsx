import React from 'react';
import { InputProps } from '@/types/component.types';
import { buildComponentStyles } from '@/utils/styleBuilder';
import { Input } from '@/components/ui/input';

export const DynamicInput: React.FC<InputProps> = ({
  type = 'text',
  placeholder,
  value,
  name,
  required,
  maxLength,
  minLength,
  pattern,
  autoComplete,
  onChange,
  ...baseProps
}) => {
  const { style, className } = buildComponentStyles(
    baseProps,
    'transition-base'
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onChange && !baseProps.disabled) {
      onChange(e.target.value);
    }
  };

  if (baseProps.hidden) return null;

  return (
    <Input
      type={type}
      placeholder={placeholder}
      value={value}
      name={name}
      required={required}
      maxLength={maxLength}
      minLength={minLength}
      pattern={pattern}
      autoComplete={autoComplete}
      onChange={handleChange}
      disabled={baseProps.disabled}
      className={className}
      style={style}
    />
  );
};
