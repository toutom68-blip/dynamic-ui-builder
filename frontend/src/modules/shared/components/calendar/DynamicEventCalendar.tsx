import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  CalendarProps,
  CalendarEvent,
  CalendarBooking,
  CalendarReminder,
  CalendarViewConfig,
  CalendarFilterConfig,
} from '@/types/calendar.types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  List,
  Grid3X3,
  Clock,
  Loader2,
  CalendarDays,
  CalendarRange,
} from 'lucide-react';
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  startOfDay,
  endOfDay,
  eachDayOfInterval,
  eachHourOfInterval,
  isSameMonth,
  isSameDay,
  isSameHour,
  addMonths,
  subMonths,
  addWeeks,
  subWeeks,
  addDays,
  subDays,
  isToday,
  isWithinInterval,
  getHours,
  setHours,
  setMinutes,
} from 'date-fns';
import { EventTooltip } from './EventTooltip';
import { BookingModal } from './BookingModal';
import { ShareModal } from './ShareModal';
import { ReminderModal } from './ReminderModal';
import { CalendarFilters } from './CalendarFilters';
import { cn } from '@/lib/utils';

export const DynamicEventCalendar: React.FC<CalendarProps> = ({
  events: initialEvents = [],
  initialView = 'month',
  onEventClick,
  onDateClick,
  onBookEvent,
  onCancelBooking,
  onSetReminder,
  onShare,
  lazyLoading,
  filters: externalFilters,
  onFilterChange,
  showFilters = true,
  showBookingPanel = true,
  editable = false,
  locale = 'en-US',
  timezone,
  className,
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<CalendarViewConfig['view']>(initialView);
  const [events, setEvents] = useState<CalendarEvent[]>(initialEvents);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<CalendarFilterConfig>(externalFilters || {});
  
  // Modal states
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [reminderModalOpen, setReminderModalOpen] = useState(false);

  // Extract unique categories and tags for filters
  const categories = useMemo(() => 
    [...new Set(events.map(e => e.category).filter(Boolean))] as string[],
    [events]
  );
  
  const tags = useMemo(() => 
    [...new Set(events.flatMap(e => e.tags || []))],
    [events]
  );

  // Update events when initialEvents changes
  useEffect(() => {
    if (!lazyLoading?.enabled) {
      setEvents(initialEvents);
    }
  }, [initialEvents, lazyLoading?.enabled]);

  // Lazy loading effect
  useEffect(() => {
    if (lazyLoading?.enabled) {
      loadEvents();
    }
  }, [currentDate, view, lazyLoading?.enabled]);

  const loadEvents = async () => {
    if (!lazyLoading?.enabled || isLoading) return;
    
    setIsLoading(true);
    try {
      const { start, end } = getViewDateRange();
      const result = await lazyLoading.loadEvents(start, end, page);
      
      if (page === 1) {
        setEvents(result.events);
      } else {
        setEvents(prev => [...prev, ...result.events]);
      }
      setHasMore(result.hasMore);
    } catch (error) {
      console.error('Failed to load events:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMore = async () => {
    if (!hasMore || isLoading) return;
    setPage(prev => prev + 1);
    await loadEvents();
  };

  const getViewDateRange = () => {
    switch (view) {
      case 'month':
        return {
          start: startOfWeek(startOfMonth(currentDate)),
          end: endOfWeek(endOfMonth(currentDate)),
        };
      case 'week':
        return {
          start: startOfWeek(currentDate),
          end: endOfWeek(currentDate),
        };
      case 'day':
        return {
          start: currentDate,
          end: currentDate,
        };
      default:
        return {
          start: startOfMonth(currentDate),
          end: endOfMonth(currentDate),
        };
    }
  };

  // Filter events
  const filteredEvents = useMemo(() => {
    return events.filter(event => {
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        if (!event.title.toLowerCase().includes(query) &&
            !event.description?.toLowerCase().includes(query)) {
          return false;
        }
      }
      
      if (filters.categories?.length) {
        if (!event.category || !filters.categories.includes(event.category)) {
          return false;
        }
      }
      
      if (filters.priceRange) {
        const price = event.price || 0;
        if (price < filters.priceRange.min || price > filters.priceRange.max) {
          return false;
        }
      }
      
      if (filters.dateRange) {
        const eventDate = new Date(event.startDate);
        if (eventDate < filters.dateRange.start || eventDate > filters.dateRange.end) {
          return false;
        }
      }
      
      if (filters.tags?.length) {
        if (!event.tags?.some(tag => filters.tags?.includes(tag))) {
          return false;
        }
      }
      
      return true;
    });
  }, [events, filters]);

  // Navigation handlers
  const navigate = (direction: 'prev' | 'next') => {
    setPage(1);
    switch (view) {
      case 'month':
        setCurrentDate(direction === 'prev' ? subMonths(currentDate, 1) : addMonths(currentDate, 1));
        break;
      case 'week':
        setCurrentDate(direction === 'prev' ? subWeeks(currentDate, 1) : addWeeks(currentDate, 1));
        break;
      case 'day':
        setCurrentDate(direction === 'prev' ? subDays(currentDate, 1) : addDays(currentDate, 1));
        break;
    }
  };

  const goToToday = () => {
    setCurrentDate(new Date());
    setPage(1);
  };

  // Event handlers
  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event);
    onEventClick?.(event);
  };

  const handleBook = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setBookingModalOpen(true);
  };

  const handleShare = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setShareModalOpen(true);
  };

  const handleReminder = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setReminderModalOpen(true);
  };

  const handleBookEvent = async (event: CalendarEvent, quantity: number, notes?: string): Promise<CalendarBooking> => {
    if (onBookEvent) {
      return await onBookEvent(event, quantity);
    }
    // Mock booking response
    return {
      id: `booking-${Date.now()}`,
      eventId: event.id,
      userId: 'user-1',
      bookingDate: new Date(),
      status: 'confirmed',
      quantity,
      totalPrice: (event.price || 0) * quantity,
      notes,
    };
  };

  const handleSetReminder = async (
    event: CalendarEvent, 
    reminder: Omit<CalendarReminder, 'id' | 'sent'>
  ): Promise<CalendarReminder> => {
    if (onSetReminder) {
      return await onSetReminder(event, reminder);
    }
    // Mock reminder response
    return {
      ...reminder,
      id: `reminder-${Date.now()}`,
      sent: false,
    };
  };

  const handleFilterChange = (newFilters: CalendarFilterConfig) => {
    setFilters(newFilters);
    onFilterChange?.(newFilters);
  };

  // Get events for a specific day
  const getEventsForDay = (date: Date) => {
    return filteredEvents.filter(event => isSameDay(new Date(event.startDate), date));
  };

  // Get events for a specific hour slot
  const getEventsForHour = (date: Date, hour: number) => {
    return filteredEvents.filter(event => {
      const eventStart = new Date(event.startDate);
      const eventEnd = new Date(event.endDate);
      const slotStart = setMinutes(setHours(date, hour), 0);
      const slotEnd = setMinutes(setHours(date, hour + 1), 0);
      
      return (
        (eventStart >= slotStart && eventStart < slotEnd) ||
        (eventStart < slotStart && eventEnd > slotStart)
      );
    });
  };

  // Time slots for day/week view (6 AM to 10 PM)
  const timeSlots = Array.from({ length: 17 }, (_, i) => i + 6);

  // Render calendar grid for month view
  const renderMonthView = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const calendarStart = startOfWeek(monthStart);
    const calendarEnd = endOfWeek(monthEnd);
    const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
      <div className="border border-border rounded-lg overflow-hidden">
        {/* Week day headers */}
        <div className="grid grid-cols-7 bg-muted/50">
          {weekDays.map(day => (
            <div
              key={day}
              className="p-2 text-center text-sm font-medium text-muted-foreground border-b border-border"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar days */}
        <div className="grid grid-cols-7">
          {days.map((day, idx) => {
            const dayEvents = getEventsForDay(day);
            const isCurrentMonth = isSameMonth(day, currentDate);
            const isCurrentDay = isToday(day);

            return (
              <div
                key={idx}
                className={cn(
                  'min-h-[100px] p-1 border-b border-r border-border cursor-pointer transition-colors',
                  !isCurrentMonth && 'bg-muted/30',
                  isCurrentDay && 'bg-primary/5',
                  'hover:bg-muted/50'
                )}
                onClick={() => onDateClick?.(day)}
              >
                <div className={cn(
                  'text-sm font-medium mb-1 w-7 h-7 flex items-center justify-center rounded-full',
                  isCurrentDay && 'bg-primary text-primary-foreground',
                  !isCurrentMonth && 'text-muted-foreground'
                )}>
                  {format(day, 'd')}
                </div>

                <div className="space-y-1">
                  {dayEvents.slice(0, 3).map(event => (
                    <EventTooltip
                      key={event.id}
                      event={event}
                      onBook={() => handleBook(event)}
                      onShare={() => handleShare(event)}
                      onReminder={() => handleReminder(event)}
                    >
                      <div
                        className={cn(
                          'text-xs p-1 rounded truncate cursor-pointer transition-opacity hover:opacity-80',
                          'text-primary-foreground'
                        )}
                        style={{ backgroundColor: event.color || 'hsl(var(--primary))' }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEventClick(event);
                        }}
                      >
                        {event.title}
                        {event.price !== undefined && event.price > 0 && (
                          <span className="ml-1 opacity-80">
                            ${event.price}
                          </span>
                        )}
                      </div>
                    </EventTooltip>
                  ))}
                  {dayEvents.length > 3 && (
                    <div className="text-xs text-muted-foreground pl-1">
                      +{dayEvents.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Render week view with time slots
  const renderWeekView = () => {
    const weekStart = startOfWeek(currentDate);
    const weekEnd = endOfWeek(currentDate);
    const days = eachDayOfInterval({ start: weekStart, end: weekEnd });

    return (
      <div className="border border-border rounded-lg overflow-hidden">
        {/* Week day headers */}
        <div className="grid grid-cols-8 bg-muted/50 sticky top-0 z-10">
          <div className="p-2 text-center text-sm font-medium text-muted-foreground border-b border-r border-border w-20">
            Time
          </div>
          {days.map(day => (
            <div
              key={day.toISOString()}
              className={cn(
                'p-2 text-center border-b border-r border-border',
                isToday(day) && 'bg-primary/10'
              )}
            >
              <div className="text-xs text-muted-foreground">{format(day, 'EEE')}</div>
              <div className={cn(
                'text-sm font-medium w-7 h-7 mx-auto flex items-center justify-center rounded-full',
                isToday(day) && 'bg-primary text-primary-foreground'
              )}>
                {format(day, 'd')}
              </div>
            </div>
          ))}
        </div>

        {/* Time slots grid */}
        <ScrollArea className="h-[600px]">
          <div className="grid grid-cols-8">
            {timeSlots.map(hour => (
              <React.Fragment key={hour}>
                {/* Time label */}
                <div className="p-2 text-xs text-muted-foreground border-b border-r border-border w-20 h-16 flex items-start justify-end pr-2">
                  {format(setHours(new Date(), hour), 'h a')}
                </div>
                {/* Day columns */}
                {days.map(day => {
                  const hourEvents = getEventsForHour(day, hour);
                  return (
                    <div
                      key={`${day.toISOString()}-${hour}`}
                      className={cn(
                        'border-b border-r border-border h-16 p-0.5 cursor-pointer hover:bg-muted/30 relative',
                        isToday(day) && 'bg-primary/5'
                      )}
                      onClick={() => onDateClick?.(setHours(day, hour))}
                    >
                      {hourEvents.map((event, idx) => (
                        <EventTooltip
                          key={event.id}
                          event={event}
                          onBook={() => handleBook(event)}
                          onShare={() => handleShare(event)}
                          onReminder={() => handleReminder(event)}
                        >
                          <div
                            className={cn(
                              'text-xs p-1 rounded truncate cursor-pointer mb-0.5 text-primary-foreground'
                            )}
                            style={{ backgroundColor: event.color || 'hsl(var(--primary))' }}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEventClick(event);
                            }}
                          >
                            {format(new Date(event.startDate), 'h:mm')} {event.title}
                          </div>
                        </EventTooltip>
                      ))}
                    </div>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        </ScrollArea>
      </div>
    );
  };

  // Render day view with time slots
  const renderDayView = () => {
    return (
      <div className="border border-border rounded-lg overflow-hidden">
        {/* Day header */}
        <div className="grid grid-cols-[80px_1fr] bg-muted/50 sticky top-0 z-10">
          <div className="p-2 text-center text-sm font-medium text-muted-foreground border-b border-r border-border">
            Time
          </div>
          <div className={cn(
            'p-3 text-center border-b border-border',
            isToday(currentDate) && 'bg-primary/10'
          )}>
            <div className="text-sm text-muted-foreground">{format(currentDate, 'EEEE')}</div>
            <div className={cn(
              'text-2xl font-semibold w-10 h-10 mx-auto flex items-center justify-center rounded-full',
              isToday(currentDate) && 'bg-primary text-primary-foreground'
            )}>
              {format(currentDate, 'd')}
            </div>
          </div>
        </div>

        {/* Time slots */}
        <ScrollArea className="h-[600px]">
          <div className="grid grid-cols-[80px_1fr]">
            {timeSlots.map(hour => {
              const hourEvents = getEventsForHour(currentDate, hour);
              return (
                <React.Fragment key={hour}>
                  {/* Time label */}
                  <div className="p-2 text-sm text-muted-foreground border-b border-r border-border h-20 flex items-start justify-end pr-3">
                    {format(setHours(new Date(), hour), 'h a')}
                  </div>
                  {/* Event slot */}
                  <div
                    className={cn(
                      'border-b border-border h-20 p-1 cursor-pointer hover:bg-muted/30'
                    )}
                    onClick={() => onDateClick?.(setHours(currentDate, hour))}
                  >
                    <div className="space-y-1">
                      {hourEvents.map(event => (
                        <EventTooltip
                          key={event.id}
                          event={event}
                          onBook={() => handleBook(event)}
                          onShare={() => handleShare(event)}
                          onReminder={() => handleReminder(event)}
                        >
                          <div
                            className="flex items-start gap-2 p-2 rounded cursor-pointer text-primary-foreground"
                            style={{ backgroundColor: event.color || 'hsl(var(--primary))' }}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEventClick(event);
                            }}
                          >
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-sm truncate">{event.title}</div>
                              <div className="text-xs opacity-80">
                                {format(new Date(event.startDate), 'h:mm a')} - {format(new Date(event.endDate), 'h:mm a')}
                              </div>
                            </div>
                            {event.price !== undefined && event.price > 0 && (
                              <Badge variant="secondary" className="shrink-0">
                                ${event.price}
                              </Badge>
                            )}
                          </div>
                        </EventTooltip>
                      ))}
                    </div>
                  </div>
                </React.Fragment>
              );
            })}
          </div>
        </ScrollArea>
      </div>
    );
  };

  // Render agenda view
  const renderAgendaView = () => {
    const { start, end } = getViewDateRange();
    const days = eachDayOfInterval({ start, end });
    const daysWithEvents = days.filter(day => getEventsForDay(day).length > 0);

    return (
      <ScrollArea className="h-[600px] border border-border rounded-lg">
        <div className="divide-y divide-border">
          {daysWithEvents.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              No events in this period
            </div>
          ) : (
            daysWithEvents.map(day => {
              const dayEvents = getEventsForDay(day);
              return (
                <div key={day.toISOString()} className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className={cn(
                      'w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold',
                      isToday(day) ? 'bg-primary text-primary-foreground' : 'bg-muted'
                    )}>
                      {format(day, 'd')}
                    </div>
                    <div>
                      <div className="font-medium">{format(day, 'EEEE')}</div>
                      <div className="text-sm text-muted-foreground">
                        {format(day, 'MMMM yyyy')}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 ml-12">
                    {dayEvents.map(event => (
                      <div
                        key={event.id}
                        className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted cursor-pointer transition-colors"
                        onClick={() => handleEventClick(event)}
                      >
                        <div
                          className="w-1 h-full min-h-[60px] rounded-full"
                          style={{ backgroundColor: event.color || 'hsl(var(--primary))' }}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h4 className="font-medium">{event.title}</h4>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                                <Clock className="h-3 w-3" />
                                <span>
                                  {format(new Date(event.startDate), 'h:mm a')} - {format(new Date(event.endDate), 'h:mm a')}
                                </span>
                              </div>
                            </div>
                            {event.price !== undefined && (
                              <Badge variant="secondary">
                                {event.price === 0 ? 'Free' : `$${event.price}`}
                              </Badge>
                            )}
                          </div>
                          {event.description && (
                            <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                              {event.description}
                            </p>
                          )}
                          <div className="flex gap-2 mt-3">
                            {showBookingPanel && onBookEvent && (
                              <Button
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleBook(event);
                                }}
                              >
                                Book
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleShare(event);
                              }}
                            >
                              Share
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleReminder(event);
                              }}
                            >
                              Remind
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })
          )}
          
          {/* Load more for lazy loading */}
          {lazyLoading?.enabled && hasMore && (
            <div className="p-4 text-center">
              <Button
                variant="outline"
                onClick={loadMore}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Loading...
                  </>
                ) : (
                  'Load More Events'
                )}
              </Button>
            </div>
          )}
        </div>
      </ScrollArea>
    );
  };

  // Render loading skeleton
  const renderSkeleton = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-7 gap-2">
        {Array.from({ length: 35 }).map((_, idx) => (
          <Skeleton key={idx} className="h-24" />
        ))}
      </div>
    </div>
  );

  return (
    <div className={cn('space-y-4', className)}>
      {/* Filters */}
      {showFilters && (
        <CalendarFilters
          filters={filters}
          onFilterChange={handleFilterChange}
          categories={categories}
          tags={tags}
        />
      )}

      {/* Calendar Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => navigate('prev')}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={() => navigate('next')}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button variant="outline" onClick={goToToday}>
            Today
          </Button>
          <h2 className="text-xl font-semibold ml-4">
            {view === 'day' 
              ? format(currentDate, 'EEEE, MMMM d, yyyy')
              : format(currentDate, 'MMMM yyyy')
            }
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant={view === 'month' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setView('month')}
          >
            <Grid3X3 className="h-4 w-4 mr-1" />
            Month
          </Button>
          <Button
            variant={view === 'week' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setView('week')}
          >
            <CalendarRange className="h-4 w-4 mr-1" />
            Week
          </Button>
          <Button
            variant={view === 'day' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setView('day')}
          >
            <CalendarDays className="h-4 w-4 mr-1" />
            Day
          </Button>
          <Button
            variant={view === 'agenda' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setView('agenda')}
          >
            <List className="h-4 w-4 mr-1" />
            Agenda
          </Button>
        </div>
      </div>

      {/* Calendar Content */}
      {isLoading && events.length === 0 ? (
        renderSkeleton()
      ) : view === 'month' ? (
        renderMonthView()
      ) : view === 'week' ? (
        renderWeekView()
      ) : view === 'day' ? (
        renderDayView()
      ) : (
        renderAgendaView()
      )}

      {/* Modals */}
      <BookingModal
        event={selectedEvent}
        open={bookingModalOpen}
        onOpenChange={setBookingModalOpen}
        onBook={handleBookEvent}
      />

      <ShareModal
        event={selectedEvent}
        open={shareModalOpen}
        onOpenChange={setShareModalOpen}
        onShare={onShare}
      />

      <ReminderModal
        event={selectedEvent}
        open={reminderModalOpen}
        onOpenChange={setReminderModalOpen}
        onSetReminder={handleSetReminder}
      />
    </div>
  );
};

export default DynamicEventCalendar;
