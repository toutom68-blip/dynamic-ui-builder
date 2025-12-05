import React from 'react';
import { CalendarEvent } from './types/calendar.types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Clock,
  MapPin,
  DollarSign,
  Users,
  Share2,
  Bell,
  Calendar
} from 'lucide-react';
import { format } from 'date-fns';

interface EventTooltipProps {
  event: CalendarEvent;
  children: React.ReactNode;
  onBook?: () => void;
  onShare?: () => void;
  onReminder?: () => void;
}

export const EventTooltip: React.FC<EventTooltipProps> = ({
  event,
  children,
  onBook,
  onShare,
  onReminder,
}) => {
  const availableSpots = event.capacity ? event.capacity - (event.bookedCount || 0) : null;
  const isSoldOut = availableSpots !== null && availableSpots <= 0;

  return (
    <TooltipProvider>
      <Tooltip delayDuration={200}>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent
          side="right"
          className="w-80 p-0 bg-popover border-border shadow-xl"
          sideOffset={8}
        >
          {/* Header with image */}
          {event.imageUrl && (
            <div className="relative h-24 overflow-hidden rounded-t-md">
              <img
                src={event.imageUrl}
                alt={event.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
              {event.category && (
                <Badge
                  className="absolute top-2 left-2"
                  style={{ backgroundColor: event.color || 'hsl(var(--primary))' }}
                >
                  {event.category}
                </Badge>
              )}
            </div>
          )}

          <div className="p-4 space-y-3">
            {/* Title */}
            <div>
              <h4 className="font-semibold text-foreground line-clamp-2">
                {event.title}
              </h4>
              {event.organizer && (
                <p className="text-xs text-muted-foreground">by {event.organizer}</p>
              )}
            </div>

            {/* Description */}
            {event.description && (
              <p className="text-sm text-muted-foreground line-clamp-2">
                {event.description}
              </p>
            )}

            {/* Details */}
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>
                  {format(new Date(event.startDate), 'MMM d, yyyy • h:mm a')}
                </span>
              </div>

              {event.location && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span className="truncate">{event.location}</span>
                </div>
              )}

              {event.price !== undefined && (
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-primary" />
                  <span className="font-semibold text-primary">
                    {event.price === 0 ? 'Free' : `${event.currency || '$'}${event.price.toFixed(2)}`}
                  </span>
                </div>
              )}

              {event.capacity && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Users className="h-4 w-4" />
                  <span>
                    {isSoldOut ? (
                      <Badge variant="destructive" className="text-xs">Sold Out</Badge>
                    ) : (
                      `${availableSpots} spots left`
                    )}
                  </span>
                </div>
              )}
            </div>

            {/* Tags */}
            {event.tags && event.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {event.tags.slice(0, 3).map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
                {event.tags.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{event.tags.length - 3}
                  </Badge>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2 pt-2 border-t border-border">
              {onBook && !isSoldOut && (
                <Button
                  size="sm"
                  className="flex-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    onBook();
                  }}
                >
                  <Calendar className="h-4 w-4 mr-1" />
                  Book Now
                </Button>
              )}
              {onReminder && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    onReminder();
                  }}
                >
                  <Bell className="h-4 w-4" />
                </Button>
              )}
              {onShare && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    onShare();
                  }}
                >
                  <Share2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
