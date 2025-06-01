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