import React, { useState } from 'react';
import { CalendarEvent } from './types/calendar.types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Copy,
  Mail,
  Twitter,
  Facebook,
  MessageCircle,
  Check,
  Calendar,
  Clock,
  MapPin
} from 'lucide-react';
import { format } from 'date-fns';

interface ShareModalProps {
  event: CalendarEvent | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onShare?: (event: CalendarEvent, platform: 'copy' | 'email' | 'twitter' | 'facebook' | 'whatsapp') => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  event,
  open,
  onOpenChange,
  onShare,
}) => {
  const [copied, setCopied] = useState(false);

  if (!event) return null;

  const eventUrl = `${window.location.origin}/events/${event.id}`;
  const eventText = `${event.title} - ${format(new Date(event.startDate), 'MMM d, yyyy')}`;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(eventUrl);
    setCopied(true);
    onShare?.(event, 'copy');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = (platform: 'email' | 'twitter' | 'facebook' | 'whatsapp') => {
    const encodedUrl = encodeURIComponent(eventUrl);
    const encodedText = encodeURIComponent(eventText);
    const encodedDescription = encodeURIComponent(event.description || '');

    let shareUrl = '';
    switch (platform) {
      case 'email':
        shareUrl = `mailto:?subject=${encodedText}&body=Check out this event: ${encodedUrl}%0A%0A${encodedDescription}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
        break;
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${encodedText}%20${encodedUrl}`;
        break;
    }

    window.open(shareUrl, '_blank', 'width=600,height=400');
    onShare?.(event, platform);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share Event</DialogTitle>
          <DialogDescription>
            Share this event with friends and colleagues.
          </DialogDescription>
        </DialogHeader>

        {/* Event Preview */}
        <div className="flex gap-4 p-4 rounded-lg bg-muted/50">
          {event.imageUrl && (
            <img
              src={event.imageUrl}
              alt={event.title}
              className="w-16 h-16 object-cover rounded-md"
            />
          )}
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-foreground truncate">{event.title}</h4>
            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
              <Calendar className="h-3 w-3" />
              <span>{format(new Date(event.startDate), 'MMM d, yyyy')}</span>
            </div>
            {event.location && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin className="h-3 w-3" />
                <span className="truncate">{event.location}</span>
              </div>
            )}
          </div>
        </div>

        {/* Copy Link */}
        <div className="flex gap-2">
          <Input
            value={eventUrl}
            readOnly
            className="flex-1 text-sm"
          />
          <Button
            variant="outline"
            size="icon"
            onClick={handleCopy}
            className="shrink-0"
          >
            {copied ? (
              <Check className="h-4 w-4 text-primary" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Share Buttons */}
        <div className="grid grid-cols-4 gap-2">
          <Button
            variant="outline"
            className="flex flex-col items-center gap-1 h-auto py-4"
            onClick={() => handleShare('email')}
          >
            <Mail className="h-5 w-5" />
            <span className="text-xs">Email</span>
          </Button>
          <Button
            variant="outline"
            className="flex flex-col items-center gap-1 h-auto py-4"
            onClick={() => handleShare('twitter')}
          >
            <Twitter className="h-5 w-5" />
            <span className="text-xs">Twitter</span>
          </Button>
          <Button
            variant="outline"
            className="flex flex-col items-center gap-1 h-auto py-4"
            onClick={() => handleShare('facebook')}
          >
            <Facebook className="h-5 w-5" />
            <span className="text-xs">Facebook</span>
          </Button>
          <Button
            variant="outline"
            className="flex flex-col items-center gap-1 h-auto py-4"
            onClick={() => handleShare('whatsapp')}
          >
            <MessageCircle className="h-5 w-5" />
            <span className="text-xs">WhatsApp</span>
          </Button>
        </div>

        {/* Add to Calendar */}
        <div className="pt-2 border-t border-border">
          <p className="text-sm text-muted-foreground mb-2">Add to calendar</p>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" className="flex-1">
              Google Calendar
            </Button>
            <Button variant="secondary" size="sm" className="flex-1">
              Apple Calendar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
