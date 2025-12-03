import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { BaseComponentProps } from '@/types/component.types';
import { buildComponentStyles } from '@/utils/styleBuilder';
import { DateRange } from 'react-day-picker';

export interface DatePickerProps extends BaseComponentProps {
  mode?: 'single' | 'range';
  value?: Date | DateRange;
  onDateChange?: (date: Date | DateRange | undefined) => void;
  placeholder?: string;
  minDate?: Date;
  maxDate?: Date;
  disabled?: boolean;
  dateFormat?: string;
}

export const DynamicDatePicker: React.FC<DatePickerProps> = ({
  mode = 'single',
  value,
  onDateChange,
  placeholder,
  minDate,
  maxDate,
  disabled = false,
  dateFormat = 'PPP',
  ...baseProps
}) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const { className } = buildComponentStyles(baseProps);

  if (baseProps.hidden) return null;

  const handleSingleSelect = (date: Date | undefined) => {
    onDateChange?.(date);
    if (date) setOpen(false);
  };

  const handleRangeSelect = (range: DateRange | undefined) => {
    onDateChange?.(range);
    if (range?.from && range?.to) setOpen(false);
  };

  const getDisplayText = () => {
    if (mode === 'single') {
      const date = value as Date | undefined;
      return date ? format(date, dateFormat) : (placeholder || t('datePicker.selectDate'));
    } else {
      const range = value as DateRange | undefined;
      if (range?.from) {
        if (range.to) {
          return `${format(range.from, dateFormat)} - ${format(range.to, dateFormat)}`;
        }
        return format(range.from, dateFormat);
      }
      return placeholder || t('datePicker.selectRange');
    }
  };

  const isDateDisabled = (date: Date) => {
    if (minDate && date < minDate) return true;
    if (maxDate && date > maxDate) return true;
    return false;
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          className={cn(
            'w-full justify-start text-left font-normal',
            !value && 'text-muted-foreground',
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {getDisplayText()}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        {mode === 'single' ? (
          <Calendar
            mode="single"
            selected={value as Date | undefined}
            onSelect={handleSingleSelect}
            disabled={isDateDisabled}
            initialFocus
            className={cn('p-3 pointer-events-auto')}
          />
        ) : (
          <Calendar
            mode="range"
            selected={value as DateRange | undefined}
            onSelect={handleRangeSelect}
            disabled={isDateDisabled}
            numberOfMonths={2}
            initialFocus
            className={cn('p-3 pointer-events-auto')}
          />
        )}
      </PopoverContent>
    </Popover>
  );
};
