import { client } from '@/lib/sanity';
import { subDays, startOfDay } from 'date-fns';
import type { DashboardStats, RecentActivity, JobPerformance, ApplicationTrend } from '@/types/dashboard';

// Mock data for development
const mockStats: DashboardStats = {
  totalJobs: 24,
  activeJobs: 18,
  totalApplications: 156,
  newApplications: 23,
  totalViews: 2847,
  averageTimeToHire: 12
};

const mockRecentActivity: RecentActivity[] = [
  {
    _id: '1',
    type: 'application',
    title: 'New application received',
    description: 'John Smith applied for Senior Electrician position',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    metadata: {
      jobTitle: 'Senior Electrician',
      applicantName: 'John Smith',
      jobId: 'job1'
    }
  },
  {
    _id: '2',
    type: 'job_posted',
    title: 'Job posted',
    description: 'Construction Foreman position is now live',
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    metadata: {
      jobTitle: 'Construction Foreman',
      jobId: 'job2'
    }
  },
  {
    _id: '3',
    type: 'application',
    title: 'New application received',
    description: 'Maria Garcia applied for HVAC Technician position',
    timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    metadata: {
      jobTitle: 'HVAC Technician',
      applicantName: 'Maria Garcia',
      jobId: 'job3'
    }
  },
  {
    _id: '4',
    type: 'interview_scheduled',
    title: 'Interview scheduled',
    description: 'Interview scheduled with David Wilson for Welder position',
    timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    metadata: {
      jobTitle: 'Welder',
      applicantName: 'David Wilson',
      jobId: 'job4'
    }
  },
  {
    _id: '5',
    type: 'application',
    title: 'New application received',
    description: 'Sarah Johnson applied for Project Manager position',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    metadata: {
      jobTitle: 'Project Manager',
      applicantName: 'Sarah Johnson',
      jobId: 'job5'
    }
  }
];

const mockTopJobs: JobPerformance[] = [
  {
    jobId: 'job1',
    title: 'Senior Electrician',
    views: 324,
    applications: 28,
    conversionRate: 8.6
  },
  {
    jobId: 'job2',
    title: 'Construction Foreman',
    views: 298,
    applications: 22,
    conversionRate: 7.4
  },
  {
    jobId: 'job3',
    title: 'HVAC Technician',
    views: 267,
    applications: 31,
    conversionRate: 11.6
  },
  {
    jobId: 'job4',
    title: 'Welder',
    views: 245,
    applications: 19,
    conversionRate: 7.8
  },
  {
    jobId: 'job5',
    title: 'Project Manager',
    views: 189,
    applications: 15,
    conversionRate: 7.9
  }
];

function generateMockApplicationTrends(days = 30): ApplicationTrend[] {
  const trends: ApplicationTrend[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = subDays(new Date(), i);
    const count = Math.floor(Math.random() * 8) + 1; // 1-8 applications per day
    trends.push({
      date: date.toLocaleDateString(),
      count
    });
  }
  return trends;
}

export async function getDashboardStats(companyId: string): Promise<DashboardStats> {
  try {
    if (!companyId) {
      return mockStats;
    }

    const stats = await client.fetch(`{
      "totalJobs": count(*[_type == "jobPosting" && company._ref == $companyId]),
      "activeJobs": count(*[_type == "jobPosting" && company._ref == $companyId && status == "published"]),
      "totalApplications": count(*[_type == "jobApplication" && job->company._ref == $companyId]),
      "newApplications": count(*[_type == "jobApplication" && job->company._ref == $companyId && appliedDate > $sevenDaysAgo]),
      "totalViews": *[_type == "jobPosting" && company._ref == $companyId]{viewCount}[].viewCount | sum(),
    }`, {
      companyId,
      sevenDaysAgo: subDays(new Date(), 7).toISOString()
    });

    // Calculate average time to hire
    const hiredApplications = await client.fetch(`
      *[_type == "jobApplication" && job->company._ref == $companyId && status == "hired"]{
        appliedDate,
        interviewDate
      }
    `, { companyId });

    const avgTimeToHire = hiredApplications.length > 0
      ? hiredApplications.reduce((acc: number, app: any) => {
          const days = Math.floor(
            (new Date(app.interviewDate).getTime() - new Date(app.appliedDate).getTime()) 
            / (1000 * 60 * 60 * 24)
          );
          return acc + days;
        }, 0) / hiredApplications.length
      : 0;

    return {
      ...stats,
      totalViews: stats.totalViews || 0,
      averageTimeToHire: Math.round(avgTimeToHire)
    };
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return mockStats;
  }
}

export async function getRecentActivity(companyId: string, limit = 10): Promise<RecentActivity[]> {
  try {
    if (!companyId) {
      return mockRecentActivity.slice(0, limit);
    }

    const activities = [];

    // Get recent applications
    const recentApplications = await client.fetch(`
      *[_type == "jobApplication" && job->company._ref == $companyId] | order(appliedDate desc) [0...5] {
        _id,
        "type": "application",
        "title": "New application received",
        "description": applicantInfo.name + " applied for " + job->title,
        "timestamp": appliedDate,
        "metadata": {
          "jobTitle": job->title,
          "applicantName": applicantInfo.name,
          "jobId": job->_id
        }
      }
    `, { companyId });

    // Get recently posted jobs
    const recentJobs = await client.fetch(`
      *[_type == "jobPosting" && company._ref == $companyId && status == "published"] | order(publishedAt desc) [0...5] {
        _id,
        "type": "job_posted",
        "title": "Job posted",
        "description": title + " is now live",
        "timestamp": publishedAt,
        "metadata": {
          "jobTitle": title,
          "jobId": _id
        }
      }
    `, { companyId });

    // Combine and sort activities
    activities.push(...recentApplications, ...recentJobs);
    activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return activities.slice(0, limit);
  } catch (error) {
    console.error('Error fetching recent activity:', error);
    return mockRecentActivity.slice(0, limit);
  }
}

export async function getTopPerformingJobs(companyId: string, limit = 5): Promise<JobPerformance[]> {
  try {
    if (!companyId) {
      return mockTopJobs.slice(0, limit);
    }

    const jobs = await client.fetch(`
      *[_type == "jobPosting" && company._ref == $companyId && status == "published"] | order(viewCount desc) [0...$limit] {
        "jobId": _id,
        title,
        viewCount,
        applicationCount,
        "conversionRate": applicationCount > 0 ? (applicationCount / viewCount * 100) : 0
      }
    `, { companyId, limit });

    return jobs.map((job: any) => ({
      ...job,
      views: job.viewCount || 0,
      applications: job.applicationCount || 0,
      conversionRate: job.conversionRate || 0
    }));
  } catch (error) {
    console.error('Error fetching top performing jobs:', error);
    return mockTopJobs.slice(0, limit);
  }
}

export async function getApplicationTrends(companyId: string, days = 30): Promise<ApplicationTrend[]> {
  try {
    if (!companyId) {
      return generateMockApplicationTrends(days);
    }

    const startDate = subDays(new Date(), days);
    
    const applications = await client.fetch(`
      *[_type == "jobApplication" && job->company._ref == $companyId && appliedDate > $startDate] {
        appliedDate
      }
    `, { companyId, startDate: startDate.toISOString() });

    // Group by date
    const trends: { [key: string]: number } = {};
    applications.forEach((app: any) => {
      const date = new Date(app.appliedDate).toLocaleDateString();
      trends[date] = (trends[date] || 0) + 1;
    });

    // Fill in missing dates with 0
    const result: ApplicationTrend[] = [];
    for (let i = 0; i < days; i++) {
      const date = subDays(new Date(), i);
      const dateStr = date.toLocaleDateString();
      result.unshift({
        date: dateStr,
        count: trends[dateStr] || 0
      });
    }

    return result;
  } catch (error) {
    console.error('Error fetching application trends:', error);
    return generateMockApplicationTrends(days);
  }
}