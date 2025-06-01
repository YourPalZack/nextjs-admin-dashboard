# DOC-012: Dashboard Overview

## Overview
This document covers creating the employer dashboard homepage using NextAdmin components. The dashboard includes statistics cards, recent activity feed, quick actions, and charts showing key metrics for employers.

## Prerequisites
- DOC-001 through DOC-011 completed
- NextAdmin dashboard theme installed
- Authentication configured with role checking
- Sanity queries for analytics data

## Steps

### 1. Create Dashboard Types

Define TypeScript types for dashboard data:

```typescript
// types/dashboard.ts
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
```

### 2. Create Dashboard Data Fetching

Create server-side data fetching utilities:

```typescript
// lib/dashboard-utils.ts
import { client } from '@/lib/sanity';
import { groq } from 'next-sanity';
import { subDays, startOfDay } from 'date-fns';

export async function getDashboardStats(companyId: string) {
  const stats = await client.fetch(groq`{
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
  const hiredApplications = await client.fetch(groq`
    *[_type == "jobApplication" && job->company._ref == $companyId && status == "hired"]{
      appliedDate,
      interviewDate
    }
  `, { companyId });

  const avgTimeToHire = hiredApplications.length > 0
    ? hiredApplications.reduce((acc, app) => {
        const days = Math.floor(
          (new Date(app.interviewDate).getTime() - new Date(app.appliedDate).getTime()) 
          / (1000 * 60 * 60 * 24)
        );
        return acc + days;
      }, 0) / hiredApplications.length
    : 0;

  return {
    ...stats,
    averageTimeToHire: Math.round(avgTimeToHire)
  };
}

export async function getRecentActivity(companyId: string, limit = 10) {
  const activities = [];

  // Get recent applications
  const recentApplications = await client.fetch(groq`
    *[_type == "jobApplication" && job->company._ref == $companyId] | order(appliedDate desc) [0...$limit] {
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
  `, { companyId, limit: 5 });

  // Get recently posted jobs
  const recentJobs = await client.fetch(groq`
    *[_type == "jobPosting" && company._ref == $companyId && status == "published"] | order(publishedAt desc) [0...$limit] {
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
  `, { companyId, limit: 5 });

  // Combine and sort activities
  activities.push(...recentApplications, ...recentJobs);
  activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return activities.slice(0, limit);
}

export async function getTopPerformingJobs(companyId: string, limit = 5) {
  const jobs = await client.fetch(groq`
    *[_type == "jobPosting" && company._ref == $companyId && status == "published"] | order(viewCount desc) [0...$limit] {
      "jobId": _id,
      title,
      viewCount,
      applicationCount,
      "conversionRate": applicationCount > 0 ? (applicationCount / viewCount * 100) : 0
    }
  `, { companyId, limit });

  return jobs;
}

export async function getApplicationTrends(companyId: string, days = 30) {
  const startDate = subDays(new Date(), days);
  
  const applications = await client.fetch(groq`
    *[_type == "jobApplication" && job->company._ref == $companyId && appliedDate > $startDate] {
      appliedDate
    }
  `, { companyId, startDate: startDate.toISOString() });

  // Group by date
  const trends = {};
  applications.forEach(app => {
    const date = new Date(app.appliedDate).toLocaleDateString();
    trends[date] = (trends[date] || 0) + 1;
  });

  // Fill in missing dates with 0
  const result = [];
  for (let i = 0; i < days; i++) {
    const date = subDays(new Date(), i);
    const dateStr = date.toLocaleDateString();
    result.unshift({
      date: dateStr,
      count: trends[dateStr] || 0
    });
  }

  return result;
}
```

### 3. Create Dashboard Layout

Build the main dashboard page:

```typescript
// app/dashboard/page.tsx
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import { 
  getDashboardStats, 
  getRecentActivity, 
  getTopPerformingJobs,
  getApplicationTrends 
} from '@/lib/dashboard-utils';
import DashboardContent from '@/components/Dashboard/DashboardContent';

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  
  if (!session || session.user.role !== 'employer') {
    redirect('/auth/signin');
  }

  const companyId = session.user.companyId;
  
  const [stats, recentActivity, topJobs, applicationTrends] = await Promise.all([
    getDashboardStats(companyId),
    getRecentActivity(companyId),
    getTopPerformingJobs(companyId),
    getApplicationTrends(companyId)
  ]);

  return (
    <DashboardContent
      stats={stats}
      recentActivity={recentActivity}
      topJobs={topJobs}
      applicationTrends={applicationTrends}
    />
  );
}
```

### 4. Create Stats Cards Component

Build statistics cards using NextAdmin components:

```typescript
// components/Dashboard/StatsCards.tsx
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Briefcase, 
  Users, 
  Eye, 
  Clock,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import type { DashboardStats } from '@/types/dashboard';

interface StatsCardsProps {
  stats: DashboardStats;
}

export default function StatsCards({ stats }: StatsCardsProps) {
  const cards = [
    {
      title: 'Active Jobs',
      value: stats.activeJobs,
      total: stats.totalJobs,
      icon: Briefcase,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      description: `${stats.activeJobs} of ${stats.totalJobs} jobs active`
    },
    {
      title: 'Total Applications',
      value: stats.totalApplications,
      change: stats.newApplications,
      icon: Users,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      description: `+${stats.newApplications} this week`
    },
    {
      title: 'Total Views',
      value: stats.totalViews,
      icon: Eye,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      description: 'Across all job postings'
    },
    {
      title: 'Avg. Time to Hire',
      value: stats.averageTimeToHire,
      unit: 'days',
      icon: Clock,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      description: 'From application to hire'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {card.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${card.bgColor}`}>
                <Icon className={`h-4 w-4 ${card.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {card.value.toLocaleString()}
                {card.unit && <span className="text-lg font-normal text-gray-600 ml-1">{card.unit}</span>}
              </div>
              <p className="text-xs text-gray-600 mt-1">
                {card.description}
              </p>
              {card.change !== undefined && card.change > 0 && (
                <div className="flex items-center gap-1 mt-2">
                  <TrendingUp className="h-3 w-3 text-green-600" />
                  <span className="text-xs text-green-600">
                    {((card.change / card.value) * 100).toFixed(1)}% increase
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
```

### 5. Create Recent Activity Feed

Build the activity feed component:

```typescript
// components/Dashboard/RecentActivity.tsx
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  FileText, 
  Briefcase, 
  AlertCircle, 
  Calendar,
  User
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';
import type { RecentActivity } from '@/types/dashboard';

interface RecentActivityProps {
  activities: RecentActivity[];
}

const activityIcons = {
  application: FileText,
  job_posted: Briefcase,
  job_expired: AlertCircle,
  interview_scheduled: Calendar,
};

const activityColors = {
  application: 'bg-blue-100 text-blue-600',
  job_posted: 'bg-green-100 text-green-600',
  job_expired: 'bg-red-100 text-red-600',
  interview_scheduled: 'bg-purple-100 text-purple-600',
};

export default function RecentActivityFeed({ activities }: RecentActivityProps) {
  if (activities.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No recent activity</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-4">
            {activities.map((activity) => {
              const Icon = activityIcons[activity.type];
              const colorClass = activityColors[activity.type];
              
              return (
                <div key={activity._id} className="flex gap-4">
                  <div className={`p-2 rounded-lg h-fit ${colorClass}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">
                      {activity.title}
                    </p>
                    <p className="text-sm text-gray-600 truncate">
                      {activity.description}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                    </p>
                    {activity.type === 'application' && activity.metadata?.jobId && (
                      <Link 
                        href={`/dashboard/applications?job=${activity.metadata.jobId}`}
                        className="text-xs text-blue-600 hover:underline"
                      >
                        View application →
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
```

### 6. Create Quick Actions Component

Build quick action buttons:

```typescript
// components/Dashboard/QuickActions.tsx
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Plus, 
  Users, 
  FileText, 
  BarChart3,
  Settings,
  Send
} from 'lucide-react';
import Link from 'next/link';

export default function QuickActions() {
  const actions = [
    {
      label: 'Post New Job',
      href: '/dashboard/jobs/new',
      icon: Plus,
      variant: 'default' as const,
      description: 'Create a new job posting'
    },
    {
      label: 'View Applications',
      href: '/dashboard/applications',
      icon: Users,
      variant: 'outline' as const,
      description: 'Review pending applications'
    },
    {
      label: 'Manage Jobs',
      href: '/dashboard/jobs',
      icon: FileText,
      variant: 'outline' as const,
      description: 'Edit or expire job postings'
    },
    {
      label: 'View Analytics',
      href: '/dashboard/analytics',
      icon: BarChart3,
      variant: 'outline' as const,
      description: 'Detailed performance metrics'
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <Link key={action.href} href={action.href}>
                <Button 
                  variant={action.variant} 
                  className="w-full justify-start h-auto py-4"
                >
                  <div className="flex items-start gap-3">
                    <Icon className="h-5 w-5 mt-0.5" />
                    <div className="text-left">
                      <div className="font-semibold">{action.label}</div>
                      <div className="text-xs text-gray-600 font-normal">
                        {action.description}
                      </div>
                    </div>
                  </div>
                </Button>
              </Link>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
```

### 7. Create Performance Chart Component

Build a chart showing job performance:

```typescript
// components/Dashboard/PerformanceChart.tsx
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { JobPerformance } from '@/types/dashboard';

interface PerformanceChartProps {
  jobs: JobPerformance[];
}

export default function PerformanceChart({ jobs }: PerformanceChartProps) {
  const data = jobs.map(job => ({
    name: job.title.length > 20 ? job.title.substring(0, 20) + '...' : job.title,
    views: job.views,
    applications: job.applications,
    conversion: parseFloat(job.conversionRate.toFixed(1))
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Performing Jobs</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200" />
              <XAxis 
                dataKey="name" 
                angle={-45}
                textAnchor="end"
                height={100}
                className="text-xs"
              />
              <YAxis className="text-xs" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px'
                }}
              />
              <Bar dataKey="views" fill="#3b82f6" name="Views" />
              <Bar dataKey="applications" fill="#10b981" name="Applications" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 flex items-center justify-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded" />
            <span>Views</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded" />
            <span>Applications</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
```

### 8. Create Application Trends Chart

Build a line chart for application trends:

```typescript
// components/Dashboard/ApplicationTrends.tsx
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface ApplicationTrendsProps {
  data: Array<{ date: string; count: number }>;
}

export default function ApplicationTrends({ data }: ApplicationTrendsProps) {
  // Format dates for display
  const formattedData = data.map(item => ({
    ...item,
    displayDate: new Date(item.date).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    })
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Application Trends (30 Days)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={formattedData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200" />
              <XAxis 
                dataKey="displayDate" 
                className="text-xs"
                interval="preserveStartEnd"
              />
              <YAxis className="text-xs" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px'
                }}
                labelFormatter={(value) => `Date: ${value}`}
              />
              <Line 
                type="monotone" 
                dataKey="count" 
                stroke="#3b82f6" 
                strokeWidth={2}
                dot={{ fill: '#3b82f6', r: 4 }}
                activeDot={{ r: 6 }}
                name="Applications"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
```

### 9. Create Main Dashboard Content Component

Combine all components into the main dashboard:

```typescript
// components/Dashboard/DashboardContent.tsx
'use client';

import StatsCards from './StatsCards';
import RecentActivityFeed from './RecentActivity';
import QuickActions from './QuickActions';
import PerformanceChart from './PerformanceChart';
import ApplicationTrends from './ApplicationTrends';
import type { DashboardStats, RecentActivity, JobPerformance } from '@/types/dashboard';

interface DashboardContentProps {
  stats: DashboardStats;
  recentActivity: RecentActivity[];
  topJobs: JobPerformance[];
  applicationTrends: Array<{ date: string; count: number }>;
}

export default function DashboardContent({
  stats,
  recentActivity,
  topJobs,
  applicationTrends
}: DashboardContentProps) {
  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Welcome back! Here's an overview of your job postings.
        </p>
      </div>

      <StatsCards stats={stats} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2">
          <PerformanceChart jobs={topJobs} />
        </div>
        <div>
          <QuickActions />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ApplicationTrends data={applicationTrends} />
        <RecentActivityFeed activities={recentActivity} />
      </div>
    </div>
  );
}
```

### 10. Add Dashboard Route Protection

Update the middleware to protect dashboard routes:

```typescript
// middleware.ts
import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // Check if accessing dashboard
    if (path.startsWith('/dashboard')) {
      if (!token || token.role !== 'employer') {
        return NextResponse.redirect(new URL('/auth/signin', req.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: ['/dashboard/:path*'],
};
```

## Verification Steps

1. **Test Authentication:**
   - Try accessing dashboard without login (should redirect)
   - Login as job seeker (should be denied access)
   - Login as employer (should see dashboard)

2. **Test Stats Cards:**
   - Verify all metrics display correctly
   - Check calculations for accuracy
   - Test with zero data scenarios

3. **Test Recent Activity:**
   - Create new application and verify it appears
   - Post new job and check activity feed
   - Verify timestamps are correct

4. **Test Charts:**
   - Verify bar chart shows top performing jobs
   - Check line chart displays trends correctly
   - Test with various data ranges

5. **Test Quick Actions:**
   - Click each button and verify navigation
   - Check all links work correctly
   - Verify mobile responsiveness

6. **Test Responsive Design:**
   - Check layout on mobile (375px)
   - Test tablet view (768px)
   - Verify desktop layout (1920px)

## Common Issues & Solutions

### Issue: Charts not rendering
**Solution:**
1. Ensure recharts is installed: `npm install recharts`
2. Import ResponsiveContainer from recharts
3. Set explicit height for chart containers

### Issue: Stats showing NaN or undefined
**Solution:**
1. Add null checks in calculations
2. Provide default values in data fetching
3. Handle empty arrays properly

### Issue: Activity feed not updating
**Solution:**
1. Check Sanity webhook configuration
2. Verify timestamps are ISO format
3. Add revalidation to page

### Issue: "Not authorized" errors
**Solution:**
1. Check session includes companyId
2. Verify role is set correctly in session
3. Update auth callbacks to include company info

## Next Steps

Proceed to [DOC-013: Job Management](doc-013-job-management.md) to build the job posting and management system.

## Notes for Claude Code

When implementing the dashboard:
1. Use NextAdmin's built-in chart components where available
2. Implement proper loading states for async data
3. Add error boundaries around charts
4. Consider adding real-time updates with polling
5. Cache dashboard data for performance
6. Test with various data volumes
7. Add tooltips for metric explanations
8. Consider adding date range filters for charts
9. Implement export functionality for data