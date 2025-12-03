import React from 'react';
import { CalendarFilterConfig } from '@/types/calendar.types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { 
  Search, 
  Filter, 
  X, 
  Calendar as CalendarIcon,
  DollarSign,
  Tag
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface CalendarFiltersProps {
  filters: CalendarFilterConfig;
  onFilterChange: (filters: CalendarFilterConfig) => void;
  categories?: string[];
  tags?: string[];
  maxPrice?: number;
}

export const CalendarFilters: React.FC<CalendarFiltersProps> = ({
  filters,
  onFilterChange,
  categories = [],
  tags = [],
  maxPrice = 1000,
}) => {
  const activeFiltersCount = [
    filters.searchQuery,
    filters.categories?.length,
    filters.priceRange,
    filters.dateRange,
    filters.tags?.length,
  ].filter(Boolean).length;

  const handleSearchChange = (value: string) => {
    onFilterChange({ ...filters, searchQuery: value || undefined });
  };

  const handleCategoryChange = (category: string) => {
    const currentCategories = filters.categories || [];
    const newCategories = currentCategories.includes(category)
      ? currentCategories.filter(c => c !== category)
      : [...currentCategories, category];
    onFilterChange({ 
      ...filters, 
      categories: newCategories.length > 0 ? newCategories : undefined 
    });
  };

  const handlePriceChange = (values: number[]) => {
    onFilterChange({
      ...filters,
      priceRange: { min: values[0], max: values[1] },
    });
  };

  const handleDateRangeChange = (range: { start?: Date; end?: Date }) => {
    if (range.start || range.end) {
      onFilterChange({
        ...filters,
        dateRange: {
          start: range.start || new Date(),
          end: range.end || new Date(),
        },
      });
    } else {
      onFilterChange({ ...filters, dateRange: undefined });
    }
  };

  const handleTagToggle = (tag: string) => {
    const currentTags = filters.tags || [];
    const newTags = currentTags.includes(tag)
      ? currentTags.filter(t => t !== tag)
      : [...currentTags, tag];
    onFilterChange({ 
      ...filters, 
      tags: newTags.length > 0 ? newTags : undefined 
    });
  };

  const clearFilters = () => {
    onFilterChange({});
  };

  return (
    <div className="space-y-4">
      {/* Search and Quick Filters Row */}
      <div className="flex flex-wrap gap-2">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search events..."
            value={filters.searchQuery || ''}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Category Filter */}
        {categories.length > 0 && (
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Filter className="h-4 w-4" />
                Category
                {filters.categories?.length ? (
                  <Badge variant="secondary" className="ml-1">
                    {filters.categories.length}
                  </Badge>
                ) : null}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-56 p-3">
              <div className="space-y-2">
                {categories.map((category) => (
                  <label
                    key={category}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={filters.categories?.includes(category) || false}
                      onChange={() => handleCategoryChange(category)}
                      className="rounded border-border"
                    />
                    <span className="text-sm">{category}</span>
                  </label>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        )}

        {/* Price Range Filter */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="gap-2">
              <DollarSign className="h-4 w-4" />
              Price
              {filters.priceRange && (
                <Badge variant="secondary" className="ml-1">
                  ${filters.priceRange.min}-${filters.priceRange.max}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-72 p-4">
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span>${filters.priceRange?.min || 0}</span>
                <span>${filters.priceRange?.max || maxPrice}</span>
              </div>
              <Slider
                min={0}
                max={maxPrice}
                step={10}
                value={[
                  filters.priceRange?.min || 0,
                  filters.priceRange?.max || maxPrice,
                ]}
                onValueChange={handlePriceChange}
              />
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => onFilterChange({ ...filters, priceRange: undefined })}
                >
                  Clear
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {/* Date Range Filter */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="gap-2">
              <CalendarIcon className="h-4 w-4" />
              Date
              {filters.dateRange && (
                <Badge variant="secondary" className="ml-1">
                  {format(filters.dateRange.start, 'MMM d')} - {format(filters.dateRange.end, 'MMM d')}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="range"
              selected={{
                from: filters.dateRange?.start,
                to: filters.dateRange?.end,
              }}
              onSelect={(range) => handleDateRangeChange({
                start: range?.from,
                end: range?.to,
              })}
              numberOfMonths={2}
              className={cn("p-3 pointer-events-auto")}
            />
          </PopoverContent>
        </Popover>

        {/* Clear All */}
        {activeFiltersCount > 0 && (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1">
            <X className="h-4 w-4" />
            Clear ({activeFiltersCount})
          </Button>
        )}
      </div>

      {/* Tags Row */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <Tag className="h-4 w-4 text-muted-foreground" />
          {tags.map((tag) => (
            <Badge
              key={tag}
              variant={filters.tags?.includes(tag) ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() => handleTagToggle(tag)}
            >
              {tag}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
};
