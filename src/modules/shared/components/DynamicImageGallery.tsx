import React, { useState } from 'react';
import { DynamicModal } from './DynamicModal';
import { BaseComponentProps } from '@/types/component.types';
import { buildComponentStyles } from '@/utils/styleBuilder';
import { ChevronLeft, ChevronRight, X, ZoomIn } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface GalleryImage {
  id: string | number;
  src: string;
  alt?: string;
  thumbnail?: string;
}

export interface DynamicImageGalleryProps extends BaseComponentProps {
  images: GalleryImage[];
  columns?: 2 | 3 | 4 | 5 | 6;
  gap?: 'sm' | 'md' | 'lg';
  aspectRatio?: 'square' | 'video' | 'portrait' | 'auto';
  onImageClick?: (image: GalleryImage, index: number) => void;
  showNavigation?: boolean;
  enableZoom?: boolean;
}

export const DynamicImageGallery: React.FC<DynamicImageGalleryProps> = ({
  images,
  columns = 3,
  gap = 'md',
  aspectRatio = 'square',
  onImageClick,
  showNavigation = true,
  enableZoom = true,
  ...baseProps
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const { style, className } = buildComponentStyles(baseProps);

  if (baseProps.hidden) return null;

  const columnClasses = {
    2: 'grid-cols-2',
    3: 'grid-cols-2 sm:grid-cols-3',
    4: 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4',
    5: 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5',
    6: 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6',
  };

  const gapClasses = {
    sm: 'gap-2',
    md: 'gap-4',
    lg: 'gap-6',
  };

  const aspectClasses = {
    square: 'aspect-square',
    video: 'aspect-video',
    portrait: 'aspect-[3/4]',
    auto: '',
  };

  const handleImageClick = (image: GalleryImage, index: number) => {
    onImageClick?.(image, index);
    if (enableZoom) {
      setSelectedIndex(index);
      setIsModalOpen(true);
    }
  };

  const handlePrevious = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') handlePrevious(e as unknown as React.MouseEvent);
    if (e.key === 'ArrowRight') handleNext(e as unknown as React.MouseEvent);
    if (e.key === 'Escape') setIsModalOpen(false);
  };

  const selectedImage = images[selectedIndex];

  return (
    <>
      <div
        className={`grid ${columnClasses[columns]} ${gapClasses[gap]} ${className}`}
        style={style}
      >
        {images.map((image, index) => (
          <div
            key={image.id}
            className={`relative overflow-hidden rounded-lg cursor-pointer group ${aspectClasses[aspectRatio]}`}
            onClick={() => handleImageClick(image, index)}
          >
            <img
              src={image.thumbnail || image.src}
              alt={image.alt || `Image ${index + 1}`}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300 flex items-center justify-center">
              <ZoomIn className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" size={24} />
            </div>
          </div>
        ))}
      </div>

      <DynamicModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        size="full"
      >
        <div
          className="relative flex items-center justify-center min-h-[60vh]"
          onKeyDown={handleKeyDown}
          tabIndex={0}
        >
          {selectedImage && (
            <img
              src={selectedImage.src}
              alt={selectedImage.alt || `Image ${selectedIndex + 1}`}
              className="max-w-full max-h-[80vh] object-contain rounded-lg"
            />
          )}

          {showNavigation && images.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background"
                onClick={handlePrevious}
              >
                <ChevronLeft size={24} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background"
                onClick={handleNext}
              >
                <ChevronRight size={24} />
              </Button>
            </>
          )}

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-sm text-muted-foreground bg-background/80 px-3 py-1 rounded-full">
            {selectedIndex + 1} / {images.length}
          </div>
        </div>
      </DynamicModal>
    </>
  );
};
