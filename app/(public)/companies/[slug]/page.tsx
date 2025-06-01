import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import CompanyDetailContent from '@/components/Public/CompanyDetailContent';
import CompanyJobs from '@/components/Public/CompanyJobs';
import PageContainer from '@/components/Shared/PageContainer';
import { getCompanyBySlug, getJobsByCompany } from '@/lib/sanity-utils';
import { urlFor } from '@/lib/sanity';
import { client } from '@/lib/sanity.client';

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