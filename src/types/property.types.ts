export interface Property {
  id: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  location: {
    lat: number;
    lng: number;
    address: string;
    city: string;
    country: string;
  };
  images: string[];
  bedrooms: number;
  bathrooms: number;
  guests: number;
  rating?: number;
  reviewCount?: number;
  amenities: string[];
  hostName: string;
  hostAvatar?: string;
  propertyType: 'apartment' | 'house' | 'villa' | 'studio' | 'condo';
  available: boolean;
}

export interface MapSearchFilters {
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  guests?: number;
  propertyType?: string[];
  amenities?: string[];
}
