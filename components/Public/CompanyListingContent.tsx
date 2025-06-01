'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import CompanyCard from './CompanyCard';
import { Company } from '@/types';
import { Search, Building2, Filter } from 'lucide-react';

interface CompanyListingContentProps {
  companies: Company[];
  currentPage: number;
  filters: {
    search: string;
    size: string;
    location: string;
    verifiedOnly: boolean;
  };
}

const companySizes = [
  { value: '', label: 'All sizes' },
  { value: '1-10', label: '1-10 employees' },
  { value: '11-50', label: '11-50 employees' },
  { value: '51-200', label: '51-200 employees' },
  { value: '200+', label: '200+ employees' },
];

const locations = [
  { value: '', label: 'All locations' },
  { value: 'denver', label: 'Denver' },
  { value: 'colorado-springs', label: 'Colorado Springs' },
  { value: 'aurora', label: 'Aurora' },
  { value: 'fort-collins', label: 'Fort Collins' },
  { value: 'boulder', label: 'Boulder' },
];

export default function CompanyListingContent({
  companies,
  currentPage,
  filters,
}: CompanyListingContentProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(filters.search);
  const [showFilters, setShowFilters] = useState(false);

  const updateSearchParams = (newParams: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());
    
    Object.entries(newParams).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });

    router.push(`/companies?${params.toString()}`);
  };

  const handleSearch = () => {
    updateSearchParams({ search: searchTerm, page: '1' });
  };

  const handleFilterChange = (key: string, value: string | boolean) => {
    updateSearchParams({ 
      [key]: value.toString(), 
      page: '1' 
    });
  };

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  placeholder="Search companies..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="pl-10"
                />
              </div>
              <Button onClick={handleSearch}>Search</Button>
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
            </div>

            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
                <div>
                  <Label htmlFor="size">Company Size</Label>
                  <Select
                    value={filters.size}
                    onValueChange={(value) => handleFilterChange('size', value)}
                  >
                    <SelectTrigger id="size">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {companySizes.map((size) => (
                        <SelectItem key={size.value} value={size.value}>
                          {size.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="location">Location</Label>
                  <Select
                    value={filters.location}
                    onValueChange={(value) => handleFilterChange('location', value)}
                  >
                    <SelectTrigger id="location">
                      <SelectValue />
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

                <div className="flex items-end">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="verified"
                      checked={filters.verifiedOnly}
                      onCheckedChange={(checked) => handleFilterChange('verified', checked)}
                    />
                    <Label htmlFor="verified" className="cursor-pointer">
                      Verified companies only
                    </Label>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {companies.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">No companies found matching your criteria.</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => router.push('/companies')}
            >
              Clear filters
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Company Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {companies.map((company) => (
              <CompanyCard key={company._id} company={company} />
            ))}
          </div>

          {/* Pagination */}
          <div className="flex justify-center gap-2">
            <Button
              variant="outline"
              disabled={currentPage === 1}
              onClick={() => updateSearchParams({ page: String(currentPage - 1) })}
            >
              Previous
            </Button>
            <span className="flex items-center px-4">
              Page {currentPage}
            </span>
            <Button
              variant="outline"
              disabled={companies.length < 20}
              onClick={() => updateSearchParams({ page: String(currentPage + 1) })}
            >
              Next
            </Button>
          </div>
        </>
      )}
    </div>
  );
}