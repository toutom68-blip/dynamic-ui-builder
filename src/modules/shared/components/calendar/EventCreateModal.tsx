import React, { useState, useEffect } from 'react';
import { CalendarEvent } from './types/calendar.types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { format } from 'date-fns';

interface EventCreateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  startDate: Date | null;
  endDate: Date | null;
  onSave: (event: Omit<CalendarEvent, 'id'>) => Promise<void>;
  defaultColor?: string;
}

export const EventCreateModal: React.FC<EventCreateModalProps> = ({
  open,
  onOpenChange,
  startDate,
  endDate,
  onSave,
  defaultColor = 'hsl(var(--primary))',
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [price, setPrice] = useState('');
  const [color, setColor] = useState(defaultColor);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setTitle('');
      setDescription('');
      setLocation('');
      setPrice('');
      setColor(defaultColor);
    }
  }, [open, defaultColor]);

  const handleSave = async () => {
    if (!title.trim() || !startDate || !endDate) return;

    setIsLoading(true);
    try {
      await onSave({
        title: title.trim(),
        description: description.trim() || undefined,
        location: location.trim() || undefined,
        startDate,
        endDate,
        price: price ? parseFloat(price) : undefined,
        color,
      });
      onOpenChange(false);
    } finally {
      setIsLoading(false);
    }
  };

  const colorOptions = [
    'hsl(var(--primary))',
    'hsl(220, 70%, 50%)',
    'hsl(142, 76%, 36%)',
    'hsl(0, 84%, 60%)',
    'hsl(38, 92%, 50%)',
    'hsl(280, 68%, 60%)',
    'hsl(190, 95%, 39%)',
    'hsl(340, 82%, 52%)',
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create Event</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Event title"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Event description"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Start</Label>
              <div className="text-sm text-muted-foreground bg-muted p-2 rounded">
                {startDate ? format(startDate, 'MMM d, h:mm a') : '-'}
              </div>
            </div>
            <div className="space-y-2">
              <Label>End</Label>
              <div className="text-sm text-muted-foreground bg-muted p-2 rounded">
                {endDate ? format(endDate, 'MMM d, h:mm a') : '-'}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Event location"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="price">Price</Label>
            <Input
              id="price"
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="0.00"
              min="0"
              step="0.01"
            />
          </div>

          <div className="space-y-2">
            <Label>Color</Label>
            <div className="flex gap-2 flex-wrap">
              {colorOptions.map((c) => (
                <button
                  key={c}
                  type="button"
                  className={`w-8 h-8 rounded-full border-2 transition-all ${color === c ? 'border-foreground scale-110' : 'border-transparent'
                    }`}
                  style={{ backgroundColor: c }}
                  onClick={() => setColor(c)}
                />
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!title.trim() || isLoading}>
            {isLoading ? 'Creating...' : 'Create Event'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
