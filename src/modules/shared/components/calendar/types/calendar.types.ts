export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  price?: number;
  currency?: string;
  location?: string;
  category?: string;
  color?: string;
  imageUrl?: string;
  capacity?: number;
  bookedCount?: number;
  organizer?: string;
  tags?: string[];
  isRecurring?: boolean;
  recurrenceRule?: string;
  metadata?: Record<string, any>;
}

export interface CalendarBooking {
  id: string;
  eventId: string;
  userId: string;
  userName?: string;
  userEmail?: string;
  bookingDate: Date;
  status: 'pending' | 'confirmed' | 'cancelled';
  quantity: number;
  totalPrice: number;
  notes?: string;
  reminder?: CalendarReminder;
}

export interface CalendarReminder {
  id: string;
  eventId: string;
  bookingId?: string;
  type: 'email' | 'push' | 'sms';
  scheduledFor: Date;
  sent: boolean;
  message?: string;
}

export interface CalendarViewConfig {
  view: 'month' | 'week' | 'day' | 'agenda';
  showWeekends?: boolean;
  firstDayOfWeek?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  minTime?: string;
  maxTime?: string;
  slotDuration?: number;
}

export interface CalendarFilterConfig {
  categories?: string[];
  priceRange?: { min: number; max: number };
  dateRange?: { start: Date; end: Date };
  searchQuery?: string;
  tags?: string[];
}

export interface CalendarLazyLoadConfig {
  enabled: boolean;
  pageSize: number;
  loadEvents: (start: Date, end: Date, page: number) => Promise<{
    events: CalendarEvent[];
    hasMore: boolean;
    totalCount: number;
  }>;
}

export interface DragState {
  isDragging: boolean;
  dragType: 'create' | 'move' | 'resize-start' | 'resize-end' | null;
  startDate: Date | null;
  endDate: Date | null;
  eventId: string | null;
  originalEvent: CalendarEvent | null;
}

export interface CalendarProps {
  events?: CalendarEvent[];
  initialView?: CalendarViewConfig['view'];
  onEventClick?: (event: CalendarEvent) => void;
  onDateClick?: (date: Date) => void;
  onBookEvent?: (event: CalendarEvent, quantity: number) => Promise<CalendarBooking>;
  onCancelBooking?: (booking: CalendarBooking) => Promise<void>;
  onSetReminder?: (event: CalendarEvent, reminder: Omit<CalendarReminder, 'id' | 'sent'>) => Promise<CalendarReminder>;
  onShare?: (event: CalendarEvent, platform: 'copy' | 'email' | 'twitter' | 'facebook' | 'whatsapp') => void;
  onEventCreate?: (event: Omit<CalendarEvent, 'id'>) => Promise<CalendarEvent>;
  onEventUpdate?: (event: CalendarEvent) => Promise<CalendarEvent>;
  onEventDelete?: (eventId: string) => Promise<void>;
  lazyLoading?: CalendarLazyLoadConfig;
  filters?: CalendarFilterConfig;
  onFilterChange?: (filters: CalendarFilterConfig) => void;
  showFilters?: boolean;
  showBookingPanel?: boolean;
  editable?: boolean;
  locale?: string;
  timezone?: string;
  className?: string;
  slotDuration?: number; // in minutes, default 30
  defaultEventDuration?: number; // in minutes, default 60
  defaultEventColor?: string;
}
