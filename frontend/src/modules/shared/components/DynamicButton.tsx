import React from 'react';
import { ButtonProps } from '@/types/component.types';
import { buildComponentStyles } from '@/utils/styleBuilder';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

export const DynamicButton: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'left',
  loading,
  type = 'button',
  content,
  children,
  onClick,
  ...baseProps
}) => {
  const { style, className } = buildComponentStyles(
    baseProps,
    'transition-base'
  );

  const handleClick = () => {
    if (onClick && !baseProps.disabled && !loading) {
      onClick();
    }
  };

  if (baseProps.hidden) return null;

  const variantMap = {
    primary: 'default',
    secondary: 'secondary',
    destructive: 'destructive',
    outline: 'outline',
    ghost: 'ghost',
  };

  const sizeMap = {
    sm: 'sm',
    md: 'default',
    lg: 'lg',
  };

  const buttonContent = content || children;

  return (
    <Button
      type={type}
      variant={variantMap[variant] as any}
      size={sizeMap[size] as any}
      onClick={handleClick}
      disabled={baseProps.disabled || loading}
      className={className}
      style={style}
    >
      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {!loading && icon && iconPosition === 'left' && (
        <span className="mr-2">{icon}</span>
      )}
      {buttonContent}
      {!loading && icon && iconPosition === 'right' && (
        <span className="ml-2">{icon}</span>
      )}
    </Button>
  );
};
