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