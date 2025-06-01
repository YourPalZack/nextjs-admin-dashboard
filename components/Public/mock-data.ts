import { Job, JobCategory } from '@/types';

export const mockJobs: Job[] = [
  {
    _id: "1",
    title: "Construction Foreman",
    slug: { current: "construction-foreman-abc" },
    company: {
      _id: "company1",
      name: "ABC Construction",
      slug: { current: "abc-construction" },
      verified: true,
      ownerId: "user1"
    },
    description: [],
    requirements: "5+ years experience in construction management",
    salaryType: "hourly",
    salaryMin: 35,
    salaryMax: 45,
    showSalary: true,
    location: {
      city: "Denver",
      county: "Denver County",
      zipCode: "80202"
    },
    remoteOptions: "onsite",
    jobType: "full-time",
    category: {
      _id: "cat1",
      name: "Construction",
      slug: { current: "construction" },
      jobCount: 25
    },
    experienceLevel: "experienced",
    benefits: ["Health Insurance", "401k"],
    isUrgent: true,
    featured: false,
    status: "published",
    publishedAt: new Date().toISOString(),
    viewCount: 124,
    applicationCount: 8
  },
  {
    _id: "2",
    title: "Electrician",
    slug: { current: "electrician-lightning" },
    company: {
      _id: "company2",
      name: "Lightning Electric Co.",
      slug: { current: "lightning-electric" },
      verified: true,
      ownerId: "user2"
    },
    description: [],
    requirements: "Licensed electrician with 3+ years experience",
    salaryType: "hourly",
    salaryMin: 28,
    salaryMax: 38,
    showSalary: true,
    location: {
      city: "Boulder",
      county: "Boulder County",
      zipCode: "80301"
    },
    remoteOptions: "onsite",
    jobType: "full-time",
    category: {
      _id: "cat2",
      name: "Electrical",
      slug: { current: "electrical" },
      jobCount: 15
    },
    experienceLevel: "intermediate",
    benefits: ["Health Insurance", "Paid Time Off"],
    isUrgent: false,
    featured: true,
    status: "published",
    publishedAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    viewCount: 89,
    applicationCount: 12
  },
  {
    _id: "3",
    title: "HVAC Technician",
    slug: { current: "hvac-tech-cool-air" },
    company: {
      _id: "company3",
      name: "Cool Air Services",
      slug: { current: "cool-air-services" },
      verified: false,
      ownerId: "user3"
    },
    description: [],
    requirements: "HVAC certification required",
    salaryType: "hourly",
    salaryMin: 25,
    salaryMax: 35,
    showSalary: true,
    location: {
      city: "Colorado Springs",
      county: "El Paso County",
      zipCode: "80905"
    },
    remoteOptions: "onsite",
    jobType: "full-time",
    category: {
      _id: "cat3",
      name: "HVAC",
      slug: { current: "hvac" },
      jobCount: 8
    },
    experienceLevel: "entry",
    benefits: ["Health Insurance"],
    isUrgent: false,
    featured: false,
    status: "published",
    publishedAt: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
    viewCount: 45,
    applicationCount: 3
  }
];

export const mockCategories: JobCategory[] = [
  {
    _id: "cat1",
    name: "Construction",
    slug: { current: "construction" },
    description: "Construction and building trades",
    jobCount: 25
  },
  {
    _id: "cat2",
    name: "Electrical",
    slug: { current: "electrical" },
    description: "Electrical work and installation",
    jobCount: 15
  },
  {
    _id: "cat3",
    name: "HVAC",
    slug: { current: "hvac" },
    description: "Heating, ventilation, and air conditioning",
    jobCount: 8
  },
  {
    _id: "cat4",
    name: "Plumbing",
    slug: { current: "plumbing" },
    description: "Plumbing installation and repair",
    jobCount: 12
  },
  {
    _id: "cat5",
    name: "Manufacturing",
    slug: { current: "manufacturing" },
    description: "Manufacturing and production jobs",
    jobCount: 18
  }
];