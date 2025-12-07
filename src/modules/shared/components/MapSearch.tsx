import React, { useEffect, useRef, useState, useCallback } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { Property, MapSearchFilters } from '@/types/property.types';
import { PropertyCard } from './PropertyCard';
import { DynamicModal } from './DynamicModal';
import { DynamicButton } from './DynamicButton';
import { DynamicInput } from './DynamicInput';
import { Search, SlidersHorizontal, Locate, X } from 'lucide-react';
import ReactDOM from 'react-dom/client';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

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
  const popups = useRef<maplibregl.Popup[]>([]);
  const hoverPopups = useRef<maplibregl.Popup[]>([]);
  const userMarker = useRef<maplibregl.Marker | null>(null);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<MapSearchFilters>({});
  const [showFilters, setShowFilters] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [activePopup, setActivePopup] = useState<maplibregl.Popup | null>(null);
  const activePopupRef = useRef<maplibregl.Popup | null>(null);

  const handleSearch = async () => {
    if (!searchQuery || !map.current) return;

    try {
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

  const handleGeolocation = useCallback(() => {
    if (!map.current) return;

    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      return;
    }

    setIsLocating(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;

        // Remove existing user marker
        if (userMarker.current) {
          userMarker.current.remove();
        }

        // Create user location marker
        const userMarkerEl = document.createElement('div');
        userMarkerEl.className = 'user-location-marker';
        userMarkerEl.innerHTML = `
          <div class="relative">
            <div class="w-5 h-5 bg-blue-500 rounded-full border-3 border-white shadow-lg animate-pulse"></div>
            <div class="absolute inset-0 w-5 h-5 bg-blue-500 rounded-full animate-ping opacity-50"></div>
          </div>
        `;

        userMarker.current = new maplibregl.Marker(userMarkerEl)
          .setLngLat([longitude, latitude])
          .addTo(map.current!);

        map.current!.flyTo({
          center: [longitude, latitude],
          zoom: 14,
          duration: 2000,
        });

        setIsLocating(false);
        toast.success('Centered on your location');
      },
      (error) => {
        setIsLocating(false);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            toast.error('Location permission denied');
            break;
          case error.POSITION_UNAVAILABLE:
            toast.error('Location information unavailable');
            break;
          case error.TIMEOUT:
            toast.error('Location request timed out');
            break;
          default:
            toast.error('An error occurred while getting location');
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  }, []);

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

    // Close active popup when clicking on the map
    map.current.on('click', (e) => {
      // Check if click was on a marker
      const target = e.originalEvent.target as HTMLElement;
      if (!target.closest('.custom-marker') && !target.closest('.maplibregl-popup')) {
        if (activePopupRef.current) {
          activePopupRef.current.remove();
          activePopupRef.current = null;
          setActivePopup(null);
        }
      }
    });

    return () => {
      markers.current.forEach(marker => marker.remove());
      popups.current.forEach(popup => popup.remove());
      hoverPopups.current.forEach(popup => popup.remove());
      userMarker.current?.remove();
      map.current?.remove();
    };
  }, [center, zoom]);

  useEffect(() => {
    if (!map.current) return;

    // Remove existing markers and popups
    markers.current.forEach(marker => marker.remove());
    popups.current.forEach(popup => popup.remove());
    hoverPopups.current.forEach(popup => popup.remove());
    markers.current = [];
    popups.current = [];
    hoverPopups.current = [];

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
      popupContainer.className = 'property-popup-content';
      
      const root = ReactDOM.createRoot(popupContainer);
      root.render(
        <div className="w-72 p-0">
          <div className="relative">
            {property.images[0] && (
              <img 
                src={property.images[0]} 
                alt={property.title}
                className="w-full h-36 object-cover rounded-t-xl"
              />
            )}
            <div className="absolute top-2 right-2 bg-background/90 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-semibold">
              ⭐ {property.rating || 'N/A'}
            </div>
          </div>
          <div className="p-3 space-y-2">
            <h3 className="font-semibold text-foreground text-sm line-clamp-1">{property.title}</h3>
            <p className="text-xs text-muted-foreground line-clamp-1">{property.location.address}</p>
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-primary">
                {property.currency}{property.price}<span className="text-xs font-normal text-muted-foreground">/night</span>
              </span>
              <span className="text-xs text-muted-foreground">
                {property.bedrooms} bed • {property.guests} guests
              </span>
            </div>
            <button 
              onClick={() => {
                setSelectedProperty(property);
                setShowModal(true);
                if (onPropertySelect) {
                  onPropertySelect(property);
                }
              }}
              className="w-full mt-2 py-2 px-4 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors"
            >
              View Details
            </button>
          </div>
        </div>
      );

      // Create popup
      const popup = new maplibregl.Popup({ 
        offset: 30,
        closeButton: true,
        closeOnClick: false,
        className: 'property-map-popup',
        maxWidth: '300px',
        focusAfterOpen: false
      }).setDOMContent(popupContainer);

      popups.current.push(popup);

      // Create hover tooltip content
      const hoverContainer = document.createElement('div');
      hoverContainer.className = 'hover-tooltip-content';
      
      const hoverRoot = ReactDOM.createRoot(hoverContainer);
      hoverRoot.render(
        <div className="flex items-center gap-2 p-2 min-w-[180px]">
          {property.images[0] && (
            <img 
              src={property.images[0]} 
              alt={property.title}
              className="w-12 h-12 object-cover rounded-md flex-shrink-0"
            />
          )}
          <div className="flex-1 min-w-0">
            <p className="font-medium text-foreground text-xs line-clamp-1">{property.title}</p>
            <p className="text-xs text-muted-foreground">{property.bedrooms} bed • {property.guests} guests</p>
            <div className="flex items-center gap-1 mt-0.5">
              <span className="text-xs font-semibold text-primary">{property.currency}{property.price}/night</span>
              {property.rating && <span className="text-xs text-muted-foreground">⭐ {property.rating}</span>}
            </div>
          </div>
        </div>
      );

      // Create hover popup
      const hoverPopup = new maplibregl.Popup({
        offset: [0, -35],
        closeButton: false,
        closeOnClick: false,
        className: 'property-hover-tooltip',
        maxWidth: '220px',
        focusAfterOpen: false
      }).setDOMContent(hoverContainer);

      hoverPopups.current.push(hoverPopup);

      // Create custom marker element
      const markerEl = document.createElement('div');
      markerEl.className = 'custom-marker';
      markerEl.innerHTML = `
        <div class="marker-content">
          <span class="marker-price">${property.currency}${property.price}</span>
        </div>
      `;

      const marker = new maplibregl.Marker({ element: markerEl, anchor: 'bottom' })
        .setLngLat([property.location.lng, property.location.lat])
        .addTo(map.current!);

      // Show hover tooltip on mouseenter
      markerEl.addEventListener('mouseenter', () => {
        // Don't show hover if click popup is already open for this property
        if (activePopupRef.current === popup) return;
        hoverPopup.setLngLat([property.location.lng, property.location.lat]).addTo(map.current!);
      });

      // Hide hover tooltip on mouseleave
      markerEl.addEventListener('mouseleave', () => {
        hoverPopup.remove();
      });

      // Open popup on click
      markerEl.addEventListener('click', (e) => {
        e.stopPropagation();
        
        // Remove hover popup
        hoverPopup.remove();
        
        // Close any active popup using ref
        if (activePopupRef.current) {
          activePopupRef.current.remove();
        }
        
        popup.setLngLat([property.location.lng, property.location.lat]).addTo(map.current!);
        activePopupRef.current = popup;
        setActivePopup(popup);
      });

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
    // Don't reset selectedProperty to keep markers visible
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
          <DynamicButton
            variant="outline"
            onClick={handleGeolocation}
            disabled={isLocating}
          >
            <Locate className={`h-4 w-4 ${isLocating ? 'animate-spin' : ''}`} />
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
        <div ref={mapContainer} className={`w-full min-h-[400px] rounded-lg ${className}`} />
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
        .property-map-popup .maplibregl-popup-content {
          padding: 0 !important;
          border-radius: 1rem !important;
          box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.2), 0 10px 20px -5px rgba(0, 0, 0, 0.1) !important;
          background: hsl(var(--card)) !important;
          border: 1px solid hsl(var(--border) / 0.5) !important;
          overflow: hidden;
        }
        .property-map-popup .maplibregl-popup-close-button {
          font-size: 20px;
          padding: 8px 12px;
          color: hsl(var(--foreground));
          background: hsl(var(--background) / 0.8);
          backdrop-filter: blur(4px);
          border-radius: 50%;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          top: 8px;
          right: 8px;
          z-index: 10;
          transition: all 0.2s ease;
        }
        .property-map-popup .maplibregl-popup-close-button:hover {
          background: hsl(var(--muted));
          transform: scale(1.1);
        }
        .property-map-popup .maplibregl-popup-tip {
          border-top-color: hsl(var(--card)) !important;
        }
        .custom-marker {
          cursor: pointer;
          z-index: 1;
          transition: z-index 0s;
        }
        .custom-marker:hover {
          z-index: 10;
        }
        .custom-marker .marker-content {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 6px 12px;
          background: hsl(var(--primary));
          color: hsl(var(--primary-foreground));
          border-radius: 20px;
          font-size: 13px;
          font-weight: 600;
          box-shadow: 0 4px 12px -2px hsl(var(--primary) / 0.4), 0 2px 4px -1px rgba(0, 0, 0, 0.1);
          transform: translateY(0);
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
        }
        .custom-marker .marker-content::after {
          content: '';
          position: absolute;
          bottom: -6px;
          left: 50%;
          transform: translateX(-50%);
          border-left: 6px solid transparent;
          border-right: 6px solid transparent;
          border-top: 6px solid hsl(var(--primary));
        }
        .custom-marker:hover .marker-content {
          transform: translateY(-4px) scale(1.05);
          box-shadow: 0 8px 20px -4px hsl(var(--primary) / 0.5), 0 4px 8px -2px rgba(0, 0, 0, 0.15);
        }
        .custom-marker .marker-price {
          white-space: nowrap;
        }
        .user-location-marker {
          z-index: 5;
        }
        .maplibregl-ctrl-group {
          background: hsl(var(--card)) !important;
          border-radius: 12px !important;
          box-shadow: 0 4px 12px -2px rgba(0, 0, 0, 0.1) !important;
          border: 1px solid hsl(var(--border) / 0.5) !important;
          overflow: hidden;
        }
        .maplibregl-ctrl-group button {
          background: hsl(var(--card)) !important;
          border-color: hsl(var(--border) / 0.3) !important;
        }
        .maplibregl-ctrl-group button:hover {
          background: hsl(var(--muted)) !important;
        }
        .maplibregl-ctrl-group button .maplibregl-ctrl-icon {
          filter: brightness(0) saturate(100%) invert(var(--ctrl-icon-invert, 0));
        }
        @media (prefers-color-scheme: dark) {
          .maplibregl-ctrl-group button .maplibregl-ctrl-icon {
            filter: invert(1);
          }
        }
      `}</style>
    </>
  );
};
