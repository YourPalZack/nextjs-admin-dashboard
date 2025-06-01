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
  try {
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
  } catch (error) {
    console.error('Error fetching job by slug:', error);
    // In development, you might want to return mock data
    // For production, return null to show 404
    return null;
  }
}

export async function getRelatedJobs(
  currentSlug: string,
  categoryId: string,
  city: string
): Promise<Job[]> {
  try {
    return await sanityFetch<Job[]>(
      queries.relatedJobsQuery,
      { currentSlug, categoryId, city },
      ['jobs']
    );
  } catch (error) {
    console.error('Error fetching related jobs:', error);
    return [];
  }
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

  try {
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
  } catch (error) {
    console.error('Error fetching companies from Sanity, using mock data:', error);
    // Fallback to mock data
    const { mockCompanies } = await import('@/components/Public/mock-data');
    
    // Apply basic filtering to mock data
    let filteredCompanies = mockCompanies;
    
    if (search) {
      filteredCompanies = filteredCompanies.filter(company =>
        company.name.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    if (size) {
      filteredCompanies = filteredCompanies.filter(company => company.size === size);
    }
    
    if (location) {
      filteredCompanies = filteredCompanies.filter(company =>
        company.locations?.some(loc => 
          loc.city.toLowerCase().includes(location.toLowerCase())
        )
      );
    }
    
    // Apply pagination
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    
    return filteredCompanies.slice(startIndex, endIndex);
  }
}

export async function getCompanyBySlug(slug: string): Promise<Company | null> {
  try {
    return await sanityFetch<Company>(
      queries.companyBySlugQuery,
      { slug },
      ['companies', `company-${slug}`]
    );
  } catch (error) {
    console.error('Error fetching company from Sanity, using mock data:', error);
    // Fallback to mock data
    const { mockCompanies } = await import('@/components/Public/mock-data');
    return mockCompanies.find(company => company.slug.current === slug) || null;
  }
}

export async function getJobsByCompany(companySlug: string): Promise<Job[]> {
  try {
    return await sanityFetch<Job[]>(
      queries.jobsByCompanyQuery,
      { companySlug },
      ['jobs', `company-${companySlug}`]
    );
  } catch (error) {
    console.error('Error fetching company jobs from Sanity, using mock data:', error);
    // Fallback to mock data
    const { mockJobs } = await import('@/components/Public/mock-data');
    return mockJobs.filter(job => job.company.slug.current === companySlug);
  }
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
  try {
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
  } catch (error) {
    console.error('Error creating application:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to submit application. Please try again.');
  }
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