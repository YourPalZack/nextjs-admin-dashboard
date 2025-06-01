import { Suspense } from 'react';
import { Metadata } from 'next';
import JobListingContent from '@/components/Public/JobListingContent';
import JobListingSkeleton from '@/components/Public/JobListingSkeleton';
import PageContainer from '@/components/Shared/PageContainer';
import { getJobs, getCategories } from '@/lib/sanity-utils';
import { mockJobs, mockCategories } from '@/components/Public/mock-data';

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

  // Fetch data - handle errors gracefully for development
  let jobsData: { jobs: any[]; total: number; pages: number };
  let categories: any[];
  
  try {
    [jobsData, categories] = await Promise.all([
      getJobs({ page, ...filters }),
      getCategories(),
    ]);
  } catch (error) {
    console.error('Error fetching jobs:', error);
    // Fallback to mock data during development
    jobsData = {
      jobs: mockJobs,
      total: mockJobs.length,
      pages: 1
    };
    categories = mockCategories;
  }

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