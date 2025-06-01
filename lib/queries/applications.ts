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