export interface DashboardStats {
  totalJobs: number;
  activeJobs: number;
  totalApplications: number;
  newApplications: number;
  totalViews: number;
  averageTimeToHire: number;
}

export interface RecentActivity {
  _id: string;
  type: 'application' | 'job_posted' | 'job_expired' | 'interview_scheduled';
  title: string;
  description: string;
  timestamp: string;
  metadata?: {
    jobTitle?: string;
    applicantName?: string;
    jobId?: string;
  };
}

export interface JobPerformance {
  jobId: string;
  title: string;
  views: number;
  applications: number;
  conversionRate: number;
}

export interface ApplicationTrend {
  date: string;
  count: number;
}