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
    description,
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