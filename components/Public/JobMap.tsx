'use client';

import { useEffect, useRef } from 'react';
import { Job } from '@/types';

interface JobMapProps {
  jobs: Job[];
}

export default function JobMap({ jobs }: JobMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // For now, this is a placeholder
    // We'll implement the actual Leaflet map later when we have proper coordinates
    if (mapRef.current) {
      mapRef.current.innerHTML = `
        <div class="h-full w-full flex items-center justify-center bg-gray-100 text-gray-500">
          <div class="text-center">
            <p class="text-lg font-medium">Map View</p>
            <p class="text-sm mt-2">Showing ${jobs.length} job locations</p>
            <p class="text-xs mt-4">Interactive map coming soon...</p>
          </div>
        </div>
      `;
    }
  }, [jobs]);

  return <div ref={mapRef} className="h-full w-full" />;
}