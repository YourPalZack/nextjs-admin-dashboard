// Job related types
export interface Job {
  _id: string;
  title: string;
  slug: { current: string };
  company: Company;
  description: any[];
  requirements: string;
  responsibilities?: string;
  skills?: string[];
  certifications?: string[];
  salaryType: 'hourly' | 'salary' | 'contract';
  salaryMin: number;
  salaryMax?: number;
  showSalary?: boolean;
  location: {
    city: string;
    county: string;
    zipCode: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  remoteOptions?: 'onsite' | 'remote' | 'hybrid';
  jobType: 'full-time' | 'part-time' | 'contract' | 'temporary';
  category: JobCategory;
  experienceLevel: 'entry' | 'intermediate' | 'experienced';
  benefits: string[];
  applicationDeadline?: string;
  startDate?: string;
  expiresAt?: string;
  isUrgent: boolean;
  featured: boolean;
  status: 'draft' | 'published' | 'expired' | 'filled';
  publishedAt: string;
  viewCount: number;
  applicationCount: number;
}

export interface Company {
  _id: string;
  name: string;
  slug: { current: string };
  logo?: any;
  description?: any[];
  website?: string;
  size?: '1-10' | '11-50' | '51-200' | '200+';
  locations?: Location[];
  benefitsOffered?: string[];
  verified: boolean;
  ownerId?: string;
}

export interface JobCategory {
  _id: string;
  name: string;
  slug: { current: string };
  description?: string;
  icon?: any;
  jobCount?: number;
}

export interface JobApplication {
  _id: string;
  job: Job;
  applicantInfo: {
    name: string;
    email: string;
    phone: string;
    resumeUrl?: string;
    linkedIn?: string;
  };
  coverMessage?: string;
  status: 'new' | 'reviewed' | 'interviewing' | 'hired' | 'rejected';
  appliedDate: string;
  employerNotes?: string;
}

export interface Location {
  city: string;
  state: string;
  zipCode: string;
}

// Form types
export interface JobPostingForm {
  title: string;
  description: string;
  requirements: string;
  salaryType: string;
  salaryMin: number;
  salaryMax?: number;
  location: {
    city: string;
    county: string;
    zipCode: string;
  };
  jobType: string;
  category: string;
  experienceLevel: string;
  benefits: string[];
  applicationDeadline?: Date;
  isUrgent: boolean;
}

export interface ApplicationForm {
  name: string;
  email: string;
  phone: string;
  coverMessage?: string;
  resume?: File;
  linkedIn?: string;
}

// User types
export interface User {
  id: string;
  email: string;
  name?: string;
  role: 'employer' | 'jobseeker' | 'admin';
  companyId?: string;
}