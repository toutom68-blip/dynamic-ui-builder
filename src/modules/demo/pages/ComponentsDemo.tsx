import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { DynamicInput } from '@/modules/shared/components/DynamicInput';
import { DynamicButton } from '@/modules/shared/components/DynamicButton';
import { DynamicDropdown } from '@/modules/shared/components/DynamicDropdown';
import { DynamicGrid } from '@/modules/shared/components/DynamicGrid';
import { DynamicFileUploader } from '@/modules/shared/components/DynamicFileUploader';
import { DynamicImage } from '@/modules/shared/components/DynamicImage';
import { DynamicSubMenu } from '@/modules/shared/components/DynamicSubMenu';
import { DynamicForm } from '@/modules/shared/components/DynamicForm';
import { MapSearch } from '@/modules/shared/components/MapSearch';
import { DynamicEventCalendar } from '@/modules/shared/components/calendar/DynamicEventCalendar';
import { BookingModal } from '@/modules/shared/components/calendar/BookingModal';
import { DynamicImageCropper } from '@/modules/shared/components/DynamicImageCropper';
import { Button } from '@/components/ui/button';
import { Home, Settings, Users, FileText, Filter, ArrowRight, Calendar, ImageIcon, Ticket } from 'lucide-react';
import { CalendarEvent, CalendarBooking } from '@/modules/shared/components/calendar/types/calendar.types';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import type { Property } from '@/types/property.types';

export const ComponentsDemo = () => {
  const { t } = useTranslation();
  const [inputValue, setInputValue] = useState('');
  const [dropdownValue, setDropdownValue] = useState('');
  const [multiSelectValues, setMultiSelectValues] = useState<(string | number)[]>([]);
  
  // Booking Modal state
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [selectedEventForBooking, setSelectedEventForBooking] = useState<CalendarEvent | null>(null);
  
  // Image Cropper state
  const [cropperOpen, setCropperOpen] = useState(false);
  const [croppedImage, setCroppedImage] = useState<string | null>(null);

  // Sample calendar events
  const sampleEvents: CalendarEvent[] = [
    {
      id: '1',
      title: 'Team Meeting',
      description: 'Weekly team sync',
      startDate: new Date(new Date().setHours(10, 0, 0, 0)),
      endDate: new Date(new Date().setHours(11, 0, 0, 0)),
      category: 'Work',
      color: 'hsl(var(--primary))',
      location: 'Conference Room A',
      price: 0,
      currency: '$',
    },
    {
      id: '2',
      title: 'Project Review',
      description: 'Quarterly project review',
      startDate: new Date(new Date().setHours(14, 0, 0, 0)),
      endDate: new Date(new Date().setHours(15, 30, 0, 0)),
      category: 'Meeting',
      color: 'hsl(220, 70%, 50%)',
      location: 'Main Office',
      price: 50,
      currency: '$',
      capacity: 20,
      bookedCount: 5,
    },
    {
      id: '3',
      title: 'Workshop',
      description: 'Design thinking workshop',
      startDate: new Date(new Date().getTime() + 86400000), // Tomorrow
      endDate: new Date(new Date().getTime() + 86400000 + 7200000),
      category: 'Training',
      color: 'hsl(150, 60%, 45%)',
      location: 'Training Center',
      price: 100,
      currency: '$',
      capacity: 15,
      bookedCount: 10,
    },
  ];

  const handleBookEvent = async (event: CalendarEvent, quantity: number, notes?: string): Promise<CalendarBooking> => {
    // Simulate booking
    await new Promise(resolve => setTimeout(resolve, 1000));
    const booking: CalendarBooking = {
      id: `booking-${Date.now()}`,
      eventId: event.id,
      userId: 'user-1',
      bookingDate: new Date(),
      status: 'confirmed',
      quantity,
      totalPrice: (event.price || 0) * quantity,
      notes,
    };
    toast.success(`Booked ${quantity} ticket(s) for ${event.title}`);
    return booking;
  };

  const handleCropComplete = (croppedUrl: string) => {
    setCroppedImage(croppedUrl);
    toast.success('Image cropped successfully!');
  };

  const sampleProperties: Property[] = [
    {
      id: '1',
      title: 'Modern Apartment in Downtown',
      description: 'Spacious modern apartment with stunning city views',
      price: 250,
      currency: '$',
      location: {
        lat: 40.7128,
        lng: -74.006,
        address: '123 Main St',
        city: 'New York',
        country: 'USA',
      },
      images: ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800'],
      bedrooms: 2,
      bathrooms: 2,
      guests: 4,
      rating: 4.8,
      reviewCount: 124,
      amenities: ['WiFi', 'Kitchen', 'AC', 'Workspace'],
      hostName: 'John Doe',
      hostAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
      propertyType: 'apartment',
      available: true,
    },
    {
      id: '2',
      title: 'Cozy Studio Near Central Park',
      description: 'Perfect studio apartment close to Central Park',
      price: 180,
      currency: '$',
      location: {
        lat: 40.7829,
        lng: -73.9654,
        address: '456 Park Ave',
        city: 'New York',
        country: 'USA',
      },
      images: ['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800'],
      bedrooms: 1,
      bathrooms: 1,
      guests: 2,
      rating: 4.6,
      reviewCount: 89,
      amenities: ['WiFi', 'AC', 'TV'],
      hostName: 'Jane Smith',
      hostAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
      propertyType: 'studio',
      available: true,
    },
    {
      id: '3',
      title: 'Luxury Villa with Pool',
      description: 'Stunning villa with private pool and garden',
      price: 450,
      currency: '$',
      location: {
        lat: 40.7489,
        lng: -73.9680,
        address: '789 Madison Ave',
        city: 'New York',
        country: 'USA',
      },
      images: ['https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800'],
      bedrooms: 4,
      bathrooms: 3,
      guests: 8,
      rating: 4.9,
      reviewCount: 203,
      amenities: ['WiFi', 'Pool', 'Kitchen', 'Garden', 'Parking'],
      hostName: 'Mike Johnson',
      hostAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
      propertyType: 'villa',
      available: true,
    },
  ];

  const dropdownOptions = [
    { label: 'Option 1', value: '1', icon: <Home className="h-4 w-4" /> },
    { label: 'Option 2', value: '2', icon: <Settings className="h-4 w-4" /> },
    { label: 'Option 3', value: '3', icon: <Users className="h-4 w-4" /> },
  ];

  const gridData = [
    { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Admin' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'User' },
    { id: 3, name: 'Bob Johnson', email: 'bob@example.com', role: 'Editor' },
    { id: 4, name: 'Alice Williams', email: 'alice@example.com', role: 'User' },
    { id: 5, name: 'Charlie Brown', email: 'charlie@example.com', role: 'Admin' },
  ];

  const gridColumns = [
    { key: 'id', title: 'ID', width: '80px', sortable: true },
    { key: 'name', title: 'Name', sortable: true },
    { key: 'email', title: 'Email', sortable: true },
    { key: 'role', title: 'Role' },
  ];

  const menuItems = [
    {
      label: 'Dashboard',
      value: 'dashboard',
      icon: <Home className="h-4 w-4" />,
      onClick: () => toast.info('Dashboard clicked'),
    },
    {
      label: 'Settings',
      value: 'settings',
      icon: <Settings className="h-4 w-4" />,
      children: [
        { label: 'General', value: 'general', onClick: () => toast.info('General clicked') },
        { label: 'Security', value: 'security', onClick: () => toast.info('Security clicked') },
      ],
    },
    {
      label: 'Users',
      value: 'users',
      icon: <Users className="h-4 w-4" />,
      onClick: () => toast.info('Users clicked'),
    },
  ];

  const formFields = [
    {
      fieldType: 'input' as const,
      name: 'username',
      label: 'Username',
      placeholder: 'Enter username',
      required: true,
      validation: { required: true, minLength: 3 },
    },
    {
      fieldType: 'input' as const,
      name: 'email',
      label: 'Email',
      type: 'email',
      placeholder: 'Enter email',
      required: true,
      validation: { required: true },
    },
    {
      fieldType: 'select' as const,
      name: 'role',
      label: 'Role',
      options: dropdownOptions,
      required: true,
      validation: { required: true },
    },
    {
      fieldType: 'textarea' as const,
      name: 'bio',
      label: 'Bio',
      placeholder: 'Tell us about yourself',
    },
  ];

  return (
    <div className="space-y-12">
      <div>
        <h2 className="text-2xl font-heading font-semibold mb-6">{t('demo.title')}</h2>
        <p className="text-muted-foreground mb-8">
          {t('demo.description')}
        </p>
      </div>

      {/* Dynamic Filter Link */}
      <section className="p-6 bg-gradient-to-r from-primary/10 to-primary/5 rounded-xl border border-primary/20">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/20 rounded-lg">
              <Filter className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-heading font-semibold">{t('demo.sections.dynamicFilter', 'Dynamic Filter')}</h3>
              <p className="text-sm text-muted-foreground">
                {t('demo.filterTeaser', 'Advanced filtering with multiple types: text, number, select, range, date, and more.')}
              </p>
            </div>
          </div>
          <Link to="/demo/filters">
            <Button variant="default" className="gap-2">
              {t('demo.viewFilterDemo', 'View Filter Demo')}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Inputs Section */}
      <section className="space-y-4">
        <h3 className="text-xl font-heading font-semibold">{t('demo.sections.input')}</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <DynamicInput
            type="text"
            placeholder={t('demo.actions.standardInput')}
            value={inputValue}
            onChange={setInputValue}
          />
          <DynamicInput
            type="email"
            placeholder={t('demo.actions.styledInput')}
            value={inputValue}
            onChange={setInputValue}
            backgroundColor="hsl(var(--muted))"
            borderColor="hsl(var(--primary))"
            borderWidth="2px"
          />
        </div>
      </section>

      {/* Buttons Section */}
      <section className="space-y-4">
        <h3 className="text-xl font-heading font-semibold">{t('demo.sections.buttons')}</h3>
        <div className="flex flex-wrap gap-4">
          <DynamicButton variant="primary" onClick={() => toast.success('Primary clicked')}>
            {t('demo.actions.primary')}
          </DynamicButton>
          <DynamicButton variant="secondary" onClick={() => toast.info('Secondary clicked')}>
            {t('demo.actions.secondary')}
          </DynamicButton>
          <DynamicButton variant="outline" icon={<FileText className="h-4 w-4" />}>
            {t('demo.actions.withIcon')}
          </DynamicButton>
          <DynamicButton variant="destructive" size="lg">
            {t('demo.actions.largeDestructive')}
          </DynamicButton>
          <DynamicButton variant="ghost" disabled>
            {t('demo.actions.disabled')}
          </DynamicButton>
        </div>
      </section>

      {/* Dropdowns Section */}
      <section className="space-y-4">
        <h3 className="text-xl font-heading font-semibold">{t('demo.sections.dropdowns')}</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <p className="text-sm mb-2 text-muted-foreground">{t('demo.actions.singleSelect')}</p>
            <DynamicDropdown
              options={dropdownOptions}
              value={dropdownValue}
              onChange={setDropdownValue}
              placeholder={t('demo.actions.selectOption')}
            />
          </div>
          <div>
            <p className="text-sm mb-2 text-muted-foreground">{t('demo.actions.multiSelect')}</p>
            <DynamicDropdown
              options={dropdownOptions}
              value={multiSelectValues}
              onChange={setMultiSelectValues}
              multiSelect
              placeholder={t('demo.actions.selectMultiple')}
            />
          </div>
        </div>
      </section>

      {/* Grid Section */}
      <section className="space-y-4">
        <h3 className="text-xl font-heading font-semibold">{t('demo.sections.grid')}</h3>
        <DynamicGrid
          columns={gridColumns}
          data={gridData}
          striped
          hoverable
          onRowClick={(row) => toast.info(`Clicked: ${row.name}`)}
        />
      </section>

      {/* File Uploader Section */}
      <section className="space-y-4">
        <h3 className="text-xl font-heading font-semibold">{t('demo.sections.fileUploader')}</h3>
        <DynamicFileUploader
          multiple
          maxSize={5}
          accept="image/*"
          onUpload={async (files) => {
            toast.success(`Uploaded ${files.length} file(s)`);
          }}
        />
      </section>

      {/* Image Section */}
      <section className="space-y-4">
        <h3 className="text-xl font-heading font-semibold">{t('demo.sections.image')}</h3>
        <DynamicImage
          src="https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800"
          alt="Workspace"
          width="100%"
          height="300px"
          borderRadius="12px"
        />
      </section>

      {/* SubMenu Section */}
      <section className="space-y-4">
        <h3 className="text-xl font-heading font-semibold">{t('demo.sections.submenu')}</h3>
        <DynamicSubMenu items={menuItems} collapsible />
      </section>

      {/* Dynamic Form Section */}
      <section className="space-y-4">
        <h3 className="text-xl font-heading font-semibold">{t('demo.sections.form')}</h3>
        <DynamicForm
          fields={formFields}
          layout="grid"
          columns={2}
          onSubmit={async (values) => {
            console.log('Form values:', values);
            toast.success('Form submitted successfully!');
          }}
          onCancel={() => toast.info('Form cancelled')}
        />
      </section>

      {/* Map Search Section */}
      <section className="space-y-4">
        <h3 className="text-xl font-heading font-semibold">{t('demo.sections.map')}</h3>
        <div className="h-[600px] rounded-lg overflow-hidden">
          <MapSearch
            properties={sampleProperties}
            onPropertySelect={(property) => toast.info(`Selected: ${property.title}`)}
          />
        </div>
      </section>

      {/* Event Calendar Section */}
      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/20 rounded-lg">
            <Calendar className="h-5 w-5 text-primary" />
          </div>
          <h3 className="text-xl font-heading font-semibold">{t('demo.sections.calendar', 'Event Calendar')}</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          {t('demo.calendarDescription', 'Full-featured event calendar with booking, filtering, and drag-drop support.')}
        </p>
        <div className="border border-border rounded-lg overflow-hidden">
          <DynamicEventCalendar
            events={sampleEvents}
            initialView="week"
            showFilters={true}
            showBookingPanel={true}
            onEventClick={(event) => {
              setSelectedEventForBooking(event);
              setBookingModalOpen(true);
            }}
            onDateClick={(date) => toast.info(`Clicked: ${date.toLocaleDateString()}`)}
          />
        </div>
      </section>

      {/* Booking Modal Section */}
      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/20 rounded-lg">
            <Ticket className="h-5 w-5 text-primary" />
          </div>
          <h3 className="text-xl font-heading font-semibold">{t('demo.sections.booking', 'Booking Modal')}</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          {t('demo.bookingDescription', 'Event booking modal with quantity selection, notes, and price calculation.')}
        </p>
        <div className="flex gap-4">
          <Button
            onClick={() => {
              setSelectedEventForBooking(sampleEvents[1]); // Use the paid event
              setBookingModalOpen(true);
            }}
          >
            <Ticket className="h-4 w-4 mr-2" />
            {t('demo.openBookingModal', 'Open Booking Modal')}
          </Button>
        </div>
        <BookingModal
          event={selectedEventForBooking}
          open={bookingModalOpen}
          onOpenChange={setBookingModalOpen}
          onBook={handleBookEvent}
        />
      </section>

      {/* Image Cropper Section */}
      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/20 rounded-lg">
            <ImageIcon className="h-5 w-5 text-primary" />
          </div>
          <h3 className="text-xl font-heading font-semibold">{t('demo.sections.imageCropper', 'Image Cropper')}</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          {t('demo.imageCropperDescription', 'Interactive image cropper with rotation, zoom, and flip controls.')}
        </p>
        <div className="flex flex-col gap-4">
          <Button onClick={() => setCropperOpen(true)}>
            <ImageIcon className="h-4 w-4 mr-2" />
            {t('demo.openImageCropper', 'Open Image Cropper')}
          </Button>
          {croppedImage && (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">{t('demo.croppedResult', 'Cropped Result:')}</p>
              <img
                src={croppedImage}
                alt="Cropped result"
                className="max-w-xs rounded-lg border border-border"
              />
            </div>
          )}
        </div>
        <DynamicImageCropper
          imageSrc="https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800"
          open={cropperOpen}
          onOpenChange={setCropperOpen}
          onCropComplete={handleCropComplete}
          aspectRatio={16 / 9}
        />
      </section>
    </div>
  );
};
