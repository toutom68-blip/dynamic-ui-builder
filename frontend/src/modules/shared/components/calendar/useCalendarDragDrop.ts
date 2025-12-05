import { useState, useCallback, useRef, useEffect } from 'react';
import { CalendarEvent, DragState } from '@/types/calendar.types';
import { setHours, setMinutes, addMinutes, differenceInMinutes } from 'date-fns';

interface UseCalendarDragDropProps {
  events: CalendarEvent[];
  editable: boolean;
  slotDuration: number;
  defaultEventDuration: number;
  onEventCreate?: (event: Omit<CalendarEvent, 'id'>) => Promise<CalendarEvent>;
  onEventUpdate?: (event: CalendarEvent) => Promise<CalendarEvent>;
  setEvents: React.Dispatch<React.SetStateAction<CalendarEvent[]>>;
}

export const useCalendarDragDrop = ({
  events,
  editable,
  slotDuration,
  defaultEventDuration,
  onEventCreate,
  onEventUpdate,
  setEvents,
}: UseCalendarDragDropProps) => {
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    dragType: null,
    startDate: null,
    endDate: null,
    eventId: null,
    originalEvent: null,
  });

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [pendingEvent, setPendingEvent] = useState<{ start: Date; end: Date } | null>(null);
  
  const dragRef = useRef<{
    initialY: number;
    currentDate: Date | null;
    slotHeight: number;
    startHour: number;
  }>({ initialY: 0, currentDate: null, slotHeight: 64, startHour: 6 });

  const snapToSlot = useCallback((date: Date): Date => {
    const minutes = date.getMinutes();
    const snappedMinutes = Math.round(minutes / slotDuration) * slotDuration;
    return setMinutes(date, snappedMinutes);
  }, [slotDuration]);

  const startDragCreate = useCallback((date: Date, slotHeight: number, startHour: number) => {
    if (!editable) return;
    
    const snappedDate = snapToSlot(date);
    dragRef.current = {
      initialY: 0,
      currentDate: snappedDate,
      slotHeight,
      startHour,
    };
    
    setDragState({
      isDragging: true,
      dragType: 'create',
      startDate: snappedDate,
      endDate: addMinutes(snappedDate, defaultEventDuration),
      eventId: null,
      originalEvent: null,
    });
  }, [editable, snapToSlot, defaultEventDuration]);

  const startDragEvent = useCallback((event: CalendarEvent, type: 'move' | 'resize-start' | 'resize-end') => {
    if (!editable) return;
    
    setDragState({
      isDragging: true,
      dragType: type,
      startDate: new Date(event.startDate),
      endDate: new Date(event.endDate),
      eventId: event.id,
      originalEvent: { ...event },
    });
  }, [editable]);

  const updateDrag = useCallback((currentDate: Date, mouseY: number, containerRect: DOMRect) => {
    if (!dragState.isDragging || !dragState.dragType) return;

    const { slotHeight, startHour } = dragRef.current;
    const relativeY = mouseY - containerRect.top;
    const minutesFromTop = (relativeY / slotHeight) * slotDuration;
    const currentMinutes = startHour * 60 + minutesFromTop;
    const hours = Math.floor(currentMinutes / 60);
    const minutes = Math.round((currentMinutes % 60) / slotDuration) * slotDuration;
    
    let newDate = setMinutes(setHours(currentDate, hours), minutes);
    newDate = snapToSlot(newDate);

    if (dragState.dragType === 'create') {
      const startDate = dragState.startDate!;
      if (newDate < startDate) {
        setDragState(prev => ({
          ...prev,
          startDate: newDate,
          endDate: startDate,
        }));
      } else {
        setDragState(prev => ({
          ...prev,
          endDate: addMinutes(newDate, slotDuration),
        }));
      }
    } else if (dragState.dragType === 'move' && dragState.originalEvent) {
      const duration = differenceInMinutes(
        new Date(dragState.originalEvent.endDate),
        new Date(dragState.originalEvent.startDate)
      );
      setDragState(prev => ({
        ...prev,
        startDate: newDate,
        endDate: addMinutes(newDate, duration),
      }));
      
      // Update preview in events
      setEvents(prev => prev.map(e => 
        e.id === dragState.eventId 
          ? { ...e, startDate: newDate, endDate: addMinutes(newDate, duration) }
          : e
      ));
    } else if (dragState.dragType === 'resize-start' && dragState.originalEvent) {
      const endDate = new Date(dragState.originalEvent.endDate);
      if (newDate < endDate) {
        setDragState(prev => ({ ...prev, startDate: newDate }));
        setEvents(prev => prev.map(e => 
          e.id === dragState.eventId ? { ...e, startDate: newDate } : e
        ));
      }
    } else if (dragState.dragType === 'resize-end' && dragState.originalEvent) {
      const startDate = new Date(dragState.originalEvent.startDate);
      const newEndDate = addMinutes(newDate, slotDuration);
      if (newEndDate > startDate) {
        setDragState(prev => ({ ...prev, endDate: newEndDate }));
        setEvents(prev => prev.map(e => 
          e.id === dragState.eventId ? { ...e, endDate: newEndDate } : e
        ));
      }
    }
  }, [dragState, slotDuration, snapToSlot, setEvents]);

  const endDrag = useCallback(async () => {
    if (!dragState.isDragging) return;

    if (dragState.dragType === 'create' && dragState.startDate && dragState.endDate) {
      setPendingEvent({
        start: dragState.startDate,
        end: dragState.endDate,
      });
      setShowCreateModal(true);
    } else if (dragState.dragType && dragState.eventId && dragState.startDate && dragState.endDate) {
      const updatedEvent = events.find(e => e.id === dragState.eventId);
      if (updatedEvent && onEventUpdate) {
        try {
          await onEventUpdate({
            ...updatedEvent,
            startDate: dragState.startDate,
            endDate: dragState.endDate,
          });
        } catch (error) {
          // Revert on error
          if (dragState.originalEvent) {
            setEvents(prev => prev.map(e => 
              e.id === dragState.eventId ? dragState.originalEvent! : e
            ));
          }
        }
      }
    }

    setDragState({
      isDragging: false,
      dragType: null,
      startDate: null,
      endDate: null,
      eventId: null,
      originalEvent: null,
    });
  }, [dragState, events, onEventUpdate, setEvents]);

  const cancelDrag = useCallback(() => {
    if (dragState.originalEvent && dragState.eventId) {
      setEvents(prev => prev.map(e => 
        e.id === dragState.eventId ? dragState.originalEvent! : e
      ));
    }
    
    setDragState({
      isDragging: false,
      dragType: null,
      startDate: null,
      endDate: null,
      eventId: null,
      originalEvent: null,
    });
  }, [dragState, setEvents]);

  const handleCreateEvent = useCallback(async (eventData: Omit<CalendarEvent, 'id'>) => {
    if (onEventCreate) {
      const newEvent = await onEventCreate(eventData);
      setEvents(prev => [...prev, newEvent]);
    } else {
      // Local creation with generated ID
      const newEvent: CalendarEvent = {
        ...eventData,
        id: `event-${Date.now()}`,
      };
      setEvents(prev => [...prev, newEvent]);
    }
    setPendingEvent(null);
    setShowCreateModal(false);
  }, [onEventCreate, setEvents]);

  // Handle escape key to cancel drag
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && dragState.isDragging) {
        cancelDrag();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [dragState.isDragging, cancelDrag]);

  return {
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
  };
};
