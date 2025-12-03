import React, { useState } from 'react';
import { CalendarEvent, CalendarReminder } from '@/types/calendar.types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  Bell, 
  Mail, 
  Smartphone, 
  MessageSquare,
  Calendar,
  Clock,
  Loader2,
  CheckCircle
} from 'lucide-react';
import { format, subMinutes, subHours, subDays } from 'date-fns';

interface ReminderModalProps {
  event: CalendarEvent | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSetReminder: (event: CalendarEvent, reminder: Omit<CalendarReminder, 'id' | 'sent'>) => Promise<CalendarReminder>;
}

const REMINDER_TIMES = [
  { value: '15m', label: '15 minutes before', minutes: 15 },
  { value: '30m', label: '30 minutes before', minutes: 30 },
  { value: '1h', label: '1 hour before', minutes: 60 },
  { value: '2h', label: '2 hours before', minutes: 120 },
  { value: '1d', label: '1 day before', minutes: 1440 },
  { value: '2d', label: '2 days before', minutes: 2880 },
  { value: '1w', label: '1 week before', minutes: 10080 },
];

export const ReminderModal: React.FC<ReminderModalProps> = ({
  event,
  open,
  onOpenChange,
  onSetReminder,
}) => {
  const [reminderType, setReminderType] = useState<'email' | 'push' | 'sms'>('email');
  const [reminderTime, setReminderTime] = useState('1h');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!event) return null;

  const selectedTime = REMINDER_TIMES.find(t => t.value === reminderTime);
  const reminderDate = selectedTime 
    ? subMinutes(new Date(event.startDate), selectedTime.minutes)
    : new Date(event.startDate);

  const handleSetReminder = async () => {
    setIsLoading(true);
    try {
      await onSetReminder(event, {
        eventId: event.id,
        type: reminderType,
        scheduledFor: reminderDate,
      });
      setIsSuccess(true);
      setTimeout(() => {
        handleClose();
      }, 2000);
    } catch (error) {
      console.error('Failed to set reminder:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setIsSuccess(false);
    setReminderType('email');
    setReminderTime('1h');
    onOpenChange(false);
  };

  if (isSuccess) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <CheckCircle className="h-10 w-10 text-primary" />
            </div>
            <DialogHeader className="text-center">
              <DialogTitle>Reminder Set!</DialogTitle>
              <DialogDescription>
                You'll be notified {selectedTime?.label || 'before'} the event.
              </DialogDescription>
            </DialogHeader>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Set Reminder
          </DialogTitle>
          <DialogDescription>
            Get notified before this event starts.
          </DialogDescription>
        </DialogHeader>

        {/* Event Info */}
        <div className="p-3 rounded-lg bg-muted/50 space-y-1">
          <h4 className="font-medium text-foreground">{event.title}</h4>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>{format(new Date(event.startDate), 'MMM d, yyyy')}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>{format(new Date(event.startDate), 'h:mm a')}</span>
            </div>
          </div>
        </div>

        {/* Reminder Type */}
        <div className="space-y-3">
          <Label>How would you like to be reminded?</Label>
          <RadioGroup
            value={reminderType}
            onValueChange={(value) => setReminderType(value as 'email' | 'push' | 'sms')}
            className="grid grid-cols-3 gap-2"
          >
            <Label
              htmlFor="email"
              className={`flex flex-col items-center gap-2 p-4 rounded-lg border cursor-pointer transition-colors ${
                reminderType === 'email' 
                  ? 'border-primary bg-primary/5' 
                  : 'border-border hover:bg-muted/50'
              }`}
            >
              <RadioGroupItem value="email" id="email" className="sr-only" />
              <Mail className={`h-5 w-5 ${reminderType === 'email' ? 'text-primary' : 'text-muted-foreground'}`} />
              <span className="text-sm">Email</span>
            </Label>
            <Label
              htmlFor="push"
              className={`flex flex-col items-center gap-2 p-4 rounded-lg border cursor-pointer transition-colors ${
                reminderType === 'push' 
                  ? 'border-primary bg-primary/5' 
                  : 'border-border hover:bg-muted/50'
              }`}
            >
              <RadioGroupItem value="push" id="push" className="sr-only" />
              <Smartphone className={`h-5 w-5 ${reminderType === 'push' ? 'text-primary' : 'text-muted-foreground'}`} />
              <span className="text-sm">Push</span>
            </Label>
            <Label
              htmlFor="sms"
              className={`flex flex-col items-center gap-2 p-4 rounded-lg border cursor-pointer transition-colors ${
                reminderType === 'sms' 
                  ? 'border-primary bg-primary/5' 
                  : 'border-border hover:bg-muted/50'
              }`}
            >
              <RadioGroupItem value="sms" id="sms" className="sr-only" />
              <MessageSquare className={`h-5 w-5 ${reminderType === 'sms' ? 'text-primary' : 'text-muted-foreground'}`} />
              <span className="text-sm">SMS</span>
            </Label>
          </RadioGroup>
        </div>

        {/* Reminder Time */}
        <div className="space-y-2">
          <Label>When should we remind you?</Label>
          <Select value={reminderTime} onValueChange={setReminderTime}>
            <SelectTrigger>
              <SelectValue placeholder="Select time" />
            </SelectTrigger>
            <SelectContent>
              {REMINDER_TIMES.map((time) => (
                <SelectItem key={time.value} value={time.value}>
                  {time.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            You'll be notified on {format(reminderDate, 'MMM d, yyyy')} at {format(reminderDate, 'h:mm a')}
          </p>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleSetReminder} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Setting...
              </>
            ) : (
              <>
                <Bell className="h-4 w-4 mr-2" />
                Set Reminder
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
