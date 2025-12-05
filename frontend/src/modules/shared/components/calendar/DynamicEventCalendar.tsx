import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
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
  Plus,
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
  addMinutes,
} from 'date-fns';
import { EventTooltip } from './EventTooltip';
import { BookingModal } from './BookingModal';
import { ShareModal } from './ShareModal';
import { ReminderModal } from './ReminderModal';
import { CalendarFilters } from './CalendarFilters';
import { EventCreateModal } from './EventCreateModal';
import { EventEditModal } from './EventEditModal';
import { DraggableEvent } from './DraggableEvent';
import { useCalendarDragDrop } from './useCalendarDragDrop';
import { cn } from '@/lib/utils';

const SLOT_HEIGHT = 64; // pixels per time slot
const START_HOUR = 6;
const END_HOUR = 22;

export const DynamicEventCalendar: React.FC<CalendarProps> = ({
  events: initialEvents = [],
  initialView = 'month',
  onEventClick,
  onDateClick,
  onBookEvent,
  onCancelBooking,
  onSetReminder,
  onShare,
  onEventCreate,
  onEventUpdate,
  onEventDelete,
  lazyLoading,
  filters: externalFilters,
  onFilterChange,
  showFilters = true,
  showBookingPanel = true,
  editable = false,
  locale = 'en-US',
  timezone,
  className,
  slotDuration = 30,
  defaultEventDuration = 60,
  defaultEventColor,
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
  const [editModalOpen, setEditModalOpen] = useState(false);

  // Refs for drag-drop
  const weekViewRef = useRef<HTMLDivElement>(null);
  const dayViewRef = useRef<HTMLDivElement>(null);

  // Drag-drop hook
  const {
    dragState,
    showCreateModal,
    setShowCreateModal,
    pendingEvent,
    dragRef,
    startDragCreate,
    startDragEvent,
    updateDrag,
    endDrag,
    cancelDrag,
    handleCreateEvent,
  } = useCalendarDragDrop({
    events,
    editable,
    slotDuration,
    defaultEventDuration,
    onEventCreate,
    onEventUpdate,
    setEvents,
  });

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
    if (editable) {
      setEditModalOpen(true);
    }
    onEventClick?.(event);
  };

  const handleEdit = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setEditModalOpen(true);
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

  const handleUpdateEvent = async (updatedEvent: CalendarEvent) => {
    if (onEventUpdate) {
      const result = await onEventUpdate(updatedEvent);
      setEvents(prev => prev.map(e => e.id === result.id ? result : e));
    } else {
      setEvents(prev => prev.map(e => e.id === updatedEvent.id ? updatedEvent : e));
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (onEventDelete) {
      await onEventDelete(eventId);
    }
    setEvents(prev => prev.filter(e => e.id !== eventId));
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

  // Get events for a day that span time slots
  const getEventsForDayColumn = (date: Date) => {
    return filteredEvents.filter(event => {
      const eventStart = new Date(event.startDate);
      return isSameDay(eventStart, date);
    });
  };

  // Time slots for day/week view
  const timeSlots = Array.from({ length: END_HOUR - START_HOUR + 1 }, (_, i) => i + START_HOUR);

  // Mouse handlers for drag-drop
  const handleSlotMouseDown = (date: Date, hour: number, e: React.MouseEvent) => {
    if (!editable) return;
    e.preventDefault();
    
    const slotDate = setMinutes(setHours(date, hour), 0);
    dragRef.current = {
      initialY: e.clientY,
      currentDate: slotDate,
      slotHeight: SLOT_HEIGHT,
      startHour: START_HOUR,
    };
    startDragCreate(slotDate, SLOT_HEIGHT, START_HOUR);
  };

  const handleMouseMove = useCallback((e: React.MouseEvent, containerRef: React.RefObject<HTMLDivElement>, date: Date) => {
    if (!dragState.isDragging || !containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    updateDrag(date, e.clientY, rect);
  }, [dragState.isDragging, updateDrag]);

  const handleMouseUp = useCallback(() => {
    if (dragState.isDragging) {
      endDrag();
    }
  }, [dragState.isDragging, endDrag]);

  // Global mouse up listener
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (dragState.isDragging) {
        endDrag();
      }
    };
    
    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => window.removeEventListener('mouseup', handleGlobalMouseUp);
  }, [dragState.isDragging, endDrag]);

  // Render drag preview
  const renderDragPreview = (date: Date) => {
    if (!dragState.isDragging || dragState.dragType !== 'create') return null;
    if (!dragState.startDate || !dragState.endDate) return null;
    if (!isSameDay(dragState.startDate, date)) return null;

    const startMinutes = dragState.startDate.getHours() * 60 + dragState.startDate.getMinutes();
    const endMinutes = dragState.endDate.getHours() * 60 + dragState.endDate.getMinutes();
    const durationMinutes = endMinutes - startMinutes;
    
    const pixelsPerMinute = SLOT_HEIGHT / slotDuration;
    const topOffset = (startMinutes - START_HOUR * 60) * pixelsPerMinute;
    const height = Math.max(durationMinutes * pixelsPerMinute, 24);

    return (
      <div
        className="absolute left-1 right-1 rounded bg-primary/50 border-2 border-dashed border-primary pointer-events-none z-30"
        style={{
          top: `${topOffset}px`,
          height: `${height}px`,
        }}
      >
        <div className="p-1 text-xs text-primary-foreground font-medium">
          {format(dragState.startDate, 'h:mm')} - {format(dragState.endDate, 'h:mm a')}
        </div>
      </div>
    );
  };

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

  // Render week view with time slots and drag-drop
  const renderWeekView = () => {
    const weekStart = startOfWeek(currentDate);
    const weekEnd = endOfWeek(currentDate);
    const days = eachDayOfInterval({ start: weekStart, end: weekEnd });

    return (
      <div className="border border-border rounded-lg overflow-hidden">
        {/* Week day headers */}
        <div className="grid grid-cols-8 bg-muted/50 sticky top-0 z-20">
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
          <div 
            ref={weekViewRef}
            className="grid grid-cols-8"
            onMouseUp={handleMouseUp}
          >
            {timeSlots.map(hour => (
              <React.Fragment key={hour}>
                {/* Time label */}
                <div className="p-2 text-xs text-muted-foreground border-b border-r border-border w-20 flex items-start justify-end pr-2" style={{ height: SLOT_HEIGHT }}>
                  {format(setHours(new Date(), hour), 'h a')}
                </div>
                {/* Day columns */}
                {days.map(day => {
                  const dayEvents = hour === START_HOUR ? getEventsForDayColumn(day) : [];
                  
                  return (
                    <div
                      key={`${day.toISOString()}-${hour}`}
                      className={cn(
                        'border-b border-r border-border p-0 cursor-pointer hover:bg-muted/30 relative',
                        isToday(day) && 'bg-primary/5',
                        editable && 'select-none'
                      )}
                      style={{ height: SLOT_HEIGHT }}
                      onMouseDown={(e) => handleSlotMouseDown(day, hour, e)}
                      onMouseMove={(e) => handleMouseMove(e, weekViewRef, day)}
                      onClick={() => !dragState.isDragging && onDateClick?.(setHours(day, hour))}
                    >
                      {/* Render events only from the first slot of the day column */}
                      {hour === START_HOUR && dayEvents.map(event => (
                        <DraggableEvent
                          key={event.id}
                          event={event}
                          view="week"
                          slotHeight={SLOT_HEIGHT}
                          slotDuration={slotDuration}
                          editable={editable}
                          startHour={START_HOUR}
                          onDragStart={startDragEvent}
                          onDragEnd={endDrag}
                          onClick={handleEventClick}
                          onBook={handleBook}
                          onShare={handleShare}
                          onReminder={handleReminder}
                        />
                      ))}
                      
                      {/* Drag preview */}
                      {hour === START_HOUR && renderDragPreview(day)}
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

  // Render day view with time slots and drag-drop
  const renderDayView = () => {
    const dayEvents = getEventsForDayColumn(currentDate);

    return (
      <div className="border border-border rounded-lg overflow-hidden">
        {/* Day header */}
        <div className="grid grid-cols-[80px_1fr] bg-muted/50 sticky top-0 z-20">
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
          <div 
            ref={dayViewRef}
            className="grid grid-cols-[80px_1fr] relative"
            onMouseUp={handleMouseUp}
          >
            {/* Time labels column */}
            <div>
              {timeSlots.map(hour => (
                <div 
                  key={hour} 
                  className="text-sm text-muted-foreground border-b border-r border-border flex items-start justify-end pr-3 pt-1"
                  style={{ height: SLOT_HEIGHT }}
                >
                  {format(setHours(new Date(), hour), 'h a')}
                </div>
              ))}
            </div>
            
            {/* Events column */}
            <div className="relative">
              {timeSlots.map(hour => (
                <div
                  key={hour}
                  className={cn(
                    'border-b border-border cursor-pointer hover:bg-muted/30',
                    editable && 'select-none'
                  )}
                  style={{ height: SLOT_HEIGHT }}
                  onMouseDown={(e) => handleSlotMouseDown(currentDate, hour, e)}
                  onMouseMove={(e) => handleMouseMove(e, dayViewRef, currentDate)}
                  onClick={() => !dragState.isDragging && onDateClick?.(setHours(currentDate, hour))}
                />
              ))}
              
              {/* Render all events positioned absolutely */}
              {dayEvents.map(event => (
                <DraggableEvent
                  key={event.id}
                  event={event}
                  view="day"
                  slotHeight={SLOT_HEIGHT}
                  slotDuration={slotDuration}
                  editable={editable}
                  startHour={START_HOUR}
                  onDragStart={startDragEvent}
                  onDragEnd={endDrag}
                  onClick={handleEventClick}
                  onBook={handleBook}
                  onShare={handleShare}
                  onReminder={handleReminder}
                />
              ))}
              
              {/* Drag preview */}
              {renderDragPreview(currentDate)}
            </div>
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
      <div className="flex items-center justify-between flex-wrap gap-2">
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
          {editable && (
            <Button
              size="sm"
              onClick={() => {
                const now = new Date();
                const startDate = setMinutes(setHours(now, now.getHours() + 1), 0);
                const endDate = addMinutes(startDate, defaultEventDuration);
                handleCreateEvent({
                  title: 'New Event',
                  startDate,
                  endDate,
                  color: defaultEventColor,
                });
              }}
            >
              <Plus className="h-4 w-4 mr-1" />
              Quick Add
            </Button>
          )}
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

      {/* Editable hint */}
      {editable && (view === 'week' || view === 'day') && (
        <div className="text-sm text-muted-foreground bg-muted/50 px-3 py-2 rounded-lg">
          💡 Click and drag on time slots to create events. Drag events to move them, or drag the edges to resize.
        </div>
      )}

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

      <EventCreateModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        startDate={pendingEvent?.start || null}
        endDate={pendingEvent?.end || null}
        onSave={handleCreateEvent}
        defaultColor={defaultEventColor}
      />

      {editable && (
        <EventEditModal
          open={editModalOpen}
          onOpenChange={setEditModalOpen}
          event={selectedEvent}
          onSave={handleUpdateEvent}
          onDelete={onEventDelete ? handleDeleteEvent : undefined}
        />
      )}
    </div>
  );
};

export default DynamicEventCalendar;
