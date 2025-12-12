import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { CalendarEvent } from './types/calendar.types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { format } from 'date-fns';
import { Trash2, Loader2 } from 'lucide-react';

interface EventEditModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event: CalendarEvent | null;
  onSave: (event: CalendarEvent) => Promise<void>;
  onDelete?: (eventId: string) => Promise<void>;
}

export const EventEditModal: React.FC<EventEditModalProps> = ({ open, onOpenChange, event, onSave, onDelete }) => {
  const { t } = useTranslation();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [price, setPrice] = useState('');
  const [color, setColor] = useState('');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (open && event) {
      setTitle(event.title);
      setDescription(event.description || '');
      setLocation(event.location || '');
      setPrice(event.price?.toString() || '');
      setColor(event.color || 'hsl(var(--primary))');
      setStartDate(new Date(event.startDate));
      setEndDate(new Date(event.endDate));
    }
  }, [open, event]);

  const handleSave = async () => {
    if (!title.trim() || !event || !startDate || !endDate) return;
    setIsLoading(true);
    try {
      await onSave({ ...event, title: title.trim(), description: description.trim() || undefined, location: location.trim() || undefined, startDate, endDate, price: price ? parseFloat(price) : undefined, color });
      onOpenChange(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!event || !onDelete) return;
    setIsDeleting(true);
    try {
      await onDelete(event.id);
      setShowDeleteConfirm(false);
      onOpenChange(false);
    } finally {
      setIsDeleting(false);
    }
  };

  const colorOptions = ['hsl(var(--primary))', 'hsl(220, 70%, 50%)', 'hsl(142, 76%, 36%)', 'hsl(0, 84%, 60%)', 'hsl(38, 92%, 50%)', 'hsl(280, 68%, 60%)', 'hsl(190, 95%, 39%)', 'hsl(340, 82%, 52%)'];

  const formatDateTimeLocal = (date: Date | null) => date ? format(date, "yyyy-MM-dd'T'HH:mm") : '';

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader><DialogTitle>{t('calendar.editEvent')}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-title">{t('calendar.eventTitle')} *</Label>
              <Input id="edit-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder={t('calendar.eventTitlePlaceholder')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">{t('calendar.eventDescription')}</Label>
              <Textarea id="edit-description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder={t('calendar.eventDescriptionPlaceholder')} rows={3} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-start">{t('calendar.startDate')} *</Label>
                <Input id="edit-start" type="datetime-local" value={formatDateTimeLocal(startDate)} onChange={(e) => { const d = new Date(e.target.value); if (!isNaN(d.getTime())) setStartDate(d); }} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-end">{t('calendar.endDate')} *</Label>
                <Input id="edit-end" type="datetime-local" value={formatDateTimeLocal(endDate)} onChange={(e) => { const d = new Date(e.target.value); if (!isNaN(d.getTime())) setEndDate(d); }} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-location">{t('calendar.eventLocation')}</Label>
              <Input id="edit-location" value={location} onChange={(e) => setLocation(e.target.value)} placeholder={t('calendar.eventLocationPlaceholder')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-price">{t('calendar.eventPrice')}</Label>
              <Input id="edit-price" type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="0.00" min="0" step="0.01" />
            </div>
            <div className="space-y-2">
              <Label>{t('calendar.eventColor')}</Label>
              <div className="flex gap-2 flex-wrap">
                {colorOptions.map((c) => (
                  <button key={c} type="button" className={`w-8 h-8 rounded-full border-2 transition-all ${color === c ? 'border-foreground scale-110' : 'border-transparent'}`} style={{ backgroundColor: c }} onClick={() => setColor(c)} />
                ))}
              </div>
            </div>
          </div>
          <DialogFooter className="flex justify-between sm:justify-between">
            {onDelete && <Button variant="destructive" onClick={() => setShowDeleteConfirm(true)} disabled={isLoading || isDeleting}><Trash2 className="w-4 h-4 mr-2" />{t('common.delete')}</Button>}
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>{t('common.cancel')}</Button>
              <Button onClick={handleSave} disabled={!title.trim() || isLoading}>{isLoading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />{t('calendar.saving')}</> : t('calendar.saveChanges')}</Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('calendar.deleteConfirmTitle')}</AlertDialogTitle>
            <AlertDialogDescription>{t('calendar.deleteConfirmDescription', { title: event?.title })}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isDeleting} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {isDeleting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />{t('calendar.deleting')}</> : t('common.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
