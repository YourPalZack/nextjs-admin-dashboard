# DOC-007: Job Listing Page

## Overview
Create the main job browsing page with server-side rendering, filtering, and search functionality using NextAdmin components.

## Prerequisites
- Layouts created (from DOC-006)
- Sanity queries ready (from DOC-005)
- NextAdmin components available

## Steps

### 1. Create Job Listing Page

Create `app/(public)/jobs/page.tsx`:

```typescript
import { Suspense } from 'react';
import { Metadata } from 'next';
import JobListingContent from '@/components/Public/JobListingContent';
import JobListingSkeleton from '@/components/Public/JobListingSkeleton';
import PageContainer from '@/components/Shared/PageContainer';
import { getJobs, getCategories } from '@/lib/sanity-utils';

export const metadata: Metadata = {
  title: 'Browse Jobs',
  description: 'Find construction, manufacturing, and skilled trade jobs across Colorado',
};

interface JobsPageProps {
  searchParams: {
    page?: string;
    category?: string;
    location?: string;
    jobType?: string;
    experienceLevel?: string;
    salaryMin?: string;
    search?: string;
    view?: string;
  };
}

export default async function JobsPage({ searchParams }: JobsPageProps) {
  // Parse search params
  const page = parseInt(searchParams.page || '1');
  const filters = {
    category: searchParams.category || '',
    location: searchParams.location || '',
    jobType: searchParams.jobType || '',
    experienceLevel: searchParams.experienceLevel || '',
    salaryMin: parseInt(searchParams.salaryMin || '0'),
    search: searchParams.search || '',
  };

  // Fetch data
  const [jobsData, categories] = await Promise.all([
    getJobs({ page, ...filters }),
    getCategories(),
  ]);

  return (
    <PageContainer>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Blue-Collar Jobs in Colorado
          </h1>
          <p className="mt-2 text-gray-600">
            {jobsData.total} opportunities available across the state
          </p>
        </div>

        {/* Main Content */}
        <Suspense fallback={<JobListingSkeleton />}>
          <JobListingContent
            initialJobs={jobsData.jobs}
            totalJobs={jobsData.total}
            totalPages={jobsData.pages}
            currentPage={page}
            categories={categories}
            filters={filters}
            view={searchParams.view || 'list'}
          />
        </Suspense>
      </div>
    </PageContainer>
  );
}
```

### 2. Create Job Listing Content Component

Create `components/Public/JobListingContent.tsx`:

```typescript
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import JobCard from './JobCard';
import JobFilter from './JobFilter';
import JobMap from './JobMap';
import { 
  Search, 
  MapIcon, 
  List, 
  Loader2 
} from 'lucide-react';
import { Job, JobCategory } from '@/types';
import Fuse from 'fuse.js';

interface JobListingContentProps {
  initialJobs: Job[];
  totalJobs: number;
  totalPages: number;
  currentPage: number;
  categories: JobCategory[];
  filters: any;
  view: string;
}

export default function JobListingContent({
  initialJobs,
  totalJobs,
  totalPages,
  currentPage,
  categories,
  filters,
  view: initialView,
}: JobListingContentProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [jobs, setJobs] = useState(initialJobs);
  const [searchTerm, setSearchTerm] = useState(filters.search);
  const [view, setView] = useState<'list' | 'map'>(initialView as any);
  const [isSearching, setIsSearching] = useState(false);

  // Client-side search with Fuse.js
  const fuse = new Fuse(jobs, {
    keys: ['title', 'company.name', 'location.city', 'description'],
    threshold: 0.3,
  });

  // Handle search
  const handleSearch = (term: string) => {
    setSearchTerm(term);
    
    if (term.trim() === '') {
      setJobs(initialJobs);
    } else {
      const results = fuse.search(term);
      setJobs(results.map(result => result.item));
    }
  };

  // Update URL params
  const updateSearchParams = (newParams: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());
    
    Object.entries(newParams).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });

    router.push(`/jobs?${params.toString()}`);
  };

  // Handle filter changes
  const handleFilterChange = (filterType: string, value: string) => {
    updateSearchParams({ [filterType]: value, page: '1' });
  };

  // Handle view toggle
  const toggleView = () => {
    const newView = view === 'list' ? 'map' : 'list';
    setView(newView);
    updateSearchParams({ view: newView });
  };

  return (
    <div className="grid lg:grid-cols-4 gap-6">
      {/* Sidebar Filters */}
      <div className="lg:col-span-1">
        <JobFilter
          categories={categories}
          currentFilters={filters}
          onFilterChange={handleFilterChange}
          totalJobs={totalJobs}
        />
      </div>

      {/* Main Content */}
      <div className="lg:col-span-3 space-y-6">
        {/* Search Bar */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  type="text"
                  placeholder="Search job title, company, or keywords..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button
                variant="outline"
                onClick={toggleView}
                className="sm:w-auto"
              >
                {view === 'list' ? (
                  <>
                    <MapIcon className="mr-2 h-4 w-4" />
                    Map View
                  </>
                ) : (
                  <>
                    <List className="mr-2 h-4 w-4" />
                    List View
                  </>
                )}
              </Button>
            </div>

            {/* Active Filters */}
            {Object.entries(filters).some(([_, value]) => value) && (
              <div className="mt-4 flex flex-wrap gap-2">
                {filters.category && (
                  <Badge variant="secondary" className="cursor-pointer">
                    Category: {filters.category}
                    <button
                      onClick={() => handleFilterChange('category', '')}
                      className="ml-2 text-xs"
                    >
                      ×
                    </button>
                  </Badge>
                )}
                {filters.location && (
                  <Badge variant="secondary" className="cursor-pointer">
                    Location: {filters.location}
                    <button
                      onClick={() => handleFilterChange('location', '')}
                      className="ml-2 text-xs"
                    >
                      ×
                    </button>
                  </Badge>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push('/jobs')}
                >
                  Clear all
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Results */}
        {view === 'list' ? (
          <>
            {/* Job Cards */}
            <div className="space-y-4">
              {jobs.length > 0 ? (
                jobs.map((job) => (
                  <JobCard key={job._id} job={job} />
                ))
              ) : (
                <Card>
                  <CardContent className="text-center py-12">
                    <p className="text-gray-500">
                      No jobs found matching your criteria.
                    </p>
                    <Button
                      variant="outline"
                      className="mt-4"
                      onClick={() => router.push('/jobs')}
                    >
                      Clear filters
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2">
                <Button
                  variant="outline"
                  disabled={currentPage === 1}
                  onClick={() => updateSearchParams({ page: String(currentPage - 1) })}
                >
                  Previous
                </Button>
                
                {[...Array(totalPages)].map((_, i) => {
                  const pageNum = i + 1;
                  if (
                    pageNum === 1 ||
                    pageNum === totalPages ||
                    (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                  ) {
                    return (
                      <Button
                        key={pageNum}
                        variant={pageNum === currentPage ? 'default' : 'outline'}
                        onClick={() => updateSearchParams({ page: String(pageNum) })}
                      >
                        {pageNum}
                      </Button>
                    );
                  }
                  if (pageNum === 2 || pageNum === totalPages - 1) {
                    return <span key={pageNum}>...</span>;
                  }
                  return null;
                })}
                
                <Button
                  variant="outline"
                  disabled={currentPage === totalPages}
                  onClick={() => updateSearchParams({ page: String(currentPage + 1) })}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        ) : (
          /* Map View */
          <Card className="h-[600px]">
            <CardContent className="p-0 h-full">
              <JobMap jobs={jobs} />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
```

### 3. Create Job Card Component

Create `components/Public/JobCard.tsx`:

```typescript
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  MapPin,
  Briefcase,
  DollarSign,
  Clock,
  Building2,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { Job } from '@/types';
import { formatDistanceToNow } from 'date-fns';
import { urlFor } from '@/lib/sanity';

interface JobCardProps {
  job: Job;
}

export default function JobCard({ job }: JobCardProps) {
  const salaryDisplay = job.showSalary && job.salaryMin
    ? `$${job.salaryMin.toLocaleString()}${
        job.salaryMax ? ` - $${job.salaryMax.toLocaleString()}` : '+'
      } ${job.salaryType === 'hourly' ? '/hr' : '/yr'}`
    : null;

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          {/* Company Logo */}
          <Avatar className="h-12 w-12">
            {job.company.logo ? (
              <AvatarImage
                src={urlFor(job.company.logo).width(96).height(96).url()}
                alt={job.company.name}
              />
            ) : (
              <AvatarFallback>
                <Building2 className="h-6 w-6" />
              </AvatarFallback>
            )}
          </Avatar>

          {/* Job Details */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold">
                  <Link
                    href={`/jobs/${job.slug.current}`}
                    className="hover:text-blue-600 transition-colors"
                  >
                    {job.title}
                  </Link>
                </h3>

                <div className="flex items-center gap-3 mt-1 text-sm text-gray-600">
                  <span className="flex items-center gap-1">
                    {job.company.verified && (
                      <CheckCircle2 className="h-4 w-4 text-blue-500" />
                    )}
                    {job.company.name}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {job.location.city}, CO
                  </span>
                  <span className="flex items-center gap-1">
                    <Briefcase className="h-4 w-4" />
                    {job.jobType}
                  </span>
                </div>

                {/* Salary */}
                {salaryDisplay && (
                  <div className="flex items-center gap-1 mt-2 text-sm font-medium text-green-600">
                    <DollarSign className="h-4 w-4" />
                    {salaryDisplay}
                  </div>
                )}

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mt-3">
                  {job.isUrgent && (
                    <Badge variant="destructive" className="gap-1">
                      <AlertCircle className="h-3 w-3" />
                      Urgent Hire
                    </Badge>
                  )}
                  {job.featured && (
                    <Badge variant="default">Featured</Badge>
                  )}
                  <Badge variant="secondary">{job.category.name}</Badge>
                  <Badge variant="outline">{job.experienceLevel}</Badge>
                  {job.remoteOptions !== 'onsite' && (
                    <Badge variant="outline">
                      {job.remoteOptions === 'remote' ? 'Remote' : 'Hybrid'}
                    </Badge>
                  )}
                </div>

                {/* Posted Time */}
                <p className="text-xs text-gray-500 mt-3">
                  Posted {formatDistanceToNow(new Date(job.publishedAt), { addSuffix: true })}
                </p>
              </div>

              {/* Apply Button */}
              <div className="flex-shrink-0">
                <Link href={`/jobs/${job.slug.current}`}>
                  <Button>Apply Now</Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
```

### 4. Create Job Filter Component

Create `components/Public/JobFilter.tsx`:

```typescript
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { JobCategory } from '@/types';
import { useState } from 'react';

interface JobFilterProps {
  categories: JobCategory[];
  currentFilters: any;
  onFilterChange: (filterType: string, value: string) => void;
  totalJobs: number;
}

const locations = [
  'Denver',
  'Colorado Springs',
  'Aurora',
  'Fort Collins',
  'Lakewood',
  'Thornton',
  'Westminster',
  'Pueblo',
  'Boulder',
  'Greeley',
];

const jobTypes = [
  { value: 'full-time', label: 'Full-time' },
  { value: 'part-time', label: 'Part-time' },
  { value: 'contract', label: 'Contract' },
  { value: 'temporary', label: 'Temporary' },
];

const experienceLevels = [
  { value: 'entry', label: 'Entry Level' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'experienced', label: 'Experienced' },
  { value: 'senior', label: 'Senior' },
];

export default function JobFilter({
  categories,
  currentFilters,
  onFilterChange,
  totalJobs,
}: JobFilterProps) {
  const [salaryMin, setSalaryMin] = useState(currentFilters.salaryMin || 0);

  const handleSalaryChange = (value: number[]) => {
    setSalaryMin(value[0]);
  };

  const handleSalaryCommit = () => {
    onFilterChange('salaryMin', salaryMin.toString());
  };

  return (
    <div className="space-y-6">
      {/* Results Count */}
      <Card>
        <CardContent className="p-4">
          <p className="text-sm text-gray-600">
            Showing <span className="font-semibold">{totalJobs}</span> jobs
          </p>
        </CardContent>
      </Card>

      {/* Category Filter */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Category</CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={currentFilters.category}
            onValueChange={(value) => onFilterChange('category', value)}
          >
            <div className="flex items-center space-x-2 mb-2">
              <RadioGroupItem value="" id="all-categories" />
              <Label htmlFor="all-categories" className="font-normal cursor-pointer">
                All Categories
              </Label>
            </div>
            {categories.map((category) => (
              <div key={category._id} className="flex items-center space-x-2 mb-2">
                <RadioGroupItem value={category.slug.current} id={category._id} />
                <Label htmlFor={category._id} className="font-normal cursor-pointer">
                  {category.name}
                  {category.jobCount > 0 && (
                    <span className="text-gray-500 ml-1">({category.jobCount})</span>
                  )}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Location Filter */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Location</CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={currentFilters.location}
            onValueChange={(value) => onFilterChange('location', value)}
          >
            <div className="flex items-center space-x-2 mb-2">
              <RadioGroupItem value="" id="all-locations" />
              <Label htmlFor="all-locations" className="font-normal cursor-pointer">
                All Locations
              </Label>
            </div>
            {locations.map((location) => (
              <div key={location} className="flex items-center space-x-2 mb-2">
                <RadioGroupItem value={location} id={location} />
                <Label htmlFor={location} className="font-normal cursor-pointer">
                  {location}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Job Type Filter */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Job Type</CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={currentFilters.jobType}
            onValueChange={(value) => onFilterChange('jobType', value)}
          >
            <div className="flex items-center space-x-2 mb-2">
              <RadioGroupItem value="" id="all-types" />
              <Label htmlFor="all-types" className="font-normal cursor-pointer">
                All Types
              </Label>
            </div>
            {jobTypes.map((type) => (
              <div key={type.value} className="flex items-center space-x-2 mb-2">
                <RadioGroupItem value={type.value} id={type.value} />
                <Label htmlFor={type.value} className="font-normal cursor-pointer">
                  {type.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Experience Level */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Experience Level</CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={currentFilters.experienceLevel}
            onValueChange={(value) => onFilterChange('experienceLevel', value)}
          >
            <div className="flex items-center space-x-2 mb-2">
              <RadioGroupItem value="" id="all-levels" />
              <Label htmlFor="all-levels" className="font-normal cursor-pointer">
                All Levels
              </Label>
            </div>
            {experienceLevels.map((level) => (
              <div key={level.value} className="flex items-center space-x-2 mb-2">
                <RadioGroupItem value={level.value} id={level.value} />
                <Label htmlFor={level.value} className="font-normal cursor-pointer">
                  {level.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Salary Filter */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Minimum Salary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between text-sm">
              <span>$0</span>
              <span className="font-medium">
                ${salaryMin.toLocaleString()}/hr
              </span>
            </div>
            <Slider
              value={[salaryMin]}
              onValueChange={handleSalaryChange}
              onValueCommit={handleSalaryCommit}
              min={0}
              max={100}
              step={5}
              className="w-full"
            />
            <p className="text-xs text-gray-500">
              Drag to set minimum hourly rate
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
```

### 5. Create Job Map Component

Create `components/Public/JobMap.tsx`:

```typescript
'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Job } from '@/types';

// Fix Leaflet icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: '/leaflet/marker-icon-2x.png',
  iconUrl: '/leaflet/marker-icon.png',
  shadowUrl: '/leaflet/marker-shadow.png',
});

interface JobMapProps {
  jobs: Job[];
}

export default function JobMap({ jobs }: JobMapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);

  useEffect(() => {
    // Initialize map
    if (!mapRef.current) {
      mapRef.current = L.map('job-map').setView([39.5501, -105.7821], 7);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
      }).addTo(mapRef.current);
    }

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Add job markers
    jobs.forEach(job => {
      if (job.location?.coordinates) {
        const marker = L.marker([
          job.location.coordinates.lat,
          job.location.coordinates.lng,
        ])
          .addTo(mapRef.current!)
          .bindPopup(`
            <div class="p-2">
              <h3 class="font-semibold">${job.title}</h3>
              <p class="text-sm">${job.company.name}</p>
              <p class="text-sm text-gray-600">${job.location.city}, CO</p>
              <a href="/jobs/${job.slug.current}" class="text-blue-600 text-sm hover:underline">
                View Details →
              </a>
            </div>
          `);
        
        markersRef.current.push(marker);
      }
    });

    // Adjust map bounds to show all markers
    if (markersRef.current.length > 0) {
      const group = L.featureGroup(markersRef.current);
      mapRef.current.fitBounds(group.getBounds().pad(0.1));
    }

    return () => {
      // Cleanup on unmount
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [jobs]);

  return <div id="job-map" className="h-full w-full" />;
}
```

### 6. Create Loading Skeleton

Create `components/Public/JobListingSkeleton.tsx`:

```typescript
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function JobListingSkeleton() {
  return (
    <div className="grid lg:grid-cols-4 gap-6">
      {/* Sidebar Skeleton */}
      <div className="lg:col-span-1 space-y-6">
        <Card>
          <CardContent className="p-4">
            <Skeleton className="h-4 w-24" />
          </CardContent>
        </Card>
        
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="p-4 space-y-3">
              <Skeleton className="h-4 w-32" />
              <div className="space-y-2">
                {[1, 2, 3, 4].map((j) => (
                  <Skeleton key={j} className="h-4 w-full" />
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Skeleton */}
      <div className="lg:col-span-3 space-y-6">
        {/* Search Bar Skeleton */}
        <Card>
          <CardContent className="p-4">
            <div className="flex gap-4">
              <Skeleton className="h-10 flex-1" />
              <Skeleton className="h-10 w-32" />
            </div>
          </CardContent>
        </Card>

        {/* Job Cards Skeleton */}
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="flex-1 space-y-3">
                    <Skeleton className="h-6 w-3/4" />
                    <div className="flex gap-4">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                    <div className="flex gap-2">
                      <Skeleton className="h-6 w-20" />
                      <Skeleton className="h-6 w-20" />
                      <Skeleton className="h-6 w-20" />
                    </div>
                  </div>
                  <Skeleton className="h-10 w-24" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
```

### 7. Add Leaflet Assets

Download Leaflet marker images and add to `public/leaflet/`:
- marker-icon.png
- marker-icon-2x.png
- marker-shadow.png

You can get these from: https://github.com/Leaflet/Leaflet/tree/main/dist/images

### 8. Create Search Hook

Create `hooks/useJobSearch.ts`:

```typescript
import { useState, useEffect, useMemo } from 'react';
import Fuse from 'fuse.js';
import { Job } from '@/types';

export function useJobSearch(jobs: Job[], searchTerm: string) {
  const [results, setResults] = useState<Job[]>(jobs);

  const fuse = useMemo(() => {
    return new Fuse(jobs, {
      keys: [
        { name: 'title', weight: 0.4 },
        { name: 'company.name', weight: 0.3 },
        { name: 'location.city', weight: 0.2 },
        { name: 'description', weight: 0.1 },
      ],
      threshold: 0.3,
      includeScore: true,
    });
  }, [jobs]);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setResults(jobs);
      return;
    }

    const searchResults = fuse.search(searchTerm);
    setResults(searchResults.map(result => result.item));
  }, [searchTerm, jobs, fuse]);

  return results;
}
```

### 9. Create Filter Persistence Hook

Create `hooks/useFilterPersistence.ts`:

```typescript
import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

export function useFilterPersistence() {
  const searchParams = useSearchParams();

  useEffect(() => {
    // Save current filters to localStorage
    const filters = Object.fromEntries(searchParams.entries());
    localStorage.setItem('jobFilters', JSON.stringify(filters));
  }, [searchParams]);

  const getSavedFilters = () => {
    if (typeof window === 'undefined') return {};
    
    const saved = localStorage.getItem('jobFilters');
    return saved ? JSON.parse(saved) : {};
  };

  const clearSavedFilters = () => {
    localStorage.removeItem('jobFilters');
  };

  return { getSavedFilters, clearSavedFilters };
}
```

## Verification Steps

1. **Test Job Listing:**
   - Navigate to /jobs
   - Verify jobs load correctly
   - Check pagination works

2. **Test Filtering:**
   - Apply different filters
   - Verify URL updates
   - Check results update

3. **Test Search:**
   - Search for job titles
   - Search for companies
   - Verify instant results

4. **Test Map View:**
   - Toggle to map view
   - Check markers appear
   - Verify popups work

## Common Issues & Solutions

### Issue: Map not displaying
**Solution:** Ensure Leaflet CSS is imported and marker images are in public folder

### Issue: Search too sensitive/not sensitive enough
**Solution:** Adjust Fuse.js threshold value (0.0 = exact match, 1.0 = match anything)

### Issue: Filters not persisting
**Solution:** Check URL params are being properly encoded/decoded

## Next Steps

Proceed to [DOC-008: Job Detail Page](doc-008-job-detail.md) to create individual job pages.

## Notes for Claude Code

When implementing job listings:
1. Test with various job counts (0, 1, many)
2. Ensure mobile responsiveness
3. Verify map markers have correct coordinates
4. Test all filter combinations
5. Check loading states work properly