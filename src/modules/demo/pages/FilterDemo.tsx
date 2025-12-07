import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DynamicFilter, FilterConfig, ActiveFilter } from '@/modules/shared/components/DynamicFilter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { MapSearch } from '@/modules/shared/components/MapSearch';
import { Property } from '@/types/property.types';
import {
  DollarSign,
  Bed,
  MapPin,
  Calendar,
  Home,
  Users,
  Star,
  Wifi,
  Bath,
  Car
} from 'lucide-react';

// Fake property data for demo
const fakeProperties: Property[] = [
  {
    id: '1',
    title: 'Luxury Manhattan Apartment',
    description: 'Beautiful modern apartment in the heart of Manhattan with stunning city views. Perfect for business travelers or couples looking for a romantic getaway.',
    price: 250,
    currency: '$',
    location: {
      lat: 40.7580,
      lng: -73.9855,
      address: '123 Times Square',
      city: 'New York',
      country: 'USA'
    },
    images: [
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800',
      'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800',
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800'
    ],
    bedrooms: 2,
    bathrooms: 2,
    guests: 4,
    rating: 4.9,
    reviewCount: 128,
    amenities: ['WiFi', 'Kitchen', 'Air Conditioning', 'Washer', 'TV', 'Workspace'],
    hostName: 'Sarah Johnson',
    hostAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    propertyType: 'apartment',
    available: true
  },
  {
    id: '2',
    title: 'Cozy Brooklyn Studio',
    description: 'Charming studio in trendy Brooklyn neighborhood. Walking distance to restaurants, bars, and public transport.',
    price: 120,
    currency: '$',
    location: {
      lat: 40.6782,
      lng: -73.9442,
      address: '456 Bedford Ave',
      city: 'Brooklyn',
      country: 'USA'
    },
    images: [
      'https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=800',
      'https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=800'
    ],
    bedrooms: 1,
    bathrooms: 1,
    guests: 2,
    rating: 4.7,
    reviewCount: 85,
    amenities: ['WiFi', 'Kitchen', 'Washer'],
    hostName: 'Mike Chen',
    hostAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    propertyType: 'studio',
    available: true
  },
  {
    id: '3',
    title: 'Central Park View Condo',
    description: 'Stunning condo with direct views of Central Park. Luxury amenities and 24/7 doorman service.',
    price: 450,
    currency: '$',
    location: {
      lat: 40.7829,
      lng: -73.9654,
      address: '789 Central Park West',
      city: 'New York',
      country: 'USA'
    },
    images: [
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800',
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800'
    ],
    bedrooms: 3,
    bathrooms: 2,
    guests: 6,
    rating: 4.95,
    reviewCount: 203,
    amenities: ['WiFi', 'Kitchen', 'Air Conditioning', 'Pool', 'Gym', 'Washer', 'TV', 'Workspace', 'Doorman'],
    hostName: 'Emily Davis',
    hostAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
    propertyType: 'condo',
    available: true
  },
  {
    id: '4',
    title: 'SoHo Loft Experience',
    description: 'Authentic NYC loft in the heart of SoHo. High ceilings, exposed brick, and designer furniture.',
    price: 320,
    currency: '$',
    location: {
      lat: 40.7233,
      lng: -74.0020,
      address: '321 Spring Street',
      city: 'New York',
      country: 'USA'
    },
    images: [
      'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800',
      'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800'
    ],
    bedrooms: 2,
    bathrooms: 1,
    guests: 4,
    rating: 4.8,
    reviewCount: 156,
    amenities: ['WiFi', 'Kitchen', 'Air Conditioning', 'Washer', 'TV'],
    hostName: 'David Park',
    hostAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
    propertyType: 'apartment',
    available: true
  },
  {
    id: '5',
    title: 'Williamsburg Modern House',
    description: 'Entire modern house in Williamsburg with private backyard. Perfect for families or groups.',
    price: 380,
    currency: '$',
    location: {
      lat: 40.7081,
      lng: -73.9571,
      address: '567 N 6th Street',
      city: 'Brooklyn',
      country: 'USA'
    },
    images: [
      'https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?w=800',
      'https://images.unsplash.com/photo-1600573472550-8090b5e0745e?w=800',
      'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=800'
    ],
    bedrooms: 4,
    bathrooms: 3,
    guests: 8,
    rating: 4.85,
    reviewCount: 92,
    amenities: ['WiFi', 'Kitchen', 'Air Conditioning', 'Washer', 'TV', 'Workspace', 'Parking', 'Backyard'],
    hostName: 'Lisa Thompson',
    hostAvatar: 'https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=150',
    propertyType: 'house',
    available: true
  },
  {
    id: '6',
    title: 'Chelsea Art District Studio',
    description: 'Artistic studio in Chelsea gallery district. Surrounded by world-class art and dining.',
    price: 175,
    currency: '$',
    location: {
      lat: 40.7465,
      lng: -74.0014,
      address: '234 W 22nd Street',
      city: 'New York',
      country: 'USA'
    },
    images: [
      'https://images.unsplash.com/photo-1600210492493-0946911123ea?w=800',
      'https://images.unsplash.com/photo-1600607687644-aac4c3eac7f4?w=800'
    ],
    bedrooms: 1,
    bathrooms: 1,
    guests: 2,
    rating: 4.6,
    reviewCount: 67,
    amenities: ['WiFi', 'Kitchen', 'Air Conditioning', 'TV'],
    hostName: 'Alex Rivera',
    hostAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    propertyType: 'studio',
    available: true
  }
];

export const FilterDemo = () => {
  const { t } = useTranslation();
  const [appliedFilters, setAppliedFilters] = useState < ActiveFilter[] > ([]);

  // Sample filter configurations for property search
  const propertyFilters: FilterConfig[] = [
    {
      id: 'price',
      name: t('property.price', 'Price Range'),
      icon: DollarSign,
      type: 'range',
      min: 0,
      max: 1000,
      step: 10,
      defaultValue: [100, 500],
    },
    {
      id: 'bedrooms',
      name: t('property.bedrooms', 'Bedrooms'),
      icon: Bed,
      type: 'select',
      placeholder: t('dynamicFilter.selectBedrooms', 'Select bedrooms'),
      options: [
        { label: '1 Bedroom', value: '1' },
        { label: '2 Bedrooms', value: '2' },
        { label: '3 Bedrooms', value: '3' },
        { label: '4+ Bedrooms', value: '4+' },
      ],
    },
    {
      id: 'bathrooms',
      name: t('property.bathrooms', 'Bathrooms'),
      icon: Bath,
      type: 'select',
      placeholder: t('dynamicFilter.selectBathrooms', 'Select bathrooms'),
      options: [
        { label: '1 Bathroom', value: '1' },
        { label: '2 Bathrooms', value: '2' },
        { label: '3+ Bathrooms', value: '3+' },
      ],
    },
    {
      id: 'location',
      name: t('property.location', 'Location'),
      icon: MapPin,
      type: 'text',
      placeholder: t('dynamicFilter.enterLocation', 'Enter city or neighborhood'),
    },
    {
      id: 'dates',
      name: t('dynamicFilter.dateRange', 'Check-in / Check-out'),
      icon: Calendar,
      type: 'daterange',
    },
    {
      id: 'propertyType',
      name: t('dynamicFilter.propertyType', 'Property Type'),
      icon: Home,
      type: 'multiselect',
      options: [
        { label: 'Apartment', value: 'apartment' },
        { label: 'House', value: 'house' },
        { label: 'Villa', value: 'villa' },
        { label: 'Studio', value: 'studio' },
        { label: 'Cabin', value: 'cabin' },
      ],
    },
    {
      id: 'guests',
      name: t('dynamicFilter.guests', 'Guests'),
      icon: Users,
      type: 'number',
      placeholder: t('dynamicFilter.numberOfGuests', 'Number of guests'),
      min: 1,
      max: 16,
    },
    {
      id: 'rating',
      name: t('dynamicFilter.minRating', 'Minimum Rating'),
      icon: Star,
      type: 'select',
      options: [
        { label: '4.5+ Stars', value: '4.5' },
        { label: '4+ Stars', value: '4' },
        { label: '3.5+ Stars', value: '3.5' },
        { label: 'Any Rating', value: '0' },
      ],
    },
    {
      id: 'amenities',
      name: t('dynamicFilter.amenities', 'Amenities'),
      icon: Wifi,
      type: 'multiselect',
      options: [
        { label: 'WiFi', value: 'wifi' },
        { label: 'Kitchen', value: 'kitchen' },
        { label: 'Air Conditioning', value: 'ac' },
        { label: 'Pool', value: 'pool' },
        { label: 'Gym', value: 'gym' },
        { label: 'Washer', value: 'washer' },
        { label: 'TV', value: 'tv' },
        { label: 'Workspace', value: 'workspace' },
      ],
    },
    {
      id: 'parking',
      name: t('dynamicFilter.parking', 'Free Parking'),
      icon: Car,
      type: 'boolean',
    },
  ];

  const handleFiltersChange = (filters: ActiveFilter[]) => {
    // setAppliedFilters(filters);
  };

  const handleFilterApply = (filter: ActiveFilter) => {
    toast.success(t('dynamicFilter.filterApplied', 'Filter applied: {{name}}', { name: filter.config.name }));
  };

  const handleFilterRemove = (filterId: string) => {
    toast.info(t('dynamicFilter.filterRemoved', 'Filter removed'));
  };

  const handleFilterCancel = (filterId: string) => {
    // Silent cancel - no toast needed
  };

  const formatFilterValue = (filter: ActiveFilter): string => {
    if (!filter.value) return 'Not set';

    switch (filter.config.type) {
      case 'range':
        return `$${filter.value[0]} - $${filter.value[1]}`;
      case 'multiselect':
        return filter.value.join(', ');
      case 'daterange':
        const from = filter.value.from ? new Date(filter.value.from).toLocaleDateString() : '...';
        const to = filter.value.to ? new Date(filter.value.to).toLocaleDateString() : '...';
        return `${from} → ${to}`;
      case 'boolean':
        return filter.value ? 'Yes' : 'No';
      default:
        return String(filter.value);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-heading font-semibold mb-2">
          {t('demo.sections.dynamicFilter', 'Dynamic Filter Demo')}
        </h2>
        <p className="text-muted-foreground">
          {t('demo.filterDescription', 'A fully dynamic and parameterized filter component for property search with multiple filter types.')}
        </p>
      </div>

      {/* Filter Component */}
      <Card>
        <CardHeader>
          <CardTitle>{t('dynamicFilter.propertySearch', 'Property Search Filters')}</CardTitle>
          <CardDescription>
            {t('dynamicFilter.clickToAdd', 'Click "Add Filter" to select filters. Configure values and click Search to apply.')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DynamicFilter
            filters={propertyFilters}
            onFiltersChange={handleFiltersChange}
            onFilterApply={handleFilterApply}
            onFilterRemove={handleFilterRemove}
            onFilterCancel={handleFilterCancel}
            buttonLabel={t('dynamicFilter.addFilter', 'Add Filter')}
            searchButtonLabel={t('dynamicFilter.search', 'Search')}
            cancelButtonLabel={t('dynamicFilter.cancel', 'Cancel')}
          />
        </CardContent>
      </Card>

      {/* Applied Filters Display */}
      <Card>
        <CardHeader>
          <CardTitle>{t('dynamicFilter.appliedFilters', 'Applied Filters')}</CardTitle>
          <CardDescription>
            {t('dynamicFilter.currentFilters', 'Currently active filters and their values')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {appliedFilters.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              {t('dynamicFilter.noFilters', 'No filters applied. Add filters using the button above.')}
            </p>
          ) : (
            <div className="space-y-3">
              {appliedFilters.map((filter) => (
                <div
                  key={filter.id}
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <filter.config.icon className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{filter.config.name}</span>
                  </div>
                  <Badge variant="secondary">
                    {formatFilterValue(filter)}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Filter Types Documentation */}
      <Card>
        <CardHeader>
          <CardTitle>{t('dynamicFilter.supportedTypes', 'Supported Filter Types')}</CardTitle>
          <CardDescription>
            {t('dynamicFilter.typesDescription', 'The DynamicFilter component supports multiple filter types')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { type: 'text', desc: t('dynamicFilter.types.text', 'Free text input') },
              { type: 'number', desc: t('dynamicFilter.types.number', 'Numeric input with min/max') },
              { type: 'select', desc: t('dynamicFilter.types.select', 'Single option dropdown') },
              { type: 'multiselect', desc: t('dynamicFilter.types.multiselect', 'Multiple selection checkboxes') },
              { type: 'range', desc: t('dynamicFilter.types.range', 'Dual slider for ranges') },
              { type: 'date', desc: t('dynamicFilter.types.date', 'Single date picker') },
              { type: 'daterange', desc: t('dynamicFilter.types.daterange', 'From/To date pickers') },
              { type: 'boolean', desc: t('dynamicFilter.types.boolean', 'Yes/No checkbox') },
            ].map((item) => (
              <div key={item.type} className="p-3 border border-border rounded-lg">
                <Badge variant="outline" className="mb-2">{item.type}</Badge>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Map Section with Properties */}
      <Card>
        <CardHeader>
          <CardTitle>{t('demo.mapWithProperties', 'Map with Property Listings')}</CardTitle>
          <CardDescription>
            {t('demo.mapDescription', 'Interactive map showing property listings with search and filter capabilities')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <MapSearch
            properties={fakeProperties}
            center={[-73.9855, 40.7580]}
            zoom={12}
            onPropertySelect={(property) => {
              toast.info(t('demo.propertySelected', 'Selected: {{title}}', { title: property.title }));
            }}
            className="h-[500px]"
          />
        </CardContent>
      </Card>

      {/* Code Example */}
      <Card>
        <CardHeader>
          <CardTitle>{t('dynamicFilter.usage', 'Usage Example')}</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
            <code>{`import { DynamicFilter, FilterConfig } from '@/modules/shared/components/DynamicFilter';
import { DollarSign, Bed, MapPin } from 'lucide-react';

const filters: FilterConfig[] = [
  {
    id: 'price',
    name: 'Price Range',
    icon: DollarSign,
    type: 'range',
    min: 0,
    max: 1000,
  },
  {
    id: 'bedrooms',
    name: 'Bedrooms',
    icon: Bed,
    type: 'select',
    options: [
      { label: '1 Bedroom', value: '1' },
      { label: '2 Bedrooms', value: '2' },
    ],
  },
];

<DynamicFilter
  filters={filters}
  onFiltersChange={(activeFilters) => console.log(activeFilters)}
  onFilterApply={(filter) => console.log('Applied:', filter)}
  onFilterRemove={(filterId) => console.log('Removed:', filterId)}
/>`}</code>
          </pre>
        </CardContent>
      </Card>
    </div>
  );
};

export default FilterDemo;
