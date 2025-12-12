import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CalendarEvent, CalendarReminder } from './types/calendar.types';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Bell, Mail, Smartphone, MessageSquare, Calendar, Clock, Loader2, CheckCircle } from 'lucide-react';
import { format, subMinutes } from 'date-fns';

interface ReminderModalProps {
  event: CalendarEvent | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSetReminder: (event: CalendarEvent, reminder: Omit<CalendarReminder, 'id' | 'sent'>) => Promise<CalendarReminder>;
}

const REMINDER_TIMES = [
  { value: '15m', minutes: 15 },
  { value: '30m', minutes: 30 },
  { value: '1h', minutes: 60 },
  { value: '2h', minutes: 120 },
  { value: '1d', minutes: 1440 },
  { value: '2d', minutes: 2880 },
  { value: '1w', minutes: 10080 },
];

export const ReminderModal: React.FC<ReminderModalProps> = ({ event, open, onOpenChange, onSetReminder }) => {
  const { t } = useTranslation();
  const [reminderType, setReminderType] = useState<'email' | 'push' | 'sms'>('email');
  const [reminderTime, setReminderTime] = useState('1h');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!event) return null;

  const selectedTime = REMINDER_TIMES.find(time => time.value === reminderTime);
  const reminderDate = selectedTime ? subMinutes(new Date(event.startDate), selectedTime.minutes) : new Date(event.startDate);

  const handleSetReminder = async () => {
    setIsLoading(true);
    try {
      await onSetReminder(event, { eventId: event.id, type: reminderType, scheduledFor: reminderDate });
      setIsSuccess(true);
      setTimeout(() => handleClose(), 2000);
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
              <DialogTitle>{t('reminder.set')}</DialogTitle>
              <DialogDescription>{t('reminder.setDescription', { time: t(`reminder.times.${reminderTime}`) })}</DialogDescription>
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
          <DialogTitle className="flex items-center gap-2"><Bell className="h-5 w-5" />{t('reminder.title')}</DialogTitle>
          <DialogDescription>{t('reminder.description')}</DialogDescription>
        </DialogHeader>

        <div className="p-3 rounded-lg bg-muted/50 space-y-1">
          <h4 className="font-medium text-foreground">{event.title}</h4>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1"><Calendar className="h-3 w-3" /><span>{format(new Date(event.startDate), 'MMM d, yyyy')}</span></div>
            <div className="flex items-center gap-1"><Clock className="h-3 w-3" /><span>{format(new Date(event.startDate), 'h:mm a')}</span></div>
          </div>
        </div>

        <div className="space-y-3">
          <Label>{t('reminder.howToRemind')}</Label>
          <RadioGroup value={reminderType} onValueChange={(value) => setReminderType(value as 'email' | 'push' | 'sms')} className="grid grid-cols-3 gap-2">
            {(['email', 'push', 'sms'] as const).map((type) => (
              <Label key={type} htmlFor={type} className={`flex flex-col items-center gap-2 p-4 rounded-lg border cursor-pointer transition-colors ${reminderType === type ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted/50'}`}>
                <RadioGroupItem value={type} id={type} className="sr-only" />
                {type === 'email' && <Mail className={`h-5 w-5 ${reminderType === type ? 'text-primary' : 'text-muted-foreground'}`} />}
                {type === 'push' && <Smartphone className={`h-5 w-5 ${reminderType === type ? 'text-primary' : 'text-muted-foreground'}`} />}
                {type === 'sms' && <MessageSquare className={`h-5 w-5 ${reminderType === type ? 'text-primary' : 'text-muted-foreground'}`} />}
                <span className="text-sm">{t(`reminder.${type}`)}</span>
              </Label>
            ))}
          </RadioGroup>
        </div>

        <div className="space-y-2">
          <Label>{t('reminder.whenToRemind')}</Label>
          <Select value={reminderTime} onValueChange={setReminderTime}>
            <SelectTrigger><SelectValue placeholder={t('reminder.selectTime')} /></SelectTrigger>
            <SelectContent>
              {REMINDER_TIMES.map((time) => (
                <SelectItem key={time.value} value={time.value}>{t(`reminder.times.${time.value}`)}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">{t('reminder.notifyAt', { date: format(reminderDate, 'MMM d, yyyy'), time: format(reminderDate, 'h:mm a') })}</p>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>{t('common.cancel')}</Button>
          <Button onClick={handleSetReminder} disabled={isLoading}>
            {isLoading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />{t('reminder.setting')}</> : <><Bell className="h-4 w-4 mr-2" />{t('reminder.setReminder')}</>}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
