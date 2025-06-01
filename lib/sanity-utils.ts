import { client, sanityFetch } from './sanity';
import * as queries from './queries';
import type { Job, Company, JobApplication, JobCategory } from '@/types';

// Job fetching functions
export async function getJobs(params: {
  page?: number;
  pageSize?: number;
  category?: string;
  location?: string;
  jobType?: string;
  experienceLevel?: string;
  salaryMin?: number;
  search?: string;
}) {
  const {
    page = 1,
    pageSize = 20,
    category = '',
    location = '',
    jobType = '',
    experienceLevel = '',
    salaryMin = 0,
    search = '',
  } = params;

  const [jobs, total] = await Promise.all([
    sanityFetch<Job[]>(queries.jobsQuery, {
      page,
      pageSize,
      category,
      location,
      jobType,
      experienceLevel,
      salaryMin,
      search: search ? `*${search}*` : '',
    }, ['jobs']),
    sanityFetch<number>(queries.jobsCountQuery, {
      category,
      location,
      jobType,
      experienceLevel,
      salaryMin,
      search: search ? `*${search}*` : '',
    }, ['jobs']),
  ]);

  return {
    jobs,
    total,
    pages: Math.ceil(total / pageSize),
  };
}

export async function getJobBySlug(slug: string): Promise<Job | null> {
  const job = await sanityFetch<Job>(
    queries.jobBySlugQuery,
    { slug },
    ['jobs', `job-${slug}`]
  );
  
  // Increment view count
  if (job) {
    await client
      .patch(job._id)
      .inc({ viewCount: 1 })
      .commit();
  }
  
  return job;
}

export async function getRelatedJobs(
  currentSlug: string,
  categoryId: string,
  city: string
): Promise<Job[]> {
  return sanityFetch<Job[]>(
    queries.relatedJobsQuery,
    { currentSlug, categoryId, city },
    ['jobs']
  );
}

// Company fetching functions
export async function getCompanies(params: {
  page?: number;
  pageSize?: number;
  search?: string;
  size?: string;
  location?: string;
}) {
  const {
    page = 1,
    pageSize = 20,
    search = '',
    size = '',
    location = '',
  } = params;

  const companies = await sanityFetch<Company[]>(
    queries.companiesQuery,
    {
      page,
      pageSize,
      search: search ? `*${search}*` : '',
      size,
      location,
    },
    ['companies']
  );

  return companies;
}

export async function getCompanyBySlug(slug: string): Promise<Company | null> {
  return sanityFetch<Company>(
    queries.companyBySlugQuery,
    { slug },
    ['companies', `company-${slug}`]
  );
}

// Application functions
export async function createApplication(data: {
  jobId: string;
  applicantInfo: {
    name: string;
    email: string;
    phone: string;
    resumeUrl?: string;
    linkedIn?: string;
  };
  coverMessage?: string;
}) {
  // Check if already applied
  const hasApplied = await sanityFetch<boolean>(
    queries.hasAppliedQuery,
    { jobId: data.jobId, email: data.applicantInfo.email }
  );

  if (hasApplied) {
    throw new Error('You have already applied to this job');
  }

  // Create application
  const application = await client.create({
    _type: 'jobApplication',
    job: { _ref: data.jobId },
    applicantInfo: data.applicantInfo,
    coverMessage: data.coverMessage,
    status: 'new',
    appliedDate: new Date().toISOString(),
  });

  // Increment application count
  await client
    .patch(data.jobId)
    .inc({ applicationCount: 1 })
    .commit();

  return application;
}

// Category functions
export async function getCategories(): Promise<JobCategory[]> {
  return sanityFetch<JobCategory[]>(
    queries.categoriesQuery,
    {},
    ['categories']
  );
}

export async function getPopularCategories(): Promise<JobCategory[]> {
  return sanityFetch<JobCategory[]>(
    queries.popularCategoriesQuery,
    {},
    ['categories']
  );
}

// Analytics functions
export async function getEmployerStats(userId: string) {
  return sanityFetch(
    queries.employerStatsQuery,
    { userId },
    ['analytics']
  );
}

export async function getRecentActivity(userId: string) {
  return sanityFetch(
    queries.recentActivityQuery,
    { userId },
    ['analytics']
  );
}