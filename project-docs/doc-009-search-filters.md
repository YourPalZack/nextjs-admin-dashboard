# DOC-009: Search & Filters

## Overview
Implement advanced search functionality with Fuse.js, persistent filters, and URL-based state management.

## Prerequisites
- Job listing page complete (from DOC-007)
- Basic filtering working
- Fuse.js installed

## Steps

### 1. Create Advanced Search Component

Create `components/Public/AdvancedSearch.tsx`:

```typescript
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Search, X, Filter, RotateCcw } from 'lucide-react';
import { JobCategory } from '@/types';

interface AdvancedSearchProps {
  categories: JobCategory[];
  onSearch: (filters: SearchFilters) => void;
}

export interface SearchFilters {
  keyword: string;
  category: string;
  location: string;
  jobType: string;
  experienceLevel: string;
  salaryMin: number;
  salaryMax: number;
  remoteOnly: boolean;
  urgentOnly: boolean;
  datePosted: string;
}

const locations = [
  { value: '', label: 'All Locations' },
  { value: 'denver', label: 'Denver' },
  { value: 'colorado-springs', label: 'Colorado Springs' },
  { value: 'aurora', label: 'Aurora' },
  { value: 'fort-collins', label: 'Fort Collins' },
  { value: 'lakewood', label: 'Lakewood' },
  { value: 'thornton', label: 'Thornton' },
  { value: 'westminster', label: 'Westminster' },
  { value: 'pueblo', label: 'Pueblo' },
  { value: 'boulder', label: 'Boulder' },
  { value: 'greeley', label: 'Greeley' },
];

const datePostedOptions = [
  { value: '', label: 'Any time' },
  { value: '1', label: 'Last 24 hours' },
  { value: '3', label: 'Last 3 days' },
  { value: '7', label: 'Last week' },
  { value: '14', label: 'Last 2 weeks' },
  { value: '30', label: 'Last month' },
];

export default function AdvancedSearch({ categories, onSearch }: AdvancedSearchProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isExpanded, setIsExpanded] = useState(false);
  
  const [filters, setFilters] = useState<SearchFilters>({
    keyword: searchParams.get('q') || '',
    category: searchParams.get('category') || '',
    location: searchParams.get('location') || '',
    jobType: searchParams.get('type') || '',
    experienceLevel: searchParams.get('level') || '',
    salaryMin: parseInt(searchParams.get('minSalary') || '0'),
    salaryMax: parseInt(searchParams.get('maxSalary') || '200000'),
    remoteOnly: searchParams.get('remote') === 'true',
    urgentOnly: searchParams.get('urgent') === 'true',
    datePosted: searchParams.get('posted') || '',
  });

  const [salaryRange, setSalaryRange] = useState([filters.salaryMin, filters.salaryMax]);

  // Update URL when filters change
  const updateURL = (newFilters: SearchFilters) => {
    const params = new URLSearchParams();
    
    if (newFilters.keyword) params.set('q', newFilters.keyword);
    if (newFilters.category) params.set('category', newFilters.category);
    if (newFilters.location) params.set('location', newFilters.location);
    if (newFilters.jobType) params.set('type', newFilters.jobType);
    if (newFilters.experienceLevel) params.set('level', newFilters.experienceLevel);
    if (newFilters.salaryMin > 0) params.set('minSalary', newFilters.salaryMin.toString());
    if (newFilters.salaryMax < 200000) params.set('maxSalary', newFilters.salaryMax.toString());
    if (newFilters.remoteOnly) params.set('remote', 'true');
    if (newFilters.urgentOnly) params.set('urgent', 'true');
    if (newFilters.datePosted) params.set('posted', newFilters.datePosted);

    router.push(`/jobs?${params.toString()}`);
  };

  const handleSearch = () => {
    const updatedFilters = {
      ...filters,
      salaryMin: salaryRange[0],
      salaryMax: salaryRange[1],
    };
    setFilters(updatedFilters);
    updateURL(updatedFilters);
    onSearch(updatedFilters);
  };

  const handleReset = () => {
    const defaultFilters: SearchFilters = {
      keyword: '',
      category: '',
      location: '',
      jobType: '',
      experienceLevel: '',
      salaryMin: 0,
      salaryMax: 200000,
      remoteOnly: false,
      urgentOnly: false,
      datePosted: '',
    };
    setFilters(defaultFilters);
    setSalaryRange([0, 200000]);
    router.push('/jobs');
  };

  const activeFilterCount = Object.values(filters).filter(
    (value) => value && value !== 0 && value !== 200000
  ).length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search Jobs
          </CardTitle>
          <div className="flex items-center gap-2">
            {activeFilterCount > 0 && (
              <Badge variant="secondary">{activeFilterCount} filters</Badge>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              <Filter className="h-4 w-4 mr-1" />
              {isExpanded ? 'Hide' : 'Show'} Filters
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Keyword Search */}
          <div>
            <Label htmlFor="keyword">Keywords</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                id="keyword"
                placeholder="Job title, skills, or company"
                value={filters.keyword}
                onChange={(e) => setFilters({ ...filters, keyword: e.target.value })}
                className="pl-10"
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
          </div>

          {/* Expanded Filters */}
          {isExpanded && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Category */}
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={filters.category}
                    onValueChange={(value) => setFilters({ ...filters, category: value })}
                  >
                    <SelectTrigger id="category">
                      <SelectValue placeholder="All categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All categories</SelectItem>
                      {categories.map((cat) => (
                        <SelectItem key={cat._id} value={cat.slug.current}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Location */}
                <div>
                  <Label htmlFor="location">Location</Label>
                  <Select
                    value={filters.location}
                    onValueChange={(value) => setFilters({ ...filters, location: value })}
                  >
                    <SelectTrigger id="location">
                      <SelectValue placeholder="All locations" />
                    </SelectTrigger>
                    <SelectContent>
                      {locations.map((loc) => (
                        <SelectItem key={loc.value} value={loc.value}>
                          {loc.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Job Type */}
                <div>
                  <Label htmlFor="jobType">Job Type</Label>
                  <Select
                    value={filters.jobType}
                    onValueChange={(value) => setFilters({ ...filters, jobType: value })}
                  >
                    <SelectTrigger id="jobType">
                      <SelectValue placeholder="All types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All types</SelectItem>
                      <SelectItem value="full-time">Full-time</SelectItem>
                      <SelectItem value="part-time">Part-time</SelectItem>
                      <SelectItem value="contract">Contract</SelectItem>
                      <SelectItem value="temporary">Temporary</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Experience Level */}
                <div>
                  <Label htmlFor="experienceLevel">Experience Level</Label>
                  <Select
                    value={filters.experienceLevel}
                    onValueChange={(value) => setFilters({ ...filters, experienceLevel: value })}
                  >
                    <SelectTrigger id="experienceLevel">
                      <SelectValue placeholder="All levels" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All levels</SelectItem>
                      <SelectItem value="entry">Entry Level</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="experienced">Experienced</SelectItem>
                      <SelectItem value="senior">Senior</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Date Posted */}
                <div>
                  <Label htmlFor="datePosted">Date Posted</Label>
                  <Select
                    value={filters.datePosted}
                    onValueChange={(value) => setFilters({ ...filters, datePosted: value })}
                  >
                    <SelectTrigger id="datePosted">
                      <SelectValue placeholder="Any time" />
                    </SelectTrigger>
                    <SelectContent>
                      {datePostedOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Salary Range */}
              <div>
                <Label>Salary Range (Annual)</Label>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>${salaryRange[0].toLocaleString()}</span>
                    <span>${salaryRange[1].toLocaleString()}</span>
                  </div>
                  <Slider
                    value={salaryRange}
                    onValueChange={setSalaryRange}
                    min={0}
                    max={200000}
                    step={5000}
                    className="w-full"
                  />
                </div>
              </div>

              {/* Toggle Filters */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="remote" className="cursor-pointer">
                    Remote positions only
                  </Label>
                  <Switch
                    id="remote"
                    checked={filters.remoteOnly}
                    onCheckedChange={(checked) => setFilters({ ...filters, remoteOnly: checked })}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="urgent" className="cursor-pointer">
                    Urgent hiring only
                  </Label>
                  <Switch
                    id="urgent"
                    checked={filters.urgentOnly}
                    onCheckedChange={(checked) => setFilters({ ...filters, urgentOnly: checked })}
                  />
                </div>
              </div>
            </>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button onClick={handleSearch} className="flex-1">
              <Search className="h-4 w-4 mr-2" />
              Search Jobs
            </Button>
            {activeFilterCount > 0 && (
              <Button variant="outline" onClick={handleReset}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
```

### 2. Create Search Results Component

Create `components/Public/SearchResults.tsx`:

```typescript
'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, TrendingUp, MapPin, Briefcase } from 'lucide-react';
import JobCard from './JobCard';
import { Job } from '@/types';
import { SearchFilters } from './AdvancedSearch';

interface SearchResultsProps {
  jobs: Job[];
  filters: SearchFilters;
  isLoading?: boolean;
}

export default function SearchResults({ jobs, filters, isLoading }: SearchResultsProps) {
  const [sortBy, setSortBy] = useState<'relevance' | 'date' | 'salary'>('relevance');
  const [sortedJobs, setSortedJobs] = useState(jobs);

  useEffect(() => {
    let sorted = [...jobs];
    
    switch (sortBy) {
      case 'date':
        sorted.sort((a, b) => 
          new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
        );
        break;
      case 'salary':
        sorted.sort((a, b) => (b.salaryMax || b.salaryMin || 0) - (a.salaryMax || a.salaryMin || 0));
        break;
      default:
        // Keep original order for relevance
        break;
    }
    
    setSortedJobs(sorted);
  }, [jobs, sortBy]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    );
  }

  if (jobs.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <div className="max-w-md mx-auto">
            <h3 className="text-lg font-semibold mb-2">No jobs found</h3>
            <p className="text-gray-600 mb-6">
              Try adjusting your search criteria or browse all available positions.
            </p>
            
            {/* Suggestions */}
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium mb-2">Popular searches:</p>
                <div className="flex flex-wrap gap-2 justify-center">
                  <Badge 
                    variant="secondary" 
                    className="cursor-pointer hover:bg-gray-200"
                    onClick={() => window.location.href = '/jobs?q=electrician'}
                  >
                    Electrician
                  </Badge>
                  <Badge 
                    variant="secondary" 
                    className="cursor-pointer hover:bg-gray-200"
                    onClick={() => window.location.href = '/jobs?q=welder'}
                  >
                    Welder
                  </Badge>
                  <Badge 
                    variant="secondary" 
                    className="cursor-pointer hover:bg-gray-200"
                    onClick={() => window.location.href = '/jobs?q=construction'}
                  >
                    Construction
                  </Badge>
                  <Badge 
                    variant="secondary" 
                    className="cursor-pointer hover:bg-gray-200"
                    onClick={() => window.location.href = '/jobs?q=driver'}
                  >
                    Driver
                  </Badge>
                </div>
              </div>
              
              <Button 
                variant="outline" 
                onClick={() => window.location.href = '/jobs'}
                className="w-full"
              >
                Browse All Jobs
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Results Header */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          Found <span className="font-semibold">{jobs.length}</span> jobs
          {filters.keyword && (
            <span> matching "<span className="font-medium">{filters.keyword}</span>"</span>
          )}
        </p>
        
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Sort by:</span>
          <div className="flex gap-1">
            <Button
              variant={sortBy === 'relevance' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setSortBy('relevance')}
            >
              Relevance
            </Button>
            <Button
              variant={sortBy === 'date' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setSortBy('date')}
            >
              Date
            </Button>
            <Button
              variant={sortBy === 'salary' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setSortBy('salary')}
            >
              Salary
            </Button>
          </div>
        </div>
      </div>

      {/* Job Cards */}
      <div className="space-y-4">
        {sortedJobs.map((job) => (
          <JobCard key={job._id} job={job} />
        ))}
      </div>

      {/* Load More */}
      {jobs.length >= 20 && (
        <div className="text-center pt-4">
          <Button variant="outline">
            Load More Jobs
          </Button>
        </div>
      )}
    </div>
  );
}
```

### 3. Create Search Suggestions Component

Create `components/Public/SearchSuggestions.tsx`:

```typescript
'use client';

import { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Search, TrendingUp, Clock, MapPin, Briefcase } from 'lucide-react';
import { useDebounce } from '@/hooks/useDebounce';

interface SearchSuggestionsProps {
  onSearch: (query: string) => void;
  recentSearches?: string[];
}

const popularSearches = [
  'Electrician',
  'Plumber',
  'Welder',
  'Construction Worker',
  'Truck Driver',
  'HVAC Technician',
  'Carpenter',
  'Mechanic',
];

const suggestedSkills = [
  'CDL License',
  'Forklift Certified',
  'OSHA Certified',
  'Welding',
  'Electrical',
  'Plumbing',
  'Heavy Equipment',
  'Blueprint Reading',
];

export default function SearchSuggestions({ 
  onSearch, 
  recentSearches = [] 
}: SearchSuggestionsProps) {
  const [query, setQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const debouncedQuery = useDebounce(query, 300);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Generate suggestions based on input
  useEffect(() => {
    if (debouncedQuery.length > 1) {
      const filtered = [...popularSearches, ...suggestedSkills]
        .filter(item => 
          item.toLowerCase().includes(debouncedQuery.toLowerCase())
        )
        .slice(0, 5);
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  }, [debouncedQuery]);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (searchQuery: string) => {
    setQuery(searchQuery);
    setShowSuggestions(false);
    onSearch(searchQuery);
    
    // Save to recent searches
    const recent = [searchQuery, ...recentSearches.filter(s => s !== searchQuery)].slice(0, 5);
    localStorage.setItem('recentJobSearches', JSON.stringify(recent));
  };

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
        <Input
          ref={inputRef}
          type="text"
          placeholder="Search jobs, companies, or skills..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setShowSuggestions(true)}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              handleSearch(query);
            }
          }}
          className="pl-10 pr-4 h-12 text-lg"
        />
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestions && (
        <Card 
          ref={suggestionsRef}
          className="absolute top-full mt-2 w-full z-50 overflow-hidden"
        >
          <div className="max-h-96 overflow-y-auto">
            {/* Current search suggestions */}
            {suggestions.length > 0 && (
              <div className="p-2">
                <p className="text-xs font-medium text-gray-500 px-2 py-1">
                  Suggestions
                </p>
                {suggestions.map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => handleSearch(suggestion)}
                    className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded-md flex items-center gap-2"
                  >
                    <Search className="h-4 w-4 text-gray-400" />
                    <span className="text-sm">
                      {suggestion.split(new RegExp(`(${query})`, 'gi')).map((part, i) => 
                        part.toLowerCase() === query.toLowerCase() ? (
                          <strong key={i}>{part}</strong>
                        ) : (
                          part
                        )
                      )}
                    </span>
                  </button>
                ))}
              </div>
            )}

            {/* Recent searches */}
            {recentSearches.length > 0 && !query && (
              <div className="p-2 border-t">
                <p className="text-xs font-medium text-gray-500 px-2 py-1 flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Recent searches
                </p>
                {recentSearches.map((search) => (
                  <button
                    key={search}
                    onClick={() => handleSearch(search)}
                    className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded-md text-sm"
                  >
                    {search}
                  </button>
                ))}
              </div>
            )}

            {/* Popular searches */}
            {!query && (
              <div className="p-2 border-t">
                <p className="text-xs font-medium text-gray-500 px-2 py-1 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  Popular searches
                </p>
                <div className="grid grid-cols-2 gap-1">
                  {popularSearches.slice(0, 6).map((search) => (
                    <button
                      key={search}
                      onClick={() => handleSearch(search)}
                      className="text-left px-3 py-2 hover:bg-gray-100 rounded-md text-sm"
                    >
                      {search}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Search by category */}
            {!query && (
              <div className="p-2 border-t">
                <p className="text-xs font-medium text-gray-500 px-2 py-1">
                  Browse by category
                </p>
                <div className="grid grid-cols-2 gap-2 p-2">
                  <button
                    onClick={() => window.location.href = '/jobs?category=construction'}
                    className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-md text-sm"
                  >
                    <Briefcase className="h-4 w-4 text-gray-400" />
                    Construction
                  </button>
                  <button
                    onClick={() => window.location.href = '/jobs?category=manufacturing'}
                    className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-md text-sm"
                  >
                    <Briefcase className="h-4 w-4 text-gray-400" />
                    Manufacturing
                  </button>
                  <button
                    onClick={() => window.location.href = '/jobs?location=denver'}
                    className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-md text-sm"
                  >
                    <MapPin className="h-4 w-4 text-gray-400" />
                    Denver
                  </button>
                  <button
                    onClick={() => window.location.href = '/jobs?location=colorado-springs'}
                    className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-md text-sm"
                  >
                    <MapPin className="h-4 w-4 text-gray-400" />
                    Colorado Springs
                  </button>
                </div>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
```

### 4. Create Saved Searches Component

Create `components/Public/SavedSearches.tsx`:

```typescript
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Bell, Search, Trash2, Mail } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface SavedSearch {
  id: string;
  name: string;
  query: string;
  filters: Record<string, any>;
  emailAlert: boolean;
  createdAt: string;
}

export default function SavedSearches() {
  const { toast } = useToast();
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);

  useEffect(() => {
    // Load saved searches from localStorage
    const saved = localStorage.getItem('savedJobSearches');
    if (saved) {
      setSavedSearches(JSON.parse(saved));
    }
  }, []);

  const toggleEmailAlert = (id: string) => {
    const updated = savedSearches.map(search => 
      search.id === id 
        ? { ...search, emailAlert: !search.emailAlert }
        : search
    );
    setSavedSearches(updated);
    localStorage.setItem('savedJobSearches', JSON.stringify(updated));
    
    const search = updated.find(s => s.id === id);
    toast({
      title: search?.emailAlert ? 'Email alerts enabled' : 'Email alerts disabled',
      description: search?.emailAlert 
        ? `You'll receive daily updates for "${search.name}"`
        : `Email alerts turned off for "${search?.name}"`,
    });
  };

  const deleteSearch = (id: string) => {
    const updated = savedSearches.filter(search => search.id !== id);
    setSavedSearches(updated);
    localStorage.setItem('savedJobSearches', JSON.stringify(updated));
    
    toast({
      title: 'Search deleted',
      description: 'Your saved search has been removed.',
    });
  };

  const runSearch = (search: SavedSearch) => {
    const params = new URLSearchParams(search.filters);
    window.location.href = `/jobs?${params.toString()}`;
  };

  if (savedSearches.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <Bell className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <h3 className="font-medium mb-1">No saved searches</h3>
          <p className="text-sm text-gray-600">
            Save your searches to get notified about new jobs
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Saved Searches</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {savedSearches.map((search) => (
          <div
            key={search.id}
            className="border rounded-lg p-4 space-y-3 hover:bg-gray-50"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="font-medium">{search.name}</h4>
                <p className="text-sm text-gray-600 mt-1">
                  {search.query || 'All jobs'}
                </p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {Object.entries(search.filters).map(([key, value]) => {
                    if (value && key !== 'q') {
                      return (
                        <Badge key={key} variant="secondary" className="text-xs">
                          {key}: {value}
                        </Badge>
                      );
                    }
                    return null;
                  })}
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => deleteSearch(search.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex items-center justify-between pt-2 border-t">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-gray-400" />
                <span className="text-sm">Email alerts</span>
                <Switch
                  checked={search.emailAlert}
                  onCheckedChange={() => toggleEmailAlert(search.id)}
                />
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => runSearch(search)}
              >
                <Search className="h-4 w-4 mr-1" />
                Run Search
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
```

### 5. Create Filter Tags Component

Create `components/Public/FilterTags.tsx`:

```typescript
'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X, RotateCcw } from 'lucide-react';

interface FilterTagsProps {
  filters: Record<string, any>;
  onRemove: (key: string) => void;
  onClearAll: () => void;
}

const filterLabels: Record<string, string> = {
  category: 'Category',
  location: 'Location',
  jobType: 'Job Type',
  experienceLevel: 'Experience',
  salaryMin: 'Min Salary',
  salaryMax: 'Max Salary',
  remoteOnly: 'Remote Only',
  urgentOnly: 'Urgent Only',
  datePosted: 'Posted',
};

const datePostedLabels: Record<string, string> = {
  '1': 'Last 24 hours',
  '3': 'Last 3 days',
  '7': 'Last week',
  '14': 'Last 2 weeks',
  '30': 'Last month',
};

export default function FilterTags({ filters, onRemove, onClearAll }: FilterTagsProps) {
  const activeFilters = Object.entries(filters).filter(([key, value]) => {
    if (key === 'salaryMin' && value === 0) return false;
    if (key === 'salaryMax' && value === 200000) return false;
    return value && value !== '';
  });

  if (activeFilters.length === 0) return null;

  const formatValue = (key: string, value: any): string => {
    switch (key) {
      case 'salaryMin':
      case 'salaryMax':
        return `${value.toLocaleString()}`;
      case 'remoteOnly':
      case 'urgentOnly':
        return value ? 'Yes' : 'No';
      case 'datePosted':
        return datePostedLabels[value] || value;
      default:
        return value;
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2 p-4 bg-gray-50 rounded-lg">
      <span className="text-sm font-medium text-gray-700">Active filters:</span>
      
      {activeFilters.map(([key, value]) => (
        <Badge
          key={key}
          variant="secondary"
          className="pl-3 pr-1 py-1 flex items-center gap-1"
        >
          <span className="text-xs">
            {filterLabels[key] || key}: {formatValue(key, value)}
          </span>
          <button
            onClick={() => onRemove(key)}
            className="ml-1 hover:bg-gray-300 rounded p-0.5"
          >
            <X className="h-3 w-3" />
          </button>
        </Badge>
      ))}
      
      <Button
        variant="ghost"
        size="sm"
        onClick={onClearAll}
        className="ml-2"
      >
        <RotateCcw className="h-3 w-3 mr-1" />
        Clear all
      </Button>
    </div>
  );
}
```

### 6. Create Debounce Hook

Create `hooks/useDebounce.ts`:

```typescript
import { useEffect, useState } from 'react';

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

### 7. Create Search Analytics Hook

Create `hooks/useSearchAnalytics.ts`:

```typescript
import { useEffect } from 'react';

interface SearchEvent {
  query: string;
  filters: Record<string, any>;
  resultCount: number;
  timestamp: string;
}

export function useSearchAnalytics() {
  const trackSearch = (query: string, filters: Record<string, any>, resultCount: number) => {
    // Save to localStorage for local analytics
    const searchHistory = localStorage.getItem('searchHistory');
    const history: SearchEvent[] = searchHistory ? JSON.parse(searchHistory) : [];
    
    const event: SearchEvent = {
      query,
      filters,
      resultCount,
      timestamp: new Date().toISOString(),
    };
    
    history.unshift(event);
    
    // Keep only last 100 searches
    if (history.length > 100) {
      history.pop();
    }
    
    localStorage.setItem('searchHistory', JSON.stringify(history));
    
    // Track in Google Analytics if available
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'search', {
        search_term: query,
        result_count: resultCount,
        filters: JSON.stringify(filters),
      });
    }
  };

  const getPopularSearches = (): string[] => {
    const searchHistory = localStorage.getItem('searchHistory');
    if (!searchHistory) return [];
    
    const history: SearchEvent[] = JSON.parse(searchHistory);
    const searchCounts = history.reduce((acc, event) => {
      if (event.query) {
        acc[event.query] = (acc[event.query] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(searchCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([query]) => query);
  };

  const getSearchInsights = () => {
    const searchHistory = localStorage.getItem('searchHistory');
    if (!searchHistory) return null;
    
    const history: SearchEvent[] = JSON.parse(searchHistory);
    
    // Calculate average results per search
    const avgResults = history.reduce((sum, event) => sum + event.resultCount, 0) / history.length;
    
    // Find most common filters
    const filterCounts: Record<string, number> = {};
    history.forEach(event => {
      Object.keys(event.filters).forEach(filter => {
        if (event.filters[filter]) {
          filterCounts[filter] = (filterCounts[filter] || 0) + 1;
        }
      });
    });
    
    return {
      totalSearches: history.length,
      averageResults: Math.round(avgResults),
      popularFilters: Object.entries(filterCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([filter]) => filter),
    };
  };

  return {
    trackSearch,
    getPopularSearches,
    getSearchInsights,
  };
}
```

### 8. Update Job Listing Page with Advanced Search

Update `app/(public)/jobs/page.tsx` to include the new search components:

```typescript
import { Suspense } from 'react';
import { Metadata } from 'next';
import AdvancedSearch from '@/components/Public/AdvancedSearch';
import SearchResults from '@/components/Public/SearchResults';
import SavedSearches from '@/components/Public/SavedSearches';
import FilterTags from '@/components/Public/FilterTags';
import JobListingSkeleton from '@/components/Public/JobListingSkeleton';
import PageContainer from '@/components/Shared/PageContainer';
import { getJobs, getCategories } from '@/lib/sanity-utils';

export const metadata: Metadata = {
  title: 'Search Jobs - Find Your Next Opportunity',
  description: 'Search thousands of blue-collar jobs across Colorado. Filter by location, salary, experience level, and more.',
};

interface JobsPageProps {
  searchParams: {
    q?: string;
    category?: string;
    location?: string;
    type?: string;
    level?: string;
    minSalary?: string;
    maxSalary?: string;
    remote?: string;
    urgent?: string;
    posted?: string;
    page?: string;
  };
}

export default async function JobsPage({ searchParams }: JobsPageProps) {
  const filters = {
    keyword: searchParams.q || '',
    category: searchParams.category || '',
    location: searchParams.location || '',
    jobType: searchParams.type || '',
    experienceLevel: searchParams.level || '',
    salaryMin: parseInt(searchParams.minSalary || '0'),
    salaryMax: parseInt(searchParams.maxSalary || '200000'),
    remoteOnly: searchParams.remote === 'true',
    urgentOnly: searchParams.urgent === 'true',
    datePosted: searchParams.posted || '',
  };

  const page = parseInt(searchParams.page || '1');

  // Apply date filter
  let dateFilter = {};
  if (filters.datePosted) {
    const days = parseInt(filters.datePosted);
    const date = new Date();
    date.setDate(date.getDate() - days);
    dateFilter = { publishedAt: { $gte: date.toISOString() } };
  }

  const [jobsData, categories] = await Promise.all([
    getJobs({
      page,
      ...filters,
      ...dateFilter,
    }),
    getCategories(),
  ]);

  return (
    <PageContainer>
      <div className="grid lg:grid-cols-4 gap-6">
        {/* Left Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          <SavedSearches />
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Search */}
          <AdvancedSearch 
            categories={categories}
            onSearch={() => {}} // URL updates handle the search
          />

          {/* Active Filters */}
          <FilterTags
            filters={filters}
            onRemove={(key) => {
              const params = new URLSearchParams(window.location.search);
              params.delete(key);
              window.location.href = `/jobs?${params.toString()}`;
            }}
            onClearAll={() => {
              window.location.href = '/jobs';
            }}
          />

          {/* Results */}
          <Suspense fallback={<JobListingSkeleton />}>
            <SearchResults
              jobs={jobsData.jobs}
              filters={filters}
              isLoading={false}
            />
          </Suspense>
        </div>
      </div>
    </PageContainer>
  );
}
```

### 9. Create Search API Route (Optional)

Create `app/api/search/route.ts` for server-side search:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { client } from '@/lib/sanity';
import Fuse from 'fuse.js';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('q') || '';
  const category = searchParams.get('category') || '';
  const location = searchParams.get('location') || '';

  try {
    // Fetch all jobs for searching
    const jobs = await client.fetch(`
      *[_type == "jobPosting" && status == "published"] {
        _id,
        title,
        slug,
        description,
        company->{name},
        location,
        category->{name, slug},
        salaryMin,
        salaryMax,
        jobType,
        experienceLevel,
        skills,
        publishedAt
      }
    `);

    // Apply Fuse.js search if query provided
    let results = jobs;
    if (query) {
      const fuse = new Fuse(jobs, {
        keys: [
          { name: 'title', weight: 0.4 },
          { name: 'company.name', weight: 0.3 },
          { name: 'skills', weight: 0.2 },
          { name: 'description', weight: 0.1 },
        ],
        threshold: 0.3,
      });
      results = fuse.search(query).map(result => result.item);
    }

    // Apply additional filters
    if (category) {
      results = results.filter(job => job.category?.slug?.current === category);
    }
    if (location) {
      results = results.filter(job => 
        job.location?.city?.toLowerCase() === location.toLowerCase()
      );
    }

    return NextResponse.json({
      results,
      total: results.length,
      query,
      filters: { category, location },
    });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: 'Search failed' },
      { status: 500 }
    );
  }
}
```

## Verification Steps

1. **Test Search Functionality:**
   - Try different search terms
   - Verify fuzzy matching works
   - Check search suggestions

2. **Test Filters:**
   - Apply multiple filters
   - Verify URL updates correctly
   - Check filter persistence

3. **Test Saved Searches:**
   - Save a search
   - Toggle email alerts
   - Run saved searches

4. **Test Performance:**
   - Search with many results
   - Check debouncing works
   - Verify no unnecessary API calls

## Common Issues & Solutions

### Issue: Search too slow
**Solution:** Implement server-side search with proper indexing or use Algolia

### Issue: Filters not syncing with URL
**Solution:** Ensure all filter changes update URL params

### Issue: Search suggestions not relevant
**Solution:** Adjust Fuse.js weights and threshold values

## Next Steps

Proceed to [DOC-010: Company Pages](doc-010-companies.md) to create company profiles and listings.

## Notes for Claude Code

When implementing search:
1. Test with various edge cases (empty results, special characters)
2. Ensure mobile keyboard behavior is correct
3. Verify search analytics tracking works
4. Test filter combinations thoroughly
5. Check performance with large datasets"