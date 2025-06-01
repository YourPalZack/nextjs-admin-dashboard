export interface JobFormData {
  title: string;
  description: string;
  requirements: string;
  company: string;
  location: {
    city: string;
    county: string;
    zipCode: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  salaryMin: number;
  salaryMax?: number;
  salaryType: 'hourly' | 'salary' | 'contract';
  jobType: 'full-time' | 'part-time' | 'contract' | 'temporary';
  category: string;
  experienceLevel: 'entry' | 'intermediate' | 'experienced';
  benefits: string[];
  applicationDeadline?: string;
  isUrgent: boolean;
  featured: boolean;
  status: 'draft' | 'published' | 'expired' | 'filled';
}

export interface JobTableRow {
  id: string;
  title: string;
  status: 'draft' | 'published' | 'expired' | 'filled';
  applications: number;
  views: number;
  publishedAt?: string;
  expiresAt?: string;
  selected?: boolean;
  slug?: string;
}