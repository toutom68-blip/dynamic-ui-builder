import {
  format,
  parse,
  parseISO,
  isValid,
  formatDistance,
  formatRelative,
  differenceInDays,
  differenceInHours,
  differenceInMinutes,
  differenceInSeconds,
  addDays,
  addHours,
  addMinutes,
  addSeconds,
  subDays,
  subHours,
  subMinutes,
  subSeconds,
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  isAfter,
  isBefore,
  isSameDay,
  isSameMonth,
  isSameYear,
  Locale,
} from 'date-fns';
import { ar, enUS, fr } from 'date-fns/locale';

// Locale mapping
const localeMap: Record<string, Locale> = {
  en: enUS,
  ar: ar,
  fr: fr,
};

// Common date formats
export const DATE_FORMATS = {
  // Date only
  ISO_DATE: 'yyyy-MM-dd',
  SHORT_DATE: 'MM/dd/yyyy',
  MEDIUM_DATE: 'MMM d, yyyy',
  LONG_DATE: 'MMMM d, yyyy',
  FULL_DATE: 'EEEE, MMMM d, yyyy',
  
  // Time only
  TIME_12H: 'h:mm a',
  TIME_24H: 'HH:mm',
  TIME_WITH_SECONDS_12H: 'h:mm:ss a',
  TIME_WITH_SECONDS_24H: 'HH:mm:ss',
  
  // Date and time
  ISO_DATETIME: "yyyy-MM-dd'T'HH:mm:ss",
  SHORT_DATETIME: 'MM/dd/yyyy h:mm a',
  MEDIUM_DATETIME: 'MMM d, yyyy h:mm a',
  LONG_DATETIME: 'MMMM d, yyyy h:mm a',
  FULL_DATETIME: 'EEEE, MMMM d, yyyy h:mm a',
  
  // Relative formats
  DAY_MONTH: 'd MMM',
  MONTH_YEAR: 'MMMM yyyy',
  DAY_NAME: 'EEEE',
  DAY_SHORT: 'EEE',
} as const;

export type DateFormatKey = keyof typeof DATE_FORMATS;

interface DateTimeServiceOptions {
  locale?: string;
  defaultFormat?: string;
}

/**
 * Shared Date/Time Service
 * Provides fully dynamic and parameterizable date/time transformations
 */
class DateTimeService {
  private locale: Locale;
  private defaultFormat: string;

  constructor(options: DateTimeServiceOptions = {}) {
    this.locale = localeMap[options.locale || 'en'] || enUS;
    this.defaultFormat = options.defaultFormat || DATE_FORMATS.MEDIUM_DATE;
  }

  /**
   * Set the locale for date formatting
   */
  setLocale(locale: string): void {
    this.locale = localeMap[locale] || enUS;
  }

  /**
   * Get the current locale
   */
  getLocale(): Locale {
    return this.locale;
  }

  // ==================== Date to String ====================

  /**
   * Format a date to string with custom format
   * @param date - Date object, timestamp, or ISO string
   * @param formatStr - Format string (use DATE_FORMATS constants or custom)
   * @param locale - Optional locale override
   */
  formatDate(
    date: Date | number | string,
    formatStr: string = this.defaultFormat,
    locale?: string
  ): string {
    const dateObj = this.toDate(date);
    if (!isValid(dateObj)) return '';
    
    const loc = locale ? (localeMap[locale] || this.locale) : this.locale;
    return format(dateObj, formatStr, { locale: loc });
  }

  /**
   * Format using predefined format key
   */
  formatWithKey(
    date: Date | number | string,
    formatKey: DateFormatKey,
    locale?: string
  ): string {
    return this.formatDate(date, DATE_FORMATS[formatKey], locale);
  }

  /**
   * Format to ISO 8601 string
   */
  toISOString(date: Date | number | string): string {
    const dateObj = this.toDate(date);
    return isValid(dateObj) ? dateObj.toISOString() : '';
  }

  /**
   * Format relative time (e.g., "2 hours ago", "in 3 days")
   */
  formatRelativeTime(
    date: Date | number | string,
    baseDate: Date = new Date(),
    locale?: string
  ): string {
    const dateObj = this.toDate(date);
    if (!isValid(dateObj)) return '';
    
    const loc = locale ? (localeMap[locale] || this.locale) : this.locale;
    return formatDistance(dateObj, baseDate, { addSuffix: true, locale: loc });
  }

  /**
   * Format relative to now with day context (e.g., "yesterday at 5:00 PM")
   */
  formatRelativeWithContext(
    date: Date | number | string,
    baseDate: Date = new Date(),
    locale?: string
  ): string {
    const dateObj = this.toDate(date);
    if (!isValid(dateObj)) return '';
    
    const loc = locale ? (localeMap[locale] || this.locale) : this.locale;
    return formatRelative(dateObj, baseDate, { locale: loc });
  }

  /**
   * Format time range (e.g., "9:00 AM - 5:00 PM")
   */
  formatTimeRange(
    startDate: Date | number | string,
    endDate: Date | number | string,
    timeFormat: string = DATE_FORMATS.TIME_12H
  ): string {
    const start = this.formatDate(startDate, timeFormat);
    const end = this.formatDate(endDate, timeFormat);
    return `${start} - ${end}`;
  }

  /**
   * Format date range (e.g., "Jan 1 - Jan 5, 2024")
   */
  formatDateRange(
    startDate: Date | number | string,
    endDate: Date | number | string,
    dateFormat: string = DATE_FORMATS.DAY_MONTH
  ): string {
    const startObj = this.toDate(startDate);
    const endObj = this.toDate(endDate);
    
    if (isSameDay(startObj, endObj)) {
      return this.formatDate(startObj, DATE_FORMATS.MEDIUM_DATE);
    }
    
    if (isSameMonth(startObj, endObj)) {
      return `${format(startObj, 'd', { locale: this.locale })} - ${format(endObj, 'd', { locale: this.locale })} ${format(startObj, 'MMM yyyy', { locale: this.locale })}`;
    }
    
    if (isSameYear(startObj, endObj)) {
      return `${format(startObj, dateFormat, { locale: this.locale })} - ${format(endObj, dateFormat, { locale: this.locale })}, ${format(startObj, 'yyyy', { locale: this.locale })}`;
    }
    
    return `${this.formatDate(startObj, DATE_FORMATS.MEDIUM_DATE)} - ${this.formatDate(endObj, DATE_FORMATS.MEDIUM_DATE)}`;
  }

  // ==================== String to Date ====================

  /**
   * Parse string to Date with custom format
   * @param dateString - String representation of date
   * @param formatStr - Format string matching the input
   * @param referenceDate - Reference date for parsing (defaults to now)
   */
  parseDate(
    dateString: string,
    formatStr: string = this.defaultFormat,
    referenceDate: Date = new Date()
  ): Date | null {
    try {
      const parsed = parse(dateString, formatStr, referenceDate, { locale: this.locale });
      return isValid(parsed) ? parsed : null;
    } catch {
      return null;
    }
  }

  /**
   * Parse ISO 8601 string to Date
   */
  parseISO(dateString: string): Date | null {
    try {
      const parsed = parseISO(dateString);
      return isValid(parsed) ? parsed : null;
    } catch {
      return null;
    }
  }

  /**
   * Parse using predefined format key
   */
  parseWithKey(
    dateString: string,
    formatKey: DateFormatKey,
    referenceDate: Date = new Date()
  ): Date | null {
    return this.parseDate(dateString, DATE_FORMATS[formatKey], referenceDate);
  }

  /**
   * Auto-detect and parse common date formats
   */
  parseAuto(dateString: string): Date | null {
    // Try ISO format first
    const isoResult = this.parseISO(dateString);
    if (isoResult) return isoResult;

    // Try common formats
    const commonFormats = [
      DATE_FORMATS.ISO_DATE,
      DATE_FORMATS.SHORT_DATE,
      DATE_FORMATS.MEDIUM_DATE,
      DATE_FORMATS.LONG_DATE,
      DATE_FORMATS.ISO_DATETIME,
      DATE_FORMATS.SHORT_DATETIME,
      'dd/MM/yyyy',
      'dd-MM-yyyy',
      'yyyy/MM/dd',
    ];

    for (const fmt of commonFormats) {
      const result = this.parseDate(dateString, fmt);
      if (result) return result;
    }

    // Try native Date parsing as fallback
    const nativeDate = new Date(dateString);
    return isValid(nativeDate) ? nativeDate : null;
  }

  // ==================== Utility Methods ====================

  /**
   * Convert various date inputs to Date object
   */
  toDate(date: Date | number | string): Date {
    if (date instanceof Date) return date;
    if (typeof date === 'number') return new Date(date);
    if (typeof date === 'string') {
      const parsed = this.parseISO(date);
      return parsed || new Date(date);
    }
    return new Date();
  }

  /**
   * Check if a date is valid
   */
  isValidDate(date: Date | number | string): boolean {
    return isValid(this.toDate(date));
  }

  /**
   * Get differences between dates
   */
  getDifference(
    date1: Date | number | string,
    date2: Date | number | string,
    unit: 'days' | 'hours' | 'minutes' | 'seconds' = 'days'
  ): number {
    const d1 = this.toDate(date1);
    const d2 = this.toDate(date2);

    switch (unit) {
      case 'days':
        return differenceInDays(d1, d2);
      case 'hours':
        return differenceInHours(d1, d2);
      case 'minutes':
        return differenceInMinutes(d1, d2);
      case 'seconds':
        return differenceInSeconds(d1, d2);
      default:
        return differenceInDays(d1, d2);
    }
  }

  /**
   * Add time to a date
   */
  addTime(
    date: Date | number | string,
    amount: number,
    unit: 'days' | 'hours' | 'minutes' | 'seconds'
  ): Date {
    const d = this.toDate(date);

    switch (unit) {
      case 'days':
        return addDays(d, amount);
      case 'hours':
        return addHours(d, amount);
      case 'minutes':
        return addMinutes(d, amount);
      case 'seconds':
        return addSeconds(d, amount);
      default:
        return d;
    }
  }

  /**
   * Subtract time from a date
   */
  subtractTime(
    date: Date | number | string,
    amount: number,
    unit: 'days' | 'hours' | 'minutes' | 'seconds'
  ): Date {
    const d = this.toDate(date);

    switch (unit) {
      case 'days':
        return subDays(d, amount);
      case 'hours':
        return subHours(d, amount);
      case 'minutes':
        return subMinutes(d, amount);
      case 'seconds':
        return subSeconds(d, amount);
      default:
        return d;
    }
  }

  /**
   * Get start/end of period
   */
  getStartOf(
    date: Date | number | string,
    period: 'day' | 'week' | 'month' | 'year'
  ): Date {
    const d = this.toDate(date);

    switch (period) {
      case 'day':
        return startOfDay(d);
      case 'week':
        return startOfWeek(d, { locale: this.locale });
      case 'month':
        return startOfMonth(d);
      case 'year':
        return startOfYear(d);
      default:
        return d;
    }
  }

  getEndOf(
    date: Date | number | string,
    period: 'day' | 'week' | 'month' | 'year'
  ): Date {
    const d = this.toDate(date);

    switch (period) {
      case 'day':
        return endOfDay(d);
      case 'week':
        return endOfWeek(d, { locale: this.locale });
      case 'month':
        return endOfMonth(d);
      case 'year':
        return endOfYear(d);
      default:
        return d;
    }
  }

  /**
   * Comparison methods
   */
  isAfterDate(date1: Date | number | string, date2: Date | number | string): boolean {
    return isAfter(this.toDate(date1), this.toDate(date2));
  }

  isBeforeDate(date1: Date | number | string, date2: Date | number | string): boolean {
    return isBefore(this.toDate(date1), this.toDate(date2));
  }

  isSameDayAs(date1: Date | number | string, date2: Date | number | string): boolean {
    return isSameDay(this.toDate(date1), this.toDate(date2));
  }

  /**
   * Get current timestamp
   */
  now(): Date {
    return new Date();
  }

  /**
   * Get timestamp in milliseconds
   */
  timestamp(date?: Date | number | string): number {
    return date ? this.toDate(date).getTime() : Date.now();
  }
}

// Export singleton instance
export const dateTimeService = new DateTimeService();

// Export class for custom instances
export { DateTimeService };
