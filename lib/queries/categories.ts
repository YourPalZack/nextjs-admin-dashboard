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