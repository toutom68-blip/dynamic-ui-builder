import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

export type SkeletonVariant = 
  | 'text' 
  | 'title' 
  | 'avatar' 
  | 'thumbnail' 
  | 'card' 
  | 'listItem' 
  | 'tableRow' 
  | 'autocompleteItem'
  | 'mapMarker'
  | 'calendarEvent'
  | 'custom';

interface SkeletonLoaderProps {
  variant?: SkeletonVariant;
  count?: number;
  className?: string;
  animate?: boolean;
  // Custom dimensions
  width?: string | number;
  height?: string | number;
  // Card-specific props
  showAvatar?: boolean;
  showImage?: boolean;
  lines?: number;
}

const TextSkeleton: React.FC<{ className?: string }> = ({ className }) => (
  <Skeleton className={cn("h-4 w-full", className)} />
);

const TitleSkeleton: React.FC<{ className?: string }> = ({ className }) => (
  <Skeleton className={cn("h-6 w-3/4", className)} />
);

const AvatarSkeleton: React.FC<{ className?: string }> = ({ className }) => (
  <Skeleton className={cn("h-10 w-10 rounded-full", className)} />
);

const ThumbnailSkeleton: React.FC<{ className?: string }> = ({ className }) => (
  <Skeleton className={cn("h-24 w-24 rounded-md", className)} />
);

const CardSkeleton: React.FC<{ 
  showAvatar?: boolean; 
  showImage?: boolean; 
  lines?: number;
  className?: string;
}> = ({ showAvatar = false, showImage = true, lines = 3, className }) => (
  <div className={cn("space-y-3 p-4 border rounded-lg bg-card", className)}>
    {showImage && <Skeleton className="h-32 w-full rounded-md" />}
    <div className="space-y-2">
      {showAvatar && (
        <div className="flex items-center gap-3">
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-4 w-24" />
        </div>
      )}
      <Skeleton className="h-5 w-3/4" />
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} className={cn("h-4", i === lines - 1 ? "w-1/2" : "w-full")} />
      ))}
    </div>
  </div>
);

const ListItemSkeleton: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn("flex items-center gap-3 p-3", className)}>
    <Skeleton className="h-10 w-10 rounded-full flex-shrink-0" />
    <div className="flex-1 space-y-2">
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-3 w-1/2" />
    </div>
  </div>
);

const TableRowSkeleton: React.FC<{ columns?: number; className?: string }> = ({ 
  columns = 5, 
  className 
}) => (
  <div className={cn("flex items-center gap-4 p-4 border-b border-border", className)}>
    {Array.from({ length: columns }).map((_, i) => (
      <Skeleton 
        key={i} 
        className={cn(
          "h-4",
          i === 0 ? "w-8" : i === 1 ? "w-32" : "w-20"
        )} 
      />
    ))}
  </div>
);

const AutocompleteItemSkeleton: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn("flex items-center gap-2 p-2", className)}>
    <Skeleton className="h-4 w-4 rounded flex-shrink-0" />
    <div className="flex-1 space-y-1">
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-3 w-2/3" />
    </div>
  </div>
);

const MapMarkerSkeleton: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn("flex flex-col items-center gap-2", className)}>
    <Skeleton className="h-8 w-16 rounded-full" />
    <Skeleton className="h-2 w-2 rounded-full" />
  </div>
);

const CalendarEventSkeleton: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn("p-2 rounded-md space-y-1", className)}>
    <Skeleton className="h-3 w-16" />
    <Skeleton className="h-4 w-full" />
  </div>
);

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  variant = 'text',
  count = 1,
  className,
  animate = true,
  width,
  height,
  showAvatar,
  showImage,
  lines,
}) => {
  const items = Array.from({ length: count });

  const getAnimationClass = () => animate ? 'animate-pulse' : '';

  const renderSkeleton = (index: number) => {
    const key = `skeleton-${variant}-${index}`;

    switch (variant) {
      case 'text':
        return <TextSkeleton key={key} className={cn(getAnimationClass(), className)} />;
      case 'title':
        return <TitleSkeleton key={key} className={cn(getAnimationClass(), className)} />;
      case 'avatar':
        return <AvatarSkeleton key={key} className={cn(getAnimationClass(), className)} />;
      case 'thumbnail':
        return <ThumbnailSkeleton key={key} className={cn(getAnimationClass(), className)} />;
      case 'card':
        return (
          <CardSkeleton 
            key={key} 
            showAvatar={showAvatar} 
            showImage={showImage} 
            lines={lines}
            className={cn(getAnimationClass(), className)} 
          />
        );
      case 'listItem':
        return <ListItemSkeleton key={key} className={cn(getAnimationClass(), className)} />;
      case 'tableRow':
        return <TableRowSkeleton key={key} className={cn(getAnimationClass(), className)} />;
      case 'autocompleteItem':
        return <AutocompleteItemSkeleton key={key} className={cn(getAnimationClass(), className)} />;
      case 'mapMarker':
        return <MapMarkerSkeleton key={key} className={cn(getAnimationClass(), className)} />;
      case 'calendarEvent':
        return <CalendarEventSkeleton key={key} className={cn(getAnimationClass(), className)} />;
      case 'custom':
        return (
          <Skeleton 
            key={key}
            className={cn(getAnimationClass(), className)}
            style={{
              width: typeof width === 'number' ? `${width}px` : width,
              height: typeof height === 'number' ? `${height}px` : height,
            }}
          />
        );
      default:
        return <TextSkeleton key={key} className={cn(getAnimationClass(), className)} />;
    }
  };

  if (count === 1) {
    return renderSkeleton(0);
  }

  return (
    <div className="space-y-2">
      {items.map((_, index) => renderSkeleton(index))}
    </div>
  );
};

// Specialized skeleton components for specific use cases
export const AutocompleteListSkeleton: React.FC<{ count?: number; className?: string }> = ({ 
  count = 4, 
  className 
}) => (
  <div className={cn("p-1", className)}>
    {Array.from({ length: count }).map((_, i) => (
      <AutocompleteItemSkeleton key={i} />
    ))}
  </div>
);

export const GridTableSkeleton: React.FC<{ 
  rows?: number; 
  columns?: number; 
  className?: string;
}> = ({ rows = 5, columns = 5, className }) => (
  <div className={cn("space-y-0", className)}>
    {/* Header skeleton */}
    <div className="flex items-center gap-4 p-4 bg-muted/50 border-b border-border">
      {Array.from({ length: columns }).map((_, i) => (
        <Skeleton key={i} className="h-4 w-24" />
      ))}
    </div>
    {/* Row skeletons */}
    {Array.from({ length: rows }).map((_, i) => (
      <TableRowSkeleton key={i} columns={columns} />
    ))}
  </div>
);

export const CalendarGridSkeleton: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn("grid grid-cols-7 gap-1 p-4", className)}>
    {Array.from({ length: 35 }).map((_, i) => (
      <div key={i} className="min-h-[80px] p-1 border border-border/50 rounded">
        <Skeleton className="h-5 w-5 rounded-full mb-2" />
        {i % 3 === 0 && <CalendarEventSkeleton />}
        {i % 5 === 0 && <CalendarEventSkeleton />}
      </div>
    ))}
  </div>
);

export const MapSearchSkeleton: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn("space-y-4", className)}>
    {/* Search bar skeleton */}
    <div className="flex gap-2">
      <Skeleton className="h-10 flex-1 rounded-md" />
      <Skeleton className="h-10 w-20 rounded-md" />
      <Skeleton className="h-10 w-10 rounded-md" />
    </div>
    {/* Map skeleton */}
    <Skeleton className="h-[400px] w-full rounded-lg" />
  </div>
);

export const PropertyCardSkeleton: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn("w-72 p-0 rounded-xl overflow-hidden bg-card border", className)}>
    <Skeleton className="h-36 w-full" />
    <div className="p-3 space-y-2">
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-3 w-1/2" />
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-3 w-24" />
      </div>
      <Skeleton className="h-9 w-full rounded-lg" />
    </div>
  </div>
);

export const FilterBarSkeleton: React.FC<{ filters?: number; className?: string }> = ({ 
  filters = 4, 
  className 
}) => (
  <div className={cn("flex items-center gap-2 flex-wrap", className)}>
    <Skeleton className="h-8 w-24 rounded-md" />
    {Array.from({ length: filters }).map((_, i) => (
      <Skeleton key={i} className="h-8 w-32 rounded-full" />
    ))}
  </div>
);

export default SkeletonLoader;
