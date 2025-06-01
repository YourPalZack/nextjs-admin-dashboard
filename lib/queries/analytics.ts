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