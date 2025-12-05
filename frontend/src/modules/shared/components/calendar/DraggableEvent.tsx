import React, { useRef, useState } from 'react';
import { CalendarEvent } from '@/types/calendar.types';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { GripVertical, Maximize2 } from 'lucide-react';
import { EventTooltip } from './EventTooltip';

interface DraggableEventProps {
  event: CalendarEvent;
  view: 'week' | 'day';
  slotHeight: number;
  slotDuration: number;
  editable?: boolean;
  onDragStart: (event: CalendarEvent, type: 'move' | 'resize-start' | 'resize-end') => void;
  onDragEnd: () => void;
  onClick: (event: CalendarEvent) => void;
  onBook: (event: CalendarEvent) => void;
  onShare: (event: CalendarEvent) => void;
  onReminder: (event: CalendarEvent) => void;
  startHour: number;
}

export const DraggableEvent: React.FC<DraggableEventProps> = ({
  event,
  view,
  slotHeight,
  slotDuration,
  editable = false,
  onDragStart,
  onDragEnd,
  onClick,
  onBook,
  onShare,
  onReminder,
  startHour,
}) => {
  const eventRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  const eventStart = new Date(event.startDate);
  const eventEnd = new Date(event.endDate);
  
  // Calculate position and height
  const startMinutes = eventStart.getHours() * 60 + eventStart.getMinutes();
  const endMinutes = eventEnd.getHours() * 60 + eventEnd.getMinutes();
  const durationMinutes = endMinutes - startMinutes;
  
  const pixelsPerMinute = slotHeight / slotDuration;
  const topOffset = (startMinutes - startHour * 60) * pixelsPerMinute;
  const height = Math.max(durationMinutes * pixelsPerMinute, 24); // minimum height

  const handleMouseDown = (e: React.MouseEvent, type: 'move' | 'resize-start' | 'resize-end') => {
    if (!editable) return;
    e.stopPropagation();
    e.preventDefault();
    onDragStart(event, type);
  };

  return (
    <EventTooltip
      event={event}
      onBook={() => onBook(event)}
      onShare={() => onShare(event)}
      onReminder={() => onReminder(event)}
    >
      <div
        ref={eventRef}
        className={cn(
          'absolute left-1 right-1 rounded px-1 py-0.5 overflow-hidden text-primary-foreground transition-shadow',
          editable && 'cursor-move',
          isHovered && editable && 'shadow-lg ring-2 ring-primary/50'
        )}
        style={{
          backgroundColor: event.color || 'hsl(var(--primary))',
          top: `${topOffset}px`,
          height: `${height}px`,
          zIndex: isHovered ? 20 : 10,
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onMouseDown={(e) => handleMouseDown(e, 'move')}
        onClick={(e) => {
          e.stopPropagation();
          onClick(event);
        }}
      >
        {/* Resize handle top */}
        {editable && height > 40 && (
          <div
            className="absolute top-0 left-0 right-0 h-2 cursor-n-resize flex items-center justify-center opacity-0 hover:opacity-100 bg-black/20"
            onMouseDown={(e) => handleMouseDown(e, 'resize-start')}
          >
            <div className="w-8 h-0.5 bg-white/50 rounded" />
          </div>
        )}

        {/* Event content */}
        <div className="flex items-start gap-1 h-full">
          {editable && (
            <GripVertical className="h-3 w-3 shrink-0 opacity-50 mt-0.5" />
          )}
          <div className="flex-1 min-w-0 overflow-hidden">
            <div className="text-xs font-medium truncate">{event.title}</div>
            {height > 36 && (
              <div className="text-[10px] opacity-80 truncate">
                {format(eventStart, 'h:mm')} - {format(eventEnd, 'h:mm a')}
              </div>
            )}
            {height > 56 && event.price !== undefined && event.price > 0 && (
              <div className="text-[10px] opacity-80">${event.price}</div>
            )}
          </div>
        </div>

        {/* Resize handle bottom */}
        {editable && height > 40 && (
          <div
            className="absolute bottom-0 left-0 right-0 h-2 cursor-s-resize flex items-center justify-center opacity-0 hover:opacity-100 bg-black/20"
            onMouseDown={(e) => handleMouseDown(e, 'resize-end')}
          >
            <div className="w-8 h-0.5 bg-white/50 rounded" />
          </div>
        )}
      </div>
    </EventTooltip>
  );
};
