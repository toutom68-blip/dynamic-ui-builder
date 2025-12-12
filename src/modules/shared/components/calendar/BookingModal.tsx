import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CalendarEvent, CalendarBooking } from './types/calendar.types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Calendar,
  Clock,
  MapPin,
  DollarSign,
  Users,
  Minus,
  Plus,
  Loader2,
  CheckCircle
} from 'lucide-react';
import { format } from 'date-fns';

interface BookingModalProps {
  event: CalendarEvent | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onBook: (event: CalendarEvent, quantity: number, notes?: string) => Promise<CalendarBooking>;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  event,
  open,
  onOpenChange,
  onBook,
}) => {
  const { t } = useTranslation();
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [booking, setBooking] = useState<CalendarBooking | null>(null);

  if (!event) return null;

  const availableSpots = event.capacity ? event.capacity - (event.bookedCount || 0) : Infinity;
  const totalPrice = (event.price || 0) * quantity;

  const handleQuantityChange = (delta: number) => {
    const newQuantity = quantity + delta;
    if (newQuantity >= 1 && newQuantity <= Math.min(availableSpots, 10)) {
      setQuantity(newQuantity);
    }
  };

  const handleBook = async () => {
    setIsLoading(true);
    try {
      const result = await onBook(event, quantity, notes);
      setBooking(result);
      setIsSuccess(true);
    } catch (error) {
      console.error('Booking failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setQuantity(1);
    setNotes('');
    setIsSuccess(false);
    setBooking(null);
    onOpenChange(false);
  };

  if (isSuccess && booking) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <CheckCircle className="h-10 w-10 text-primary" />
            </div>
            <DialogHeader className="text-center">
              <DialogTitle>{t('booking.confirmed')}</DialogTitle>
              <DialogDescription>
                {t('booking.confirmDescription', { title: event.title })}
              </DialogDescription>
            </DialogHeader>
            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                {t('booking.bookingId')}: <span className="font-mono text-foreground">{booking.id}</span>
              </p>
              <p className="text-sm text-muted-foreground">
                {t('booking.quantity')}: {booking.quantity} {t('booking.tickets')}
              </p>
              <p className="text-lg font-semibold text-primary">
                {t('booking.total')}: {event.currency || '$'}{booking.totalPrice.toFixed(2)}
              </p>
            </div>
            <Button onClick={handleClose} className="w-full">
              {t('booking.done')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{t('booking.title')}</DialogTitle>
          <DialogDescription>{t('booking.description')}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex gap-4 p-4 rounded-lg bg-muted/50">
            {event.imageUrl && (
              <img src={event.imageUrl} alt={event.title} className="w-20 h-20 object-cover rounded-md" />
            )}
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-foreground truncate">{event.title}</h4>
              {event.category && (
                <Badge variant="secondary" className="mt-1" style={{ backgroundColor: event.color }}>
                  {event.category}
                </Badge>
              )}
            </div>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>{format(new Date(event.startDate), 'EEEE, MMMM d, yyyy')}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>{format(new Date(event.startDate), 'h:mm a')} - {format(new Date(event.endDate), 'h:mm a')}</span>
            </div>
            {event.location && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>{event.location}</span>
              </div>
            )}
          </div>

          <Separator />

          <div className="space-y-2">
            <Label>{t('booking.numberOfTickets')}</Label>
            <div className="flex items-center gap-4">
              <Button variant="outline" size="icon" onClick={() => handleQuantityChange(-1)} disabled={quantity <= 1}>
                <Minus className="h-4 w-4" />
              </Button>
              <span className="w-12 text-center text-lg font-semibold">{quantity}</span>
              <Button variant="outline" size="icon" onClick={() => handleQuantityChange(1)} disabled={quantity >= Math.min(availableSpots, 10)}>
                <Plus className="h-4 w-4" />
              </Button>
              {event.capacity && (
                <span className="text-sm text-muted-foreground">
                  <Users className="h-4 w-4 inline mr-1" />
                  {availableSpots} {t('booking.available')}
                </span>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">{t('booking.specialRequests')}</Label>
            <Textarea id="notes" placeholder={t('booking.specialRequestsPlaceholder')} value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
          </div>

          <Separator />

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{t('booking.pricePerTicket')}</span>
              <span>{event.price === 0 ? t('booking.free') : `${event.currency || '$'}${(event.price || 0).toFixed(2)}`}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{t('booking.quantity')}</span>
              <span>× {quantity}</span>
            </div>
            <Separator />
            <div className="flex justify-between font-semibold text-lg">
              <span>{t('booking.total')}</span>
              <span className="text-primary">{totalPrice === 0 ? t('booking.free') : `${event.currency || '$'}${totalPrice.toFixed(2)}`}</span>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>{t('common.cancel')}</Button>
          <Button onClick={handleBook} disabled={isLoading}>
            {isLoading ? (
              <><Loader2 className="h-4 w-4 mr-2 animate-spin" />{t('booking.processing')}</>
            ) : (
              <><DollarSign className="h-4 w-4 mr-1" />{t('booking.confirmBooking')}</>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
