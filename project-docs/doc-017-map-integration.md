# DOC-017: Map Integration

## Overview
This document covers integrating Leaflet with OpenStreetMap (free) to display job locations on interactive maps. Includes job markers with popups, location-based search, map/list toggle functionality, marker clustering for many jobs, and mobile touch support.

## Prerequisites
- DOC-001 through DOC-016 completed
- Job locations with coordinates in Sanity
- Leaflet and React Leaflet installed
- Mobile-responsive layouts configured

## Steps

### 1. Install Map Dependencies

First, install the required packages:

```bash
npm install leaflet react-leaflet @types/leaflet
npm install leaflet.markercluster @types/leaflet.markercluster
npm install --save-dev @types/react-leaflet
```

### 2. Configure Leaflet CSS

Add Leaflet CSS to your app:

```typescript
// app/layout.tsx (add to existing file)
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';

// Fix for default markers
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon.src,
  shadowUrl: iconShadow.src,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;
```

### 3. Create Map Types

Define TypeScript types for map functionality:

```typescript
// types/map.ts
export interface MapJob {
  _id: string;
  title: string;
  company: {
    name: string;
    logo?: any;
  };
  location: {
    city: string;
    county: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  salaryMin: number;
  salaryMax?: number;
  salaryType: 'hourly' | 'salary' | 'contract';
  slug: { current: string };
}

export interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

export interface MapFilters {
  bounds?: MapBounds;
  radius?: number;
  center?: { lat: number; lng: number };
}
```

### 4. Create Custom Map Markers

Build custom markers for different job types:

```typescript
// components/Public/MapMarkers.tsx
'use client';

import L from 'leaflet';

export const createJobIcon = (isUrgent: boolean = false, isFeatured: boolean = false) => {
  const className = `job-marker ${isUrgent ? 'urgent' : ''} ${isFeatured ? 'featured' : ''}`;
  
  return L.divIcon({
    html: `
      <div class="${className}">
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M20 0C12.82 0 7 5.82 7 13C7 21.5 20 40 20 40S33 21.5 33 13C33 5.82 27.18 0 20 0Z" 
                fill="${isFeatured ? '#f59e0b' : isUrgent ? '#ef4444' : '#3b82f6'}"/>
          <circle cx="20" cy="13" r="6" fill="white"/>
          <text x="20" y="17" text-anchor="middle" fill="${isFeatured ? '#f59e0b' : isUrgent ? '#ef4444' : '#3b82f6'}" 
                font-size="12" font-weight="bold">J</text>
        </svg>
      </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40],
    className: 'custom-job-marker'
  });
};

// Add CSS for markers
export const markerStyles = `
  .job-marker {
    position: relative;
    cursor: pointer;
    transition: transform 0.2s;
  }
  
  .job-marker:hover {
    transform: scale(1.1);
    z-index: 1000 !important;
  }
  
  .job-marker.urgent svg path {
    animation: pulse 2s infinite;
  }
  
  .job-marker.featured {
    filter: drop-shadow(0 0 8px rgba(245, 158, 11, 0.5));
  }
  
  @keyframes pulse {
    0% { opacity: 1; }
    50% { opacity: 0.7; }
    100% { opacity: 1; }
  }
  
  .leaflet-popup-content {
    margin: 0;
    min-width: 250px;
  }
  
  .leaflet-popup-content-wrapper {
    padding: 0;
    border-radius: 8px;
    overflow: hidden;
  }
`;
```

### 5. Create Job Map Component

Build the main map component:

```typescript
// components/Public/JobMap.tsx
'use client';

import { useEffect, useState, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { MapPin, DollarSign, Building2, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { urlFor } from '@/lib/sanity';
import { createJobIcon, markerStyles } from './MapMarkers';
import type { MapJob, MapBounds } from '@/types/map';

interface JobMapProps {
  jobs: MapJob[];
  center?: { lat: number; lng: number };
  zoom?: number;
  onBoundsChange?: (bounds: MapBounds) => void;
  height?: string;
}

// Map controls component
function MapControls({ onBoundsChange }: { onBoundsChange?: (bounds: MapBounds) => void }) {
  const map = useMapEvents({
    moveend: () => {
      if (onBoundsChange) {
        const bounds = map.getBounds();
        onBoundsChange({
          north: bounds.getNorth(),
          south: bounds.getSouth(),
          east: bounds.getEast(),
          west: bounds.getWest()
        });
      }
    }
  });

  return null;
}

// Recenter button component
function RecenterButton({ center }: { center: { lat: number; lng: number } }) {
  const map = useMap();

  const handleRecenter = () => {
    map.setView([center.lat, center.lng], 10);
  };

  return (
    <div className="leaflet-top leaflet-right">
      <div className="leaflet-control">
        <Button
          onClick={handleRecenter}
          size="sm"
          variant="secondary"
          className="bg-white shadow-md"
        >
          <MapPin className="h-4 w-4 mr-1" />
          Recenter
        </Button>
      </div>
    </div>
  );
}

export default function JobMap({
  jobs,
  center = { lat: 39.5501, lng: -105.7821 }, // Colorado center
  zoom = 7,
  onBoundsChange,
  height = '500px'
}: JobMapProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Group jobs by exact coordinates for clustering
  const jobsByLocation = jobs.reduce((acc, job) => {
    if (!job.location.coordinates) return acc;
    
    const key = `${job.location.coordinates.lat},${job.location.coordinates.lng}`;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(job);
    return acc;
  }, {} as Record<string, MapJob[]>);

  if (!isClient) {
    return (
      <div style={{ height }} className="relative">
        <Skeleton className="w-full h-full" />
      </div>
    );
  }

  return (
    <>
      <style jsx global>{markerStyles}</style>
      <div style={{ height }} className="relative rounded-lg overflow-hidden border">
        <MapContainer
          center={[center.lat, center.lng]}
          zoom={zoom}
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          <MarkerClusterGroup
            chunkedLoading
            showCoverageOnHover={false}
            spiderfyOnMaxZoom={true}
            maxClusterRadius={50}
          >
            {Object.entries(jobsByLocation).map(([coords, locationJobs]) => {
              const [lat, lng] = coords.split(',').map(Number);
              const firstJob = locationJobs[0];
              
              return (
                <Marker
                  key={coords}
                  position={[lat, lng]}
                  icon={createJobIcon(
                    locationJobs.some(j => j.isUrgent),
                    locationJobs.some(j => j.featured)
                  )}
                >
                  <Popup>
                    <div className="p-0">
                      {locationJobs.length === 1 ? (
                        <JobPopupContent job={firstJob} />
                      ) : (
                        <MultiJobPopupContent jobs={locationJobs} />
                      )}
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MarkerClusterGroup>
          
          <MapControls onBoundsChange={onBoundsChange} />
          <RecenterButton center={center} />
        </MapContainer>
      </div>
    </>
  );
}

// Single job popup content
function JobPopupContent({ job }: { job: MapJob }) {
  return (
    <div className="p-4 min-w-[250px]">
      <div className="flex items-start gap-3 mb-3">
        {job.company.logo && (
          <Image
            src={urlFor(job.company.logo).width(40).height(40).url()}
            alt={job.company.name}
            width={40}
            height={40}
            className="rounded object-contain"
          />
        )}
        <div className="flex-1">
          <h3 className="font-semibold text-sm">{job.title}</h3>
          <p className="text-xs text-gray-600 flex items-center gap-1">
            <Building2 className="h-3 w-3" />
            {job.company.name}
          </p>
        </div>
      </div>
      
      <div className="space-y-2 mb-3">
        <p className="text-xs text-gray-600 flex items-center gap-1">
          <MapPin className="h-3 w-3" />
          {job.location.city}, {job.location.county} County
        </p>
        <p className="text-xs font-medium flex items-center gap-1">
          <DollarSign className="h-3 w-3" />
          ${job.salaryMin}-{job.salaryMax || '?'}/
          {job.salaryType === 'hourly' ? 'hr' : 'yr'}
        </p>
      </div>
      
      <Link href={`/jobs/${job.slug.current}`}>
        <Button size="sm" className="w-full">
          View Details
          <ExternalLink className="h-3 w-3 ml-1" />
        </Button>
      </Link>
    </div>
  );
}

// Multiple jobs popup content
function MultiJobPopupContent({ jobs }: { jobs: MapJob[] }) {
  return (
    <div className="p-4 min-w-[250px] max-h-[300px] overflow-y-auto">
      <h3 className="font-semibold text-sm mb-3">
        {jobs.length} Jobs at this location
      </h3>
      <div className="space-y-3">
        {jobs.map((job) => (
          <div key={job._id} className="border-b last:border-0 pb-3 last:pb-0">
            <h4 className="font-medium text-sm">{job.title}</h4>
            <p className="text-xs text-gray-600">{job.company.name}</p>
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs font-medium">
                ${job.salaryMin}/
                {job.salaryType === 'hourly' ? 'hr' : 'yr'}
              </span>
              <Link href={`/jobs/${job.slug.current}`}>
                <Button size="sm" variant="ghost" className="h-7 text-xs">
                  View
                  <ExternalLink className="h-3 w-3 ml-1" />
                </Button>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

### 6. Create Map/List Toggle Component

Build a component to switch between map and list views:

```typescript
// components/Public/MapListToggle.tsx
'use client';

import { Button } from '@/components/ui/button';
import { Map, List } from 'lucide-react';

interface MapListToggleProps {
  view: 'map' | 'list';
  onChange: (view: 'map' | 'list') => void;
}

export default function MapListToggle({ view, onChange }: MapListToggleProps) {
  return (
    <div className="inline-flex rounded-lg border p-1">
      <Button
        variant={view === 'list' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onChange('list')}
        className="gap-2"
      >
        <List className="h-4 w-4" />
        <span className="hidden sm:inline">List</span>
      </Button>
      <Button
        variant={view === 'map' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onChange('map')}
        className="gap-2"
      >
        <Map className="h-4 w-4" />
        <span className="hidden sm:inline">Map</span>
      </Button>
    </div>
  );
}
```

### 7. Create Location Search Component

Build a location-based search component:

```typescript
// components/Public/LocationSearch.tsx
'use client';

import { useState, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { MapPin, Search, Navigation } from 'lucide-react';
import { useDebounce } from '@/hooks/useDebounce';

interface LocationSearchProps {
  onLocationChange: (location: { lat: number; lng: number; radius: number }) => void;
  onClear: () => void;
}

export default function LocationSearch({ onLocationChange, onClear }: LocationSearchProps) {
  const [address, setAddress] = useState('');
  const [radius, setRadius] = useState(25);
  const [isSearching, setIsSearching] = useState(false);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  
  const debouncedAddress = useDebounce(address, 500);

  // Geocode address using Nominatim (OpenStreetMap)
  const geocodeAddress = useCallback(async (searchAddress: string) => {
    if (!searchAddress || searchAddress.length < 3) {
      setSuggestions([]);
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?` +
        `format=json&q=${encodeURIComponent(searchAddress)}, Colorado, USA&limit=5`
      );
      
      if (!response.ok) throw new Error('Geocoding failed');
      
      const data = await response.json();
      setSuggestions(data);
    } catch (error) {
      console.error('Geocoding error:', error);
      setSuggestions([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  // Use effect for debounced search
  useEffect(() => {
    if (debouncedAddress) {
      geocodeAddress(debouncedAddress);
    }
  }, [debouncedAddress, geocodeAddress]);

  const handleSelectLocation = (suggestion: any) => {
    const lat = parseFloat(suggestion.lat);
    const lng = parseFloat(suggestion.lon);
    
    setAddress(suggestion.display_name);
    setSuggestions([]);
    onLocationChange({ lat, lng, radius });
  };

  const handleUseMyLocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          onLocationChange({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            radius
          });
          setAddress('My Location');
        },
        (error) => {
          console.error('Geolocation error:', error);
        }
      );
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="gap-2">
          <MapPin className="h-4 w-4" />
          Location
          {address && (
            <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded">
              {radius}mi
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="space-y-4">
          <div>
            <Label htmlFor="location">Search Location</Label>
            <div className="relative mt-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="location"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Enter city, county, or ZIP"
                className="pl-10"
              />
            </div>
            
            {/* Suggestions dropdown */}
            {suggestions.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-48 overflow-y-auto">
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleSelectLocation(suggestion)}
                    className="w-full text-left px-3 py-2 hover:bg-gray-100 text-sm"
                  >
                    {suggestion.display_name}
                  </button>
                ))}
              </div>
            )}
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={handleUseMyLocation}
            className="w-full"
          >
            <Navigation className="h-4 w-4 mr-2" />
            Use My Location
          </Button>

          <div>
            <div className="flex items-center justify-between mb-2">
              <Label>Search Radius</Label>
              <span className="text-sm font-medium">{radius} miles</span>
            </div>
            <Slider
              value={[radius]}
              onValueChange={(value) => setRadius(value[0])}
              min={5}
              max={100}
              step={5}
            />
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setAddress('');
                setRadius(25);
                onClear();
              }}
              className="flex-1"
            >
              Clear
            </Button>
            <Button
              onClick={() => {
                if (address) {
                  // Re-trigger search with current values
                  const currentSuggestion = suggestions[0];
                  if (currentSuggestion) {
                    handleSelectLocation(currentSuggestion);
                  }
                }
              }}
              disabled={!address || isSearching}
              className="flex-1"
            >
              Apply
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
```

### 8. Create Jobs Page with Map

Update the jobs listing page to include map view:

```typescript
// components/Public/JobListingWithMap.tsx
'use client';

import { useState, useEffect, useMemo } from 'react';
import JobCard from './JobCard';
import JobMap from './JobMap';
import MapListToggle from './MapListToggle';
import LocationSearch from './LocationSearch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info } from 'lucide-react';
import type { Job } from '@/types';
import type { MapBounds } from '@/types/map';

interface JobListingWithMapProps {
  initialJobs: Job[];
  categories: any[];
}

export default function JobListingWithMap({ 
  initialJobs, 
  categories 
}: JobListingWithMapProps) {
  const [view, setView] = useState<'map' | 'list'>('list');
  const [locationFilter, setLocationFilter] = useState<{
    lat: number;
    lng: number;
    radius: number;
  } | null>(null);
  const [mapBounds, setMapBounds] = useState<MapBounds | null>(null);
  
  // Filter jobs based on location
  const filteredJobs = useMemo(() => {
    if (!locationFilter) return initialJobs;
    
    return initialJobs.filter(job => {
      if (!job.location.coordinates) return false;
      
      // Calculate distance using Haversine formula
      const distance = calculateDistance(
        locationFilter.lat,
        locationFilter.lng,
        job.location.coordinates.lat,
        job.location.coordinates.lng
      );
      
      return distance <= locationFilter.radius;
    });
  }, [initialJobs, locationFilter]);

  // Jobs visible on map (within bounds)
  const visibleJobs = useMemo(() => {
    if (!mapBounds || view !== 'map') return filteredJobs;
    
    return filteredJobs.filter(job => {
      if (!job.location.coordinates) return false;
      
      const { lat, lng } = job.location.coordinates;
      return (
        lat >= mapBounds.south &&
        lat <= mapBounds.north &&
        lng >= mapBounds.west &&
        lng <= mapBounds.east
      );
    });
  }, [filteredJobs, mapBounds, view]);

  // Haversine distance calculation
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 3959; // Earth's radius in miles
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <MapListToggle view={view} onChange={setView} />
          <LocationSearch
            onLocationChange={setLocationFilter}
            onClear={() => setLocationFilter(null)}
          />
        </div>
        <p className="text-sm text-gray-600">
          {view === 'map' && mapBounds
            ? `Showing ${visibleJobs.length} of ${filteredJobs.length} jobs on map`
            : `${filteredJobs.length} jobs found`}
        </p>
      </div>

      {/* Location filter info */}
      {locationFilter && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Showing jobs within {locationFilter.radius} miles of your selected location
          </AlertDescription>
        </Alert>
      )}

      {/* Map/List View */}
      {view === 'map' ? (
        <div className="space-y-4">
          <JobMap
            jobs={filteredJobs.filter(job => job.location.coordinates)}
            center={locationFilter || undefined}
            zoom={locationFilter ? 10 : 7}
            onBoundsChange={setMapBounds}
            height="600px"
          />
          
          {/* Show visible jobs below map on mobile */}
          <div className="lg:hidden space-y-4">
            <h3 className="font-semibold">Jobs visible on map</h3>
            <div className="grid gap-4">
              {visibleJobs.map((job) => (
                <JobCard key={job._id} job={job} />
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredJobs.map((job) => (
            <JobCard key={job._id} job={job} />
          ))}
        </div>
      )}
    </div>
  );
}
```

### 9. Add Map to Job Detail Page

Add a small map to show job location:

```typescript
// components/Public/JobLocationMap.tsx
'use client';

import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Navigation, MapPin } from 'lucide-react';
import { createJobIcon } from './MapMarkers';

interface JobLocationMapProps {
  location: {
    city: string;
    county: string;
    zipCode: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  jobTitle: string;
  companyName: string;
}

export default function JobLocationMap({ 
  location, 
  jobTitle, 
  companyName 
}: JobLocationMapProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!location.coordinates || !isClient) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Location</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            {location.city}, {location.county} County, CO {location.zipCode}
          </p>
          {!location.coordinates && (
            <p className="text-sm text-gray-500 mt-2">
              Map not available for this location
            </p>
          )}
        </CardContent>
      </Card>
    );
  }

  const handleGetDirections = () => {
    const { lat, lng } = location.coordinates!;
    window.open(
      `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`,
      '_blank'
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Location</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="h-[300px] rounded-lg overflow-hidden border">
          <MapContainer
            center={[location.coordinates.lat, location.coordinates.lng]}
            zoom={13}
            style={{ height: '100%', width: '100%' }}
            scrollWheelZoom={false}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker
              position={[location.coordinates.lat, location.coordinates.lng]}
              icon={createJobIcon()}
            >
              <Popup>
                <div className="p-2">
                  <p className="font-semibold text-sm">{jobTitle}</p>
                  <p className="text-xs text-gray-600">{companyName}</p>
                  <p className="text-xs mt-1">
                    {location.city}, {location.county} County
                  </p>
                </div>
              </Popup>
            </Marker>
          </MapContainer>
        </div>
        
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600 flex items-center gap-1">
            <MapPin className="h-4 w-4" />
            {location.city}, {location.county} County, CO {location.zipCode}
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={handleGetDirections}
          >
            <Navigation className="h-4 w-4 mr-1" />
            Directions
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
```

### 10. Create useDebounce Hook

```typescript
// hooks/useDebounce.ts
import { useState, useEffect } from 'react';

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
```

### 11. Update Job Queries for Map

Update Sanity queries to include jobs with coordinates:

```typescript
// lib/queries/jobs.ts (update existing)
export const jobsWithCoordinatesQuery = groq`
  *[_type == "jobPosting" && status == "published" && defined(location.coordinates)] | order(publishedAt desc) {
    _id,
    title,
    slug,
    "company": company->{name, slug, logo},
    location,
    salaryMin,
    salaryMax,
    salaryType,
    isUrgent,
    featured
  }
`;

export const jobsInRadiusQuery = groq`
  *[_type == "jobPosting" && status == "published" && defined(location.coordinates)] {
    _id,
    title,
    slug,
    "company": company->{name, slug, logo},
    location,
    salaryMin,
    salaryMax,
    salaryType,
    isUrgent,
    featured,
    "distance": geo::distance(location.coordinates, geo::point($centerLat, $centerLng))
  }[distance < $radiusInMeters] | order(distance asc)
`;
```

## Verification Steps

1. **Test Map Display:**
   - Verify map loads with OpenStreetMap tiles
   - Check markers appear at correct locations
   - Test popup content displays correctly

2. **Test Marker Clustering:**
   - Add many jobs at same location
   - Verify clustering works properly
   - Test spiderfy on zoom

3. **Test Location Search:**
   - Search for various Colorado cities
   - Test geolocation ("Use My Location")
   - Verify radius filter works
   - Test address autocomplete

4. **Test Map/List Toggle:**
   - Switch between views
   - Verify state persists
   - Check job counts update

5. **Test Mobile Responsiveness:**
   - Check touch controls work
   - Test pinch-to-zoom
   - Verify popups readable on mobile
   - Test location search on mobile

6. **Test Job Detail Map:**
   - Verify small map shows on job pages
   - Test "Get Directions" button
   - Check jobs without coordinates

## Common Issues & Solutions

### Issue: Map tiles not loading
**Solution:**
1. Check internet connectivity
2. Verify OpenStreetMap is accessible
3. Check for CORS issues
4. Ensure Leaflet CSS is imported

### Issue: Markers not showing
**Solution:**
1. Verify coordinates are valid numbers
2. Check marker icon paths
3. Ensure Leaflet default icon fix is applied
4. Test with console.log for coordinates

### Issue: Clustering not working
**Solution:**
1. Ensure react-leaflet-cluster installed
2. Import MarkerClusterGroup correctly
3. Check cluster CSS is loaded
4. Verify chunkedLoading prop is set

### Issue: Geolocation fails
**Solution:**
1. Check HTTPS requirement for geolocation
2. Handle permission denied gracefully
3. Provide fallback to manual entry
4. Show appropriate error messages

## Next Steps

Proceed to [DOC-018: Email Notifications](doc-018-email-notifications.md) to implement the email notification system.

## Notes for Claude Code

When implementing map integration:
1. Always handle cases where coordinates are missing
2. Implement proper loading states for map
3. Use debouncing for location search
4. Consider map performance with many markers
5. Test on various devices and screen sizes
6. Implement proper error boundaries
7. Consider offline fallbacks
8. Add analytics for map interactions
9. Ensure accessibility with keyboard navigation