import { Job, JobCategory, Company } from '@/types';

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

export const mockCompanies: Company[] = [
  {
    _id: "company1",
    name: "ABC Construction",
    slug: { current: "abc-construction" },
    description: [
      {
        _type: 'block',
        children: [
          {
            _type: 'span',
            text: 'ABC Construction is a leading general contractor in Colorado, specializing in commercial and residential construction projects. With over 25 years of experience, we pride ourselves on quality workmanship and employee development.'
          }
        ]
      }
    ],
    website: "https://abcconstruction.com",
    email: "careers@abcconstruction.com",
    phone: "(303) 555-0123",
    size: "51-200",
    locations: [
      { city: "Denver", state: "CO", zipCode: "80202" },
      { city: "Aurora", state: "CO", zipCode: "80012" }
    ],
    benefitsOffered: [
      "Health Insurance",
      "Dental Insurance",
      "401(k) with company match",
      "Paid time off",
      "Training opportunities",
      "Safety bonuses"
    ],
    verified: true,
    ownerId: "user1",
    jobCount: 5,
    createdAt: "2020-01-15T00:00:00.000Z"
  },
  {
    _id: "company2",
    name: "Lightning Electric Co.",
    slug: { current: "lightning-electric" },
    description: [
      {
        _type: 'block',
        children: [
          {
            _type: 'span',
            text: 'Lightning Electric Co. has been serving the Boulder area for over 20 years. We specialize in residential and commercial electrical work, from new installations to service calls. Our team of licensed electricians is committed to safety and excellence.'
          }
        ]
      }
    ],
    website: "https://lightningelectric.com",
    email: "jobs@lightningelectric.com",
    phone: "(303) 555-0456",
    size: "11-50",
    locations: [
      { city: "Boulder", state: "CO", zipCode: "80301" },
      { city: "Westminster", state: "CO", zipCode: "80031" }
    ],
    benefitsOffered: [
      "Health Insurance",
      "Paid time off",
      "Tool allowance",
      "Continuing education",
      "Performance bonuses"
    ],
    verified: true,
    ownerId: "user2",
    jobCount: 3,
    createdAt: "2018-06-01T00:00:00.000Z"
  },
  {
    _id: "company3",
    name: "Cool Air Services",
    slug: { current: "cool-air-services" },
    description: [
      {
        _type: 'block',
        children: [
          {
            _type: 'span',
            text: 'Cool Air Services provides comprehensive HVAC installation, maintenance, and repair services throughout Colorado Springs and surrounding areas. We are a family-owned business dedicated to keeping our customers comfortable year-round.'
          }
        ]
      }
    ],
    website: "https://coolairservices.com",
    email: "careers@coolairservices.com",
    phone: "(719) 555-0789",
    size: "11-50",
    locations: [
      { city: "Colorado Springs", state: "CO", zipCode: "80905" }
    ],
    benefitsOffered: [
      "Health Insurance",
      "Paid holidays",
      "Vehicle provided",
      "Flexible schedule"
    ],
    verified: false,
    ownerId: "user3",
    jobCount: 2,
    createdAt: "2019-03-15T00:00:00.000Z"
  },
  {
    _id: "company4",
    name: "Rocky Mountain Plumbing",
    slug: { current: "rocky-mountain-plumbing" },
    description: [
      {
        _type: 'block',
        children: [
          {
            _type: 'span',
            text: 'Rocky Mountain Plumbing is a full-service plumbing company serving residential and commercial customers across the Denver metro area. We offer emergency services, new construction, and remodeling projects.'
          }
        ]
      }
    ],
    website: "https://rockymountainplumbing.com",
    email: "hr@rockymountainplumbing.com",
    phone: "(303) 555-0321",
    size: "11-50",
    locations: [
      { city: "Lakewood", state: "CO", zipCode: "80215" },
      { city: "Arvada", state: "CO", zipCode: "80003" }
    ],
    benefitsOffered: [
      "Health Insurance",
      "401(k)",
      "Paid time off",
      "On-call pay",
      "Tool reimbursement"
    ],
    verified: true,
    ownerId: "user4",
    jobCount: 4,
    createdAt: "2017-09-01T00:00:00.000Z"
  },
  {
    _id: "company5",
    name: "Front Range Manufacturing",
    slug: { current: "front-range-manufacturing" },
    description: [
      {
        _type: 'block',
        children: [
          {
            _type: 'span',
            text: 'Front Range Manufacturing is a leading precision manufacturing company producing components for aerospace, automotive, and medical industries. We offer excellent opportunities for growth and advancement in a modern facility.'
          }
        ]
      }
    ],
    website: "https://frontrangemfg.com",
    email: "careers@frontrangemfg.com",
    phone: "(970) 555-0654",
    size: "200+",
    locations: [
      { city: "Fort Collins", state: "CO", zipCode: "80525" }
    ],
    benefitsOffered: [
      "Comprehensive Health Insurance",
      "Dental and Vision",
      "401(k) with 6% match",
      "Paid time off",
      "Life insurance",
      "Tuition reimbursement",
      "Employee stock purchase plan"
    ],
    verified: true,
    ownerId: "user5",
    jobCount: 8,
    createdAt: "2015-04-01T00:00:00.000Z"
  }
];