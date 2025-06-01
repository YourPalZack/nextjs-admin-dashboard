# DOC-010: Company Pages

## Overview
Create company directory and individual company profile pages with job listings.

## Prerequisites
- Job pages complete (from DOC-007 & DOC-008)
- Sanity schemas configured (from DOC-002)
- Authentication working (from DOC-004)

## Steps

### 1. Create Company Listing Page

Create `app/(public)/companies/page.tsx`:

```typescript
import { Metadata } from 'next';
import { Suspense } from 'react';
import CompanyListingContent from '@/components/Public/CompanyListingContent';
import CompanyListingSkeleton from '@/components/Public/CompanyListingSkeleton';
import PageContainer from '@/components/Shared/PageContainer';
import { getCompanies } from '@/lib/sanity-utils';

export const metadata: Metadata = {
  title: 'Companies Hiring in Colorado',
  description: 'Browse companies actively hiring for blue-collar and skilled trade positions across Colorado.',
};

interface CompaniesPageProps {
  searchParams: {
    page?: string;
    search?: string;
    size?: string;
    location?: string;
    verified?: string;
  };
}

export default async function CompaniesPage({ searchParams }: CompaniesPageProps) {
  const page = parseInt(searchParams.page || '1');
  const filters = {
    search: searchParams.search || '',
    size: searchParams.size || '',
    location: searchParams.location || '',
    verifiedOnly: searchParams.verified === 'true',
  };

  const companies = await getCompanies({
    page,
    pageSize: 20,
    ...filters,
  });

  return (
    <PageContainer>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Companies Hiring in Colorado
          </h1>
          <p className="mt-2 text-gray-600">
            Discover employers looking for skilled workers like you
          </p>
        </div>

        {/* Content */}
        <Suspense fallback={<CompanyListingSkeleton />}>
          <CompanyListingContent
            companies={companies}
            currentPage={page}
            filters={filters}
          />
        </Suspense>
      </div>
    </PageContainer>
  );
}
```

### 2. Create Company Listing Content Component

Create `components/Public/CompanyListingContent.tsx`:

```typescript
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
```

### 3. Create Company Card Component

Create `components/Public/CompanyCard.tsx`:

```typescript
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Building2, 
  MapPin, 
  Users, 
  Briefcase, 
  CheckCircle2,
  ExternalLink 
} from 'lucide-react';
import { Company } from '@/types';
import { urlFor } from '@/lib/sanity';

interface CompanyCardProps {
  company: Company;
}

export default function CompanyCard({ company }: CompanyCardProps) {
  return (
    <Card className="h-full hover:shadow-lg transition-shadow">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            {company.logo ? (
              <Image
                src={urlFor(company.logo).width(64).height(64).url()}
                alt={company.name}
                width={64}
                height={64}
                className="rounded-lg"
              />
            ) : (
              <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                <Building2 className="h-8 w-8 text-gray-400" />
              </div>
            )}
            <div>
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <Link
                  href={`/companies/${company.slug.current}`}
                  className="hover:text-blue-600 transition-colors"
                >
                  {company.name}
                </Link>
                {company.verified && (
                  <CheckCircle2 className="h-5 w-5 text-blue-500" />
                )}
              </h3>
              {company.size && (
                <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                  <Users className="h-4 w-4" />
                  {company.size} employees
                </p>
              )}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Locations */}
        {company.locations && company.locations.length > 0 && (
          <div className="flex items-start gap-2">
            <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
            <div className="flex flex-wrap gap-1">
              {company.locations.slice(0, 3).map((location, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {location.city}
                </Badge>
              ))}
              {company.locations.length > 3 && (
                <Badge variant="secondary" className="text-xs">
                  +{company.locations.length - 3} more
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Active Jobs */}
        <div className="flex items-center gap-2 text-sm">
          <Briefcase className="h-4 w-4 text-gray-400" />
          <span>
            <span className="font-medium">{company.jobCount || 0}</span> open positions
          </span>
        </div>

        {/* Benefits Preview */}
        {company.benefitsOffered && company.benefitsOffered.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {company.benefitsOffered.slice(0, 3).map((benefit) => (
              <Badge key={benefit} variant="outline" className="text-xs">
                {benefit}
              </Badge>
            ))}
            {company.benefitsOffered.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{company.benefitsOffered.length - 3}
              </Badge>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Link href={`/companies/${company.slug.current}`} className="flex-1">
            <Button variant="default" className="w-full">
              View Jobs
            </Button>
          </Link>
          {company.website && (
            <Button
              variant="outline"
              size="icon"
              onClick={() => window.open(company.website, '_blank')}
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
```

### 4. Create Company Detail Page

Create `app/(public)/companies/[slug]/page.tsx`:

```typescript
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import CompanyDetailContent from '@/components/Public/CompanyDetailContent';
import CompanyJobs from '@/components/Public/CompanyJobs';
import PageContainer from '@/components/Shared/PageContainer';
import { getCompanyBySlug, getJobsByCompany } from '@/lib/sanity-utils';
import { urlFor } from '@/lib/sanity';

interface CompanyDetailPageProps {
  params: {
    slug: string;
  };
}

export async function generateStaticParams() {
  const companies = await client.fetch(`
    *[_type == "company"] {
      "slug": slug.current
    }
  `);

  return companies.map((company: any) => ({
    slug: company.slug,
  }));
}

export async function generateMetadata({
  params,
}: CompanyDetailPageProps): Promise<Metadata> {
  const company = await getCompanyBySlug(params.slug);

  if (!company) {
    return {
      title: 'Company Not Found',
    };
  }

  const description = company.description?.[0]?.children?.[0]?.text || 
    `Learn about ${company.name} and explore their open positions in Colorado.`;

  return {
    title: `${company.name} - Jobs & Company Information`,
    description: description.substring(0, 160),
    openGraph: {
      title: company.name,
      description: description.substring(0, 160),
      type: 'website',
      images: company.logo ? [urlFor(company.logo).url()] : [],
    },
  };
}

export default async function CompanyDetailPage({ params }: CompanyDetailPageProps) {
  const [company, jobs] = await Promise.all([
    getCompanyBySlug(params.slug),
    getJobsByCompany(params.slug),
  ]);

  if (!company) {
    notFound();
  }

  return (
    <PageContainer>
      <div className="space-y-8">
        {/* Company Info */}
        <CompanyDetailContent company={company} />

        {/* Job Listings */}
        <div>
          <h2 className="text-2xl font-bold mb-6">
            Open Positions ({jobs.length})
          </h2>
          <CompanyJobs jobs={jobs} companyName={company.name} />
        </div>
      </div>
    </PageContainer>
  );
}
```

### 5. Create Company Detail Content Component

Create `components/Public/CompanyDetailContent.tsx`:

```typescript
'use client';

import Image from 'next/image';
import { PortableText } from '@portabletext/react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Building2,
  MapPin,
  Users,
  Globe,
  Mail,
  Phone,
  CheckCircle2,
  Calendar,
  Briefcase,
  Star,
} from 'lucide-react';
import { Company } from '@/types';
import { urlFor } from '@/lib/sanity';
import { format } from 'date-fns';

interface CompanyDetailContentProps {
  company: Company;
}

export default function CompanyDetailContent({ company }: CompanyDetailContentProps) {
  const handleWebsiteClick = () => {
    if (company.website) {
      window.open(company.website, '_blank');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card>
        <CardContent className="p-8">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Logo */}
            <div className="flex-shrink-0">
              {company.logo ? (
                <Image
                  src={urlFor(company.logo).width(120).height(120).url()}
                  alt={company.name}
                  width={120}
                  height={120}
                  className="rounded-lg"
                />
              ) : (
                <div className="w-30 h-30 bg-gray-100 rounded-lg flex items-center justify-center">
                  <Building2 className="h-12 w-12 text-gray-400" />
                </div>
              )}
            </div>

            {/* Company Info */}
            <div className="flex-1 space-y-4">
              <div>
                <h1 className="text-3xl font-bold flex items-center gap-3">
                  {company.name}
                  {company.verified && (
                    <Badge variant="default" className="gap-1">
                      <CheckCircle2 className="h-4 w-4" />
                      Verified Employer
                    </Badge>
                  )}
                </h1>
                
                {/* Quick Stats */}
                <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-600">
                  {company.size && (
                    <span className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {company.size} employees
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Briefcase className="h-4 w-4" />
                    {company.jobCount || 0} open positions
                  </span>
                  {company.createdAt && (
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      Member since {format(new Date(company.createdAt), 'yyyy')}
                    </span>
                  )}
                </div>
              </div>

              {/* Contact Info */}
              <div className="flex flex-wrap gap-4">
                {company.website && (
                  <Button variant="default" onClick={handleWebsiteClick}>
                    <Globe className="h-4 w-4 mr-2" />
                    Visit Website
                  </Button>
                )}
                {company.email && (
                  <Button variant="outline" onClick={() => window.location.href = `mailto:${company.email}`}>
                    <Mail className="h-4 w-4 mr-2" />
                    Contact
                  </Button>
                )}
                {company.phone && (
                  <Button variant="outline" onClick={() => window.location.href = `tel:${company.phone}`}>
                    <Phone className="h-4 w-4 mr-2" />
                    {company.phone}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* About Section */}
      {company.description && (
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold">About {company.name}</h2>
          </CardHeader>
          <CardContent>
            <div className="prose prose-gray max-w-none">
              <PortableText value={company.description} />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Locations */}
      {company.locations && company.locations.length > 0 && (
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold">Locations</h2>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {company.locations.map((location, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-4 border rounded-lg"
                >
                  <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="font-medium">{location.city}</p>
                    {location.state && (
                      <p className="text-sm text-gray-600">
                        {location.state} {location.zipCode}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Benefits */}
      {company.benefitsOffered && company.benefitsOffered.length > 0 && (
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold">Benefits & Perks</h2>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {company.benefitsOffered.map((benefit) => (
                <div key={benefit} className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                  <span>{benefit}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Company Culture (if you add this to schema) */}
      {company.activeJobs && company.activeJobs.length > 0 && (
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold">Currently Hiring For</h2>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {Array.from(new Set(company.activeJobs.map(job => job.category))).map((category) => (
                <Badge key={category} variant="secondary">
                  {category}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
```

### 6. Create Company Jobs Component

Create `components/Public/CompanyJobs.tsx`:

```typescript
'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import JobCard from './JobCard';
import { Job } from '@/types';
import { Briefcase } from 'lucide-react';

interface CompanyJobsProps {
  jobs: Job[];
  companyName: string;
}

export default function CompanyJobs({ jobs, companyName }: CompanyJobsProps) {
  const [filter, setFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('newest');

  // Filter jobs
  const filteredJobs = jobs.filter(job => {
    if (filter === 'all') return true;
    if (filter === 'urgent') return job.isUrgent;
    if (filter === 'remote') return job.remoteOptions !== 'onsite';
    return job.jobType === filter;
  });

  // Sort jobs
  const sortedJobs = [...filteredJobs].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
      case 'salary':
        return (b.salaryMax || b.salaryMin || 0) - (a.salaryMax || a.salaryMin || 0);
      default:
        return 0;
    }
  });

  if (jobs.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600">
            No open positions at {companyName} right now.
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Check back soon or set up job alerts to be notified of new openings.
          </p>
          <Button variant="outline" className="mt-4">
            Set Up Job Alert
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Jobs</SelectItem>
            <SelectItem value="full-time">Full-time</SelectItem>
            <SelectItem value="part-time">Part-time</SelectItem>
            <SelectItem value="contract">Contract</SelectItem>
            <SelectItem value="urgent">Urgent Hiring</SelectItem>
            <SelectItem value="remote">Remote Available</SelectItem>
          </SelectContent>
        </Select>

        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest First</SelectItem>
            <SelectItem value="salary">Highest Salary</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex-1 text-right">
          <p className="text-sm text-gray-600">
            Showing {sortedJobs.length} of {jobs.length} positions
          </p>
        </div>
      </div>

      {/* Job List */}
      <div className="space-y-4">
        {sortedJobs.map((job) => (
          <JobCard key={job._id} job={job} />
        ))}
      </div>
    </div>
  );
}
```

### 7. Create Company Listing Skeleton

Create `components/Public/CompanyListingSkeleton.tsx`:

```typescript
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function CompanyListingSkeleton() {
  return (
    <div className="space-y-6">
      {/* Search Skeleton */}
      <Card>
        <CardContent className="p-6">
          <div className="flex gap-4">
            <Skeleton className="h-10 flex-1" />
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-24" />
          </div>
        </CardContent>
      </Card>

      {/* Company Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <div className="flex items-start gap-3">
                <Skeleton className="h-16 w-16 rounded-lg" />
                <div className="space-y-2">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <div className="flex gap-2">
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-6 w-16" />
              </div>
              <Skeleton className="h-10 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
```

### 8. Create Company Follow Feature

Create `components/Public/CompanyFollowButton.tsx`:

```typescript
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Bell, BellOff, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface CompanyFollowButtonProps {
  companyId: string;
  companyName: string;
  variant?: 'default' | 'outline';
  size?: 'default' | 'sm' | 'lg';
}

export default function CompanyFollowButton({
  companyId,
  companyName,
  variant = 'outline',
  size = 'default',
}: CompanyFollowButtonProps) {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [isFollowing, setIsFollowing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check if following in localStorage
    const followedCompanies = JSON.parse(
      localStorage.getItem('followedCompanies') || '[]'
    );
    setIsFollowing(followedCompanies.includes(companyId));
  }, [companyId]);

  const handleFollow = async () => {
    if (!session) {
      toast({
        title: 'Sign in required',
        description: 'Please sign in to follow companies and receive job alerts.',
      });
      return;
    }

    setIsLoading(true);

    try {
      const followedCompanies = JSON.parse(
        localStorage.getItem('followedCompanies') || '[]'
      );

      if (isFollowing) {
        // Unfollow
        const updated = followedCompanies.filter((id: string) => id !== companyId);
        localStorage.setItem('followedCompanies', JSON.stringify(updated));
        setIsFollowing(false);
        
        toast({
          title: 'Unfollowed',
          description: `You'll no longer receive alerts from ${companyName}.`,
        });
      } else {
        // Follow
        followedCompanies.push(companyId);
        localStorage.setItem('followedCompanies', JSON.stringify(followedCompanies));
        setIsFollowing(true);
        
        toast({
          title: 'Following!',
          description: `You'll be notified when ${companyName} posts new jobs.`,
        });
      }

      // In a real app, this would sync with the backend
      // await api.post('/api/companies/follow', { companyId, action: isFollowing ? 'unfollow' : 'follow' });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant={isFollowing ? 'default' : variant}
      size={size}
      onClick={handleFollow}
      disabled={isLoading}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : isFollowing ? (
        <>
          <BellOff className="h-4 w-4 mr-2" />
          Following
        </>
      ) : (
        <>
          <Bell className="h-4 w-4 mr-2" />
          Follow
        </>
      )}
    </Button>
  );
}
```

### 9. Add Company Follow to Detail Page

Update the Company Detail Content component to include the follow button:

```typescript
// Add to CompanyDetailContent.tsx in the header section
import CompanyFollowButton from './CompanyFollowButton';

// In the button group section:
<div className="flex flex-wrap gap-4">
  <CompanyFollowButton
    companyId={company._id}
    companyName={company.name}
    size="default"
  />
  {company.website && (
    <Button variant="outline" onClick={handleWebsiteClick}>
      <Globe className="h-4 w-4 mr-2" />
      Visit Website
    </Button>
  )}
  {/* ... other buttons */}
</div>
```

### 10. Create Company Stats Component

Create `components/Public/CompanyStats.tsx`:

```typescript
import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, Users, Briefcase, Calendar } from 'lucide-react';

interface CompanyStatsProps {
  stats: {
    totalJobs: number;
    totalHires: number;
    avgTimeToHire: number;
    growthRate: number;
  };
}

export default function CompanyStats({ stats }: CompanyStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Jobs</p>
              <p className="text-2xl font-bold">{stats.totalJobs}</p>
            </div>
            <Briefcase className="h-8 w-8 text-blue-500 opacity-20" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Hires</p>
              <p className="text-2xl font-bold">{stats.totalHires}</p>
            </div>
            <Users className="h-8 w-8 text-green-500 opacity-20" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg. Time to Hire</p>
              <p className="text-2xl font-bold">{stats.avgTimeToHire} days</p>
            </div>
            <Calendar className="h-8 w-8 text-orange-500 opacity-20" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Growth Rate</p>
              <p className="text-2xl font-bold">+{stats.growthRate}%</p>
            </div>
            <TrendingUp className="h-8 w-8 text-purple-500 opacity-20" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
```

## Verification Steps

1. **Test Company Listing:**
   - Browse all companies
   - Apply filters
   - Test search functionality
   - Verify pagination

2. **Test Company Details:**
   - View company profile
   - Check all sections display correctly
   - Test external links
   - Verify job listings

3. **Test Follow Feature:**
   - Follow/unfollow companies
   - Check persistence after refresh
   - Test without authentication

4. **Test Responsive Design:**
   - Mobile view for cards
   - Tablet breakpoints
   - Desktop layout

## Common Issues & Solutions

### Issue: Company logos not displaying
**Solution:** Ensure Sanity image URLs are properly configured with urlFor helper

### Issue: Follow state not persisting
**Solution:** Check localStorage implementation and consider backend sync

### Issue: Slow company page load
**Solution:** Implement static generation for company pages

## Next Steps

Proceed to [DOC-011: Application System](doc-011-applications.md) to implement the job application workflow.

## Notes for Claude Code

When implementing company pages:
1. Test with companies that have varying amounts of data
2. Ensure verified badge displays correctly
3. Test all external links open in new tabs
4. Verify job counts are accurate
5. Check that empty states handle gracefully