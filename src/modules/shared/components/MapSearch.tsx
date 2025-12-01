import React, { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { Property, MapSearchFilters } from '@/types/property.types';
import { PropertyCard } from './PropertyCard';
import { DynamicModal } from './DynamicModal';
import { DynamicButton } from './DynamicButton';
import { DynamicInput } from './DynamicInput';
import { Search, SlidersHorizontal } from 'lucide-react';
import ReactDOM from 'react-dom/client';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface MapSearchProps {
  properties: Property[];
  center?: [number, number];
  zoom?: number;
  onPropertySelect?: (property: Property) => void;
  className?: string;
}

export const MapSearch: React.FC<MapSearchProps> = ({
  properties,
  center = [-74.006, 40.7128],
  zoom = 12,
  onPropertySelect,
  className = '',
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const markers = useRef<maplibregl.Marker[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<MapSearchFilters>({});
  const [showFilters, setShowFilters] = useState(false);

  const handleSearch = async () => {
    if (!searchQuery || !map.current) return;

    try {
      // Using Nominatim (OpenStreetMap) geocoding service
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1`
      );
      const data = await response.json();

      if (data && data.length > 0) {
        const { lon, lat } = data[0];
        map.current.flyTo({
          center: [parseFloat(lon), parseFloat(lat)],
          zoom: 13,
          duration: 2000,
        });
      }
    } catch (error) {
      console.error('Search error:', error);
    }
  };

  useEffect(() => {
    if (!mapContainer.current) return;
    
    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: 'https://tiles.openfreemap.org/styles/liberty',
      center: center,
      zoom: zoom,
    });

    map.current.addControl(
      new maplibregl.NavigationControl({
        visualizePitch: true,
      }),
      'top-right'
    );

    return () => {
      markers.current.forEach(marker => marker.remove());
      map.current?.remove();
    };
  }, [center, zoom]);

  useEffect(() => {
    if (!map.current) return;

    // Remove existing markers
    markers.current.forEach(marker => marker.remove());
    markers.current = [];

    // Filter properties based on filters
    const filteredProperties = properties.filter(property => {
      if (filters?.minPrice && property.price < filters.minPrice) return false;
      if (filters?.maxPrice && property.price > filters.maxPrice) return false;
      if (filters?.bedrooms && property.bedrooms < filters.bedrooms) return false;
      if (filters?.guests && property.guests < filters.guests) return false;
      if (filters?.propertyType && filters.propertyType.length > 0) {
        if (!filters.propertyType.includes(property.propertyType)) return false;
      }
      return true;
    });

    // Add markers for filtered properties
    filteredProperties.forEach(property => {
      // Create popup element
      const popupContainer = document.createElement('div');
      popupContainer.className = 'property-popup';
      
      const root = ReactDOM.createRoot(popupContainer);
      root.render(
        <div className="w-64">
          <PropertyCard 
            property={property} 
            compact={true}
            onSelect={(prop) => {
              setSelectedProperty(prop);
              setShowModal(true);
              if (onPropertySelect) {
                onPropertySelect(prop);
              }
            }}
          />
        </div>
      );

      // Create custom marker element
      const markerEl = document.createElement('div');
      markerEl.className = 'custom-marker';
      markerEl.innerHTML = `
        <div class="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground shadow-custom hover:scale-110 transition-base cursor-pointer">
          <span class="text-xs font-bold">${property.currency}${property.price}</span>
        </div>
      `;

      const marker = new maplibregl.Marker(markerEl)
        .setLngLat([property.location.lng, property.location.lat])
        .setPopup(
          new maplibregl.Popup({ 
            offset: 25,
            className: 'property-map-popup'
          })
          .setDOMContent(popupContainer)
        )
        .addTo(map.current!);

      markers.current.push(marker);
    });

    // Fit bounds to show all markers
    if (filteredProperties.length > 0) {
      const bounds = new maplibregl.LngLatBounds();
      filteredProperties.forEach(property => {
        bounds.extend([property.location.lng, property.location.lat]);
      });
      map.current.fitBounds(bounds, { padding: 50, maxZoom: 15 });
    }
  }, [properties, filters, onPropertySelect]);

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedProperty(null);
  };

  return (
    <>
      <div className="space-y-4">
        {/* Search and Filters Bar */}
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search location (e.g., New York, Manhattan, etc.)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="pl-10"
            />
          </div>
          <DynamicButton
            variant="primary"
            onClick={handleSearch}
            disabled={!searchQuery}
          >
            Search
          </DynamicButton>
          <DynamicButton
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
          >
            <SlidersHorizontal className="h-4 w-4" />
          </DynamicButton>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="p-4 bg-card rounded-lg border border-border space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label className="text-sm mb-2 block">Min Price</Label>
                <Input
                  type="number"
                  placeholder="Min"
                  value={filters.minPrice || ''}
                  onChange={(e) =>
                    setFilters({ ...filters, minPrice: Number(e.target.value) || undefined })
                  }
                />
              </div>
              <div>
                <Label className="text-sm mb-2 block">Max Price</Label>
                <Input
                  type="number"
                  placeholder="Max"
                  value={filters.maxPrice || ''}
                  onChange={(e) =>
                    setFilters({ ...filters, maxPrice: Number(e.target.value) || undefined })
                  }
                />
              </div>
              <div>
                <Label className="text-sm mb-2 block">Bedrooms</Label>
                <Select
                  value={filters.bedrooms?.toString() || ''}
                  onValueChange={(value) =>
                    setFilters({ ...filters, bedrooms: value ? Number(value) : undefined })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Any" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Any</SelectItem>
                    <SelectItem value="1">1+</SelectItem>
                    <SelectItem value="2">2+</SelectItem>
                    <SelectItem value="3">3+</SelectItem>
                    <SelectItem value="4">4+</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-sm mb-2 block">Guests</Label>
                <Select
                  value={filters.guests?.toString() || ''}
                  onValueChange={(value) =>
                    setFilters({ ...filters, guests: value ? Number(value) : undefined })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Any" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Any</SelectItem>
                    <SelectItem value="1">1+</SelectItem>
                    <SelectItem value="2">2+</SelectItem>
                    <SelectItem value="4">4+</SelectItem>
                    <SelectItem value="6">6+</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )}

        {/* Map Container */}
        <div ref={mapContainer} className={`w-full h-full rounded-lg ${className}`} />
      </div>
      
      {selectedProperty && (
        <DynamicModal
          open={showModal}
          onOpenChange={setShowModal}
          size="lg"
          title={selectedProperty.title}
          description={`${selectedProperty.location.address}, ${selectedProperty.location.city}`}
          footer={
            <div className="flex gap-3 w-full">
              <DynamicButton
                variant="outline"
                onClick={handleCloseModal}
                styleClass="flex-1"
              >
                Close
              </DynamicButton>
              <DynamicButton
                variant="primary"
                onClick={() => {
                  // Handle booking action
                  console.log('Book property:', selectedProperty.id);
                }}
                styleClass="flex-1"
              >
                Book Now - {selectedProperty.currency}{selectedProperty.price}/night
              </DynamicButton>
            </div>
          }
        >
          <div className="space-y-6">
            {/* Image Gallery */}
            <div className="grid grid-cols-2 gap-2">
              {selectedProperty.images.slice(0, 4).map((image, idx) => (
                <img
                  key={idx}
                  src={image}
                  alt={`${selectedProperty.title} - ${idx + 1}`}
                  className={`rounded-lg object-cover ${
                    idx === 0 ? 'col-span-2 h-64' : 'h-32'
                  }`}
                />
              ))}
            </div>

            {/* Property Details */}
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-foreground mb-2">Description</h4>
                <p className="text-muted-foreground text-sm">{selectedProperty.description}</p>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Guests</p>
                  <p className="font-semibold text-foreground">{selectedProperty.guests}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Bedrooms</p>
                  <p className="font-semibold text-foreground">{selectedProperty.bedrooms}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Bathrooms</p>
                  <p className="font-semibold text-foreground">{selectedProperty.bathrooms}</p>
                </div>
              </div>

              {selectedProperty.amenities.length > 0 && (
                <div>
                  <h4 className="font-semibold text-foreground mb-2">Amenities</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedProperty.amenities.map((amenity, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-muted text-muted-foreground text-xs rounded-full"
                      >
                        {amenity}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <h4 className="font-semibold text-foreground mb-2">Host</h4>
                <div className="flex items-center gap-3">
                  {selectedProperty.hostAvatar && (
                    <img
                      src={selectedProperty.hostAvatar}
                      alt={selectedProperty.hostName}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  )}
                  <div>
                    <p className="font-medium text-foreground">{selectedProperty.hostName}</p>
                    {selectedProperty.rating && (
                      <p className="text-sm text-muted-foreground">
                        ⭐ {selectedProperty.rating} ({selectedProperty.reviewCount} reviews)
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </DynamicModal>
      )}

      <style>{`
        .maplibregl-popup-content {
          padding: 12px !important;
          border-radius: 0.75rem !important;
          box-shadow: var(--shadow-lg) !important;
          background: hsl(var(--card)) !important;
        }
        .maplibregl-popup-close-button {
          display: none;
        }
        .custom-marker {
          cursor: pointer;
        }
      `}</style>
    </>
  );
};
