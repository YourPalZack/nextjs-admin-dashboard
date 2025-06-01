# DOC-005: Sanity Client & Queries

## Overview
Set up Sanity client configuration and create all GROQ queries needed for the job board with proper TypeScript types.

## Prerequisites
- Sanity project created and schemas deployed (from DOC-002)
- Environment variables configured (from DOC-003)
- TypeScript types defined (from DOC-001)

## Steps

### 1. Create Sanity Client

Create `lib/sanity.ts`:

```typescript
import { createClient } from '@sanity/client';
import imageUrlBuilder from '@sanity/image-url';
import { env } from './env';

// Initialize Sanity client
export const client = createClient({
  projectId: env.sanity.projectId,
  dataset: env.sanity.dataset,
  apiVersion: '2024-01-01',
  useCdn: process.env.NODE_ENV === 'production',
  token: env.sanity.apiToken, // Needed for mutations
});

// Image URL builder
const builder = imageUrlBuilder(client);

export function urlFor(source: any) {
  return builder.image(source);
}

// Revalidation helper for Next.js
export const sanityFetch = async <T = any>(
  query: string,
  params: Record<string, any> = {},
  tags: string[] = []
): Promise<T> => {
  return client.fetch<T>(query, params, {
    next: {
      revalidate: process.env.NODE_ENV === 'development' ? 0 : 60,
      tags,
    },
  });
};
```

### 2. Create Query Constants

Create `lib/queries/index.ts`:

```typescript
// Re-export all queries
export * from './jobs';
export * from './companies';
export * from './applications';
export * from './categories';
export * from './analytics';
```

### 3. Job Queries

Create `lib/queries/jobs.ts`:

```typescript
import groq from 'groq';

// Base job projection
const jobProjection = groq`
  _id,
  title,
  slug,
  description,
  requirements,
  responsibilities,
  salaryType,
  salaryMin,
  salaryMax,
  showSalary,
  location {
    city,
    county,
    zipCode,
    coordinates
  },
  remoteOptions,
  jobType,
  experienceLevel,
  benefits,
  skills,
  certifications,
  applicationDeadline,
  startDate,
  isUrgent,
  featured,
  status,
  viewCount,
  applicationCount,
  publishedAt,
  expiresAt,
  "category": category->{
    _id,
    name,
    slug
  },
  "company": company->{
    _id,
    name,
    slug,
    logo,
    verified,
    size,
    website
  }
`;

// Get all published jobs with filters
export const jobsQuery = groq`
  *[_type == "jobPosting" 
    && status == "published"
    && (expiresAt > now() || !defined(expiresAt))
    && ($category == "" || category->slug.current == $category)
    && ($location == "" || location.city == $location || location.county == $location)
    && ($jobType == "" || jobType == $jobType)
    && ($experienceLevel == "" || experienceLevel == $experienceLevel)
    && ($salaryMin == 0 || salaryMin >= $salaryMin)
    && ($search == "" || title match $search || company->name match $search)
  ] | order(
    featured desc,
    isUrgent desc,
    publishedAt desc
  ) [($page - 1) * $pageSize...$page * $pageSize] {
    ${jobProjection}
  }
`;

// Count total jobs for pagination
export const jobsCountQuery = groq`
  count(*[_type == "jobPosting" 
    && status == "published"
    && (expiresAt > now() || !defined(expiresAt))
    && ($category == "" || category->slug.current == $category)
    && ($location == "" || location.city == $location || location.county == $location)
    && ($jobType == "" || jobType == $jobType)
    && ($experienceLevel == "" || experienceLevel == $experienceLevel)
    && ($salaryMin == 0 || salaryMin >= $salaryMin)
    && ($search == "" || title match $search || company->name match $search)
  ])
`;

// Get single job by slug
export const jobBySlugQuery = groq`
  *[_type == "jobPosting" && slug.current == $slug][0] {
    ${jobProjection}
  }
`;

// Get related jobs
export const relatedJobsQuery = groq`
  *[_type == "jobPosting" 
    && status == "published"
    && slug.current != $currentSlug
    && (category._ref == $categoryId || location.city == $city)
  ] | order(publishedAt desc) [0...4] {
    ${jobProjection}
  }
`;

// Get jobs by company
export const jobsByCompanyQuery = groq`
  *[_type == "jobPosting" 
    && status == "published"
    && company._ref == $companyId
  ] | order(publishedAt desc) {
    ${jobProjection}
  }
`;

// Get featured jobs for homepage
export const featuredJobsQuery = groq`
  *[_type == "jobPosting" 
    && status == "published"
    && featured == true
  ] | order(publishedAt desc) [0...6] {
    ${jobProjection}
  }
`;

// Get urgent jobs
export const urgentJobsQuery = groq`
  *[_type == "jobPosting" 
    && status == "published"
    && isUrgent == true
  ] | order(publishedAt desc) [0...10] {
    ${jobProjection}
  }
`;
```

### 4. Company Queries

Create `lib/queries/companies.ts`:

```typescript
import groq from 'groq';

// Base company projection
const companyProjection = groq`
  _id,
  name,
  slug,
  logo,
  description,
  website,
  email,
  phone,
  size,
  locations,
  benefitsOffered,
  verified,
  createdAt,
  "jobCount": count(*[_type == "jobPosting" && references(^._id) && status == "published"]),
  "activeJobs": *[_type == "jobPosting" && references(^._id) && status == "published"][0...3] {
    _id,
    title,
    slug,
    jobType,
    location
  }
`;

// Get all companies
export const companiesQuery = groq`
  *[_type == "company"
    && ($search == "" || name match $search)
    && ($size == "" || size == $size)
    && ($location == "" || $location in locations[].city)
  ] | order(verified desc, name asc) [($page - 1) * $pageSize...$page * $pageSize] {
    ${companyProjection}
  }
`;

// Get company by slug
export const companyBySlugQuery = groq`
  *[_type == "company" && slug.current == $slug][0] {
    ${companyProjection}
  }
`;

// Get verified companies
export const verifiedCompaniesQuery = groq`
  *[_type == "company" && verified == true] | order(name asc) {
    _id,
    name,
    slug,
    logo,
    size
  }
`;

// Get company by owner ID
export const companyByOwnerQuery = groq`
  *[_type == "company" && ownerId == $ownerId][0] {
    ${companyProjection}
  }
`;
```

### 5. Application Queries

Create `lib/queries/applications.ts`:

```typescript
import groq from 'groq';

// Base application projection
const applicationProjection = groq`
  _id,
  applicantInfo {
    name,
    email,
    phone,
    resumeUrl,
    linkedIn
  },
  coverMessage,
  status,
  rating,
  appliedDate,
  employerNotes,
  interviewDate,
  "job": job->{
    _id,
    title,
    slug,
    location,
    jobType,
    "company": company->{
      _id,
      name,
      slug
    }
  }
`;

// Get applications for a job
export const applicationsByJobQuery = groq`
  *[_type == "jobApplication" 
    && job._ref == $jobId
    && ($status == "" || status == $status)
  ] | order(appliedDate desc) [($page - 1) * $pageSize...$page * $pageSize] {
    ${applicationProjection}
  }
`;

// Get applications for a company
export const applicationsByCompanyQuery = groq`
  *[_type == "jobApplication" 
    && job->company._ref == $companyId
    && ($status == "" || status == $status)
  ] | order(appliedDate desc) [($page - 1) * $pageSize...$page * $pageSize] {
    ${applicationProjection}
  }
`;

// Get single application
export const applicationByIdQuery = groq`
  *[_type == "jobApplication" && _id == $id][0] {
    ${applicationProjection}
  }
`;

// Check if user already applied
export const hasAppliedQuery = groq`
  count(*[_type == "jobApplication" 
    && job._ref == $jobId 
    && applicantInfo.email == $email
  ]) > 0
`;

// Get applications by email (for job seekers)
export const applicationsByEmailQuery = groq`
  *[_type == "jobApplication" 
    && applicantInfo.email == $email
  ] | order(appliedDate desc) {
    ${applicationProjection}
  }
`;
```

### 6. Category Queries

Create `lib/queries/categories.ts`:

```typescript
import groq from 'groq';

// Get all categories with job counts
export const categoriesQuery = groq`
  *[_type == "jobCategory"] | order(orderRank asc, name asc) {
    _id,
    name,
    slug,
    description,
    icon,
    "jobCount": count(*[_type == "jobPosting" && references(^._id) && status == "published"])
  }
`;

// Get popular categories
export const popularCategoriesQuery = groq`
  *[_type == "jobCategory"] {
    _id,
    name,
    slug,
    icon,
    "jobCount": count(*[_type == "jobPosting" && references(^._id) && status == "published"])
  } | order(jobCount desc) [0...8]
`;
```

### 7. Analytics Queries

Create `lib/queries/analytics.ts`:

```typescript
import groq from 'groq';

// Dashboard stats for employers
export const employerStatsQuery = groq`
  {
    "totalJobs": count(*[_type == "jobPosting" && company->ownerId == $userId]),
    "activeJobs": count(*[_type == "jobPosting" && company->ownerId == $userId && status == "published"]),
    "draftJobs": count(*[_type == "jobPosting" && company->ownerId == $userId && status == "draft"]),
    "totalApplications": count(*[_type == "jobApplication" && job->company->ownerId == $userId]),
    "newApplications": count(*[_type == "jobApplication" && job->company->ownerId == $userId && status == "new"]),
    "totalViews": math::sum(*[_type == "jobPosting" && company->ownerId == $userId].viewCount),
    "avgApplicationsPerJob": count(*[_type == "jobApplication" && job->company->ownerId == $userId]) / count(*[_type == "jobPosting" && company->ownerId == $userId && status == "published"])
  }
`;

// Recent activity for dashboard
export const recentActivityQuery = groq`
  {
    "recentApplications": *[_type == "jobApplication" 
      && job->company->ownerId == $userId
    ] | order(appliedDate desc) [0...5] {
      _id,
      applicantInfo { name },
      appliedDate,
      status,
      "jobTitle": job->title
    },
    "recentJobs": *[_type == "jobPosting" 
      && company->ownerId == $userId
    ] | order(publishedAt desc) [0...5] {
      _id,
      title,
      status,
      publishedAt,
      viewCount,
      applicationCount
    }
  }
`;

// Job performance metrics
export const jobMetricsQuery = groq`
  *[_type == "jobPosting" && _id == $jobId][0] {
    title,
    viewCount,
    applicationCount,
    "conversionRate": applicationCount / viewCount * 100,
    "viewsOverTime": [], // Would need custom aggregation
    "applicationsByStatus": {
      "new": count(*[_type == "jobApplication" && job._ref == ^._id && status == "new"]),
      "reviewed": count(*[_type == "jobApplication" && job._ref == ^._id && status == "reviewed"]),
      "interviewing": count(*[_type == "jobApplication" && job._ref == ^._id && status == "interviewing"]),
      "hired": count(*[_type == "jobApplication" && job._ref == ^._id && status == "hired"]),
      "rejected": count(*[_type == "jobApplication" && job._ref == ^._id && status == "rejected"])
    }
  }
`;
```

### 8. Create Data Fetching Utilities

Create `lib/sanity-utils.ts`:

```typescript
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
```

### 9. Create Mutation Helpers

Create `lib/mutations.ts`:

```typescript
import { client } from './sanity';

// Job mutations
export async function createJob(data: any, companyId: string) {
  return client.create({
    _type: 'jobPosting',
    ...data,
    company: { _ref: companyId },
    status: 'draft',
    viewCount: 0,
    applicationCount: 0,
    createdAt: new Date().toISOString(),
  });
}

export async function updateJob(jobId: string, data: any) {
  return client.patch(jobId).set(data).commit();
}

export async function publishJob(jobId: string) {
  return client
    .patch(jobId)
    .set({ 
      status: 'published',
      publishedAt: new Date().toISOString()
    })
    .commit();
}

export async function deleteJob(jobId: string) {
  return client.delete(jobId);
}

// Application mutations
export async function updateApplicationStatus(
  applicationId: string,
  status: string
) {
  return client
    .patch(applicationId)
    .set({ status })
    .commit();
}

export async function addEmployerNotes(
  applicationId: string,
  notes: string
) {
  return client
    .patch(applicationId)
    .set({ employerNotes: notes })
    .commit();
}

// Company mutations
export async function createCompany(data: any, userId: string) {
  return client.create({
    _type: 'company',
    ...data,
    ownerId: userId,
    verified: false,
    createdAt: new Date().toISOString(),
  });
}

export async function updateCompany(companyId: string, data: any) {
  return client.patch(companyId).set(data).commit();
}
```

### 10. Create Type Guards

Create `lib/type-guards.ts`:

```typescript
import type { Job, Company, JobApplication } from '@/types';

export function isJob(item: any): item is Job {
  return item?._type === 'jobPosting';
}

export function isCompany(item: any): item is Company {
  return item?._type === 'company';
}

export function isApplication(item: any): item is JobApplication {
  return item?._type === 'jobApplication';
}

export function hasValidLocation(job: Job): boolean {
  return !!(
    job.location?.city &&
    job.location?.coordinates?.lat &&
    job.location?.coordinates?.lng
  );
}
```

## Verification Steps

1. **Test Query Execution:**
   ```typescript
   // In a test file or page
   import { getJobs } from '@/lib/sanity-utils';
   
   const jobs = await getJobs({ page: 1, pageSize: 10 });
   console.log('Jobs:', jobs);
   ```

2. **Check TypeScript Types:**
   ```bash
   npm run type-check
   ```

3. **Test in Sanity Vision:**
   - Open Sanity Studio
   - Go to Vision plugin
   - Test each query with parameters

## Common Issues & Solutions

### Issue: GROQ syntax errors
**Solution:** Test queries in Vision plugin first, check for typos in field names

### Issue: Missing data in results
**Solution:** Ensure projections include all needed fields, check references are correct

### Issue: Slow queries
**Solution:** Add indexes in Sanity, limit projections to needed fields only

### Issue: Type mismatches
**Solution:** Ensure Sanity schema matches TypeScript types exactly

## Next Steps

Proceed to [DOC-006: Layout Structure](doc-006-layouts.md) to create the app layouts.

## Notes for Claude Code

When implementing queries:
1. Test each query in Vision first
2. Always include error handling
3. Use proper TypeScript types
4. Consider pagination for list queries
5. Add revalidation tags for Next.js caching