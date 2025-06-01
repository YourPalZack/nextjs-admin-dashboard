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