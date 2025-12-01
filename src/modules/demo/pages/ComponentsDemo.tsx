import React, { useState } from 'react';
import { DynamicInput } from '@/modules/shared/components/DynamicInput';
import { DynamicButton } from '@/modules/shared/components/DynamicButton';
import { DynamicDropdown } from '@/modules/shared/components/DynamicDropdown';
import { DynamicGrid } from '@/modules/shared/components/DynamicGrid';
import { DynamicFileUploader } from '@/modules/shared/components/DynamicFileUploader';
import { DynamicImage } from '@/modules/shared/components/DynamicImage';
import { DynamicSubMenu } from '@/modules/shared/components/DynamicSubMenu';
import { DynamicForm } from '@/modules/shared/components/DynamicForm';
import { MapSearch } from '@/modules/shared/components/MapSearch';
import { Home, Settings, Users, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import type { Property } from '@/types/property.types';

export const ComponentsDemo = () => {
  const { t } = useTranslation();
  const [inputValue, setInputValue] = useState('');
  const [dropdownValue, setDropdownValue] = useState('');
  const [multiSelectValues, setMultiSelectValues] = useState<(string | number)[]>([]);

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
    </div>
  );
};
