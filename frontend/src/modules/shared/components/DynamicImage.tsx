import React from 'react';
import { ImageProps } from '@/types/component.types';
import { buildComponentStyles } from '@/utils/styleBuilder';

export const DynamicImage: React.FC<ImageProps> = ({
  src,
  alt,
  objectFit = 'cover',
  editable = false,
  onEdit,
  aspectRatio,
  ...baseProps
}) => {
  const { style, className } = buildComponentStyles(
    baseProps,
    'transition-base'
  );

  if (baseProps.hidden) return null;

  const imageStyle = {
    ...style,
    objectFit,
    ...(aspectRatio && { aspectRatio }),
  };

  // Simple implementation - in production you'd integrate a full image editor
  const handleEdit = () => {
    if (editable && onEdit && !baseProps.disabled) {
      // Placeholder for image editing functionality
      console.log('Image edit triggered');
    }
  };

  return (
    <div className={`relative inline-block ${className}`}>
      <img
        src={src}
        alt={alt}
        style={imageStyle}
        className="max-w-full h-auto"
        onClick={editable ? handleEdit : undefined}
      />
      {editable && !baseProps.disabled && (
        <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-base bg-black/50 flex items-center justify-center cursor-pointer">
          <span className="text-white text-sm">Click to edit</span>
        </div>
      )}
    </div>
  );
};
