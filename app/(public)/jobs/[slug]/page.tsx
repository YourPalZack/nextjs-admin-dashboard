import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import JobDetailContent from '@/components/Public/JobDetailContent';
import JobDetailSkeleton from '@/components/Public/JobDetailSkeleton';
import RelatedJobs from '@/components/Public/RelatedJobs';
import ApplicationCard from '@/components/Public/ApplicationCard';
import JobStructuredData from '@/components/Public/JobStructuredData';
import PageContainer from '@/components/Shared/PageContainer';
import { getJobBySlug, getRelatedJobs } from '@/lib/sanity-utils';
import { client } from '@/lib/sanity';
import { urlFor } from '@/lib/sanity';
import { Job } from '@/types';

interface JobDetailPageProps {
  params: {
    slug: string;
  };
}

// Generate static params for all jobs
export async function generateStaticParams() {
  try {
    const jobs = await client.fetch(`
      *[_type == "jobPosting" && status == "published"] {
        "slug": slug.current
      }
    `);

    return jobs.map((job: any) => ({
      slug: job.slug,
    }));
  } catch (error) {
    console.error('Error generating static params:', error);
    return [];
  }
}

// Generate metadata for SEO
export async function generateMetadata({
  params,
}: JobDetailPageProps): Promise<Metadata> {
  try {
    const job = await getJobBySlug(params.slug);

    if (!job) {
      return {
        title: 'Job Not Found',
      };
    }

    const description = job.description?.[0]?.children?.[0]?.text || '';
    const salary = job.showSalary && job.salaryMin
      ? `$${job.salaryMin.toLocaleString()}${
          job.salaryMax ? `-${job.salaryMax.toLocaleString()}` : '+'
        } ${job.salaryType === 'hourly' ? '/hr' : '/yr'}`
      : '';

    return {
      title: `${job.title} at ${job.company.name}`,
      description: `${description.substring(0, 160)}... ${salary}`,
      openGraph: {
        title: job.title,
        description: description.substring(0, 160),
        type: 'website',
        images: job.company.logo ? [urlFor(job.company.logo).url()] : [],
      },
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: 'Job Not Found',
    };
  }
}

export default async function JobDetailPage({ params }: JobDetailPageProps) {
  const job = await getJobBySlug(params.slug);

  if (!job) {
    notFound();
  }

  // Fetch related jobs (handle cases where data might be incomplete)
  let relatedJobs: Job[] = [];
  try {
    relatedJobs = await getRelatedJobs(
      job.slug.current,
      job.category._id,
      job.location.city
    );
  } catch (error) {
    console.error('Error fetching related jobs:', error);
    // Continue without related jobs rather than failing the page
  }

  return (
    <>
      <JobStructuredData job={job} />
      <PageContainer>
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Suspense fallback={<JobDetailSkeleton />}>
              <JobDetailContent job={job} />
            </Suspense>
            
            {/* Related Jobs */}
            {relatedJobs.length > 0 && (
              <div className="mt-12">
                <h2 className="text-2xl font-bold mb-6">Similar Jobs</h2>
                <RelatedJobs jobs={relatedJobs} />
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <ApplicationCard job={job} />
            </div>
          </div>
        </div>
      </PageContainer>
    </>
  );
}