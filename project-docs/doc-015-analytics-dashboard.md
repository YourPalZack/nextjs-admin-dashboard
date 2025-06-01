# DOC-015: Analytics Dashboard

## Overview
This document covers building the analytics dashboard for employers using NextAdmin chart components. The dashboard includes job performance metrics, application conversion rates, time-to-hire analytics, and export functionality for detailed reporting.

## Prerequisites
- DOC-001 through DOC-014 completed
- NextAdmin chart components available
- Recharts library installed
- Job and application data in Sanity

## Steps

### 1. Create Analytics Types

Define TypeScript types for analytics data:

```typescript
// types/analytics.ts
export interface JobAnalytics {
  jobId: string;
  title: string;
  views: number;
  applications: number;
  conversionRate: number;
  avgTimeToApplication: number;
  topSources: Array<{ source: string; count: number }>;
  dailyViews: Array<{ date: string; views: number }>;
}

export interface OverallAnalytics {
  totalJobs: number;
  totalViews: number;
  totalApplications: number;
  avgConversionRate: number;
  avgTimeToHire: number;
  topPerformingJobs: JobAnalytics[];
  applicationsByStatus: Record<string, number>;
  hiringFunnel: {
    applied: number;
    reviewed: number;
    interviewed: number;
    hired: number;
  };
  monthlyTrends: Array<{
    month: string;
    jobs: number;
    applications: number;
    hires: number;
  }>;
}

export interface SourceAnalytics {
  source: string;
  views: number;
  applications: number;
  conversionRate: number;
}

export interface DateRange {
  startDate: Date;
  endDate: Date;
  preset?: 'last7days' | 'last30days' | 'last90days' | 'custom';
}
```

### 2. Create Analytics Data Fetching

Build analytics calculation utilities:

```typescript
// lib/analytics-utils.ts
import { client } from '@/lib/sanity';
import { groq } from 'next-sanity';
import { subDays, format, startOfMonth, endOfMonth } from 'date-fns';

export async function getOverallAnalytics(
  companyId: string,
  dateRange: DateRange
) {
  const { startDate, endDate } = dateRange;

  // Fetch all jobs and applications in date range
  const [jobs, applications] = await Promise.all([
    client.fetch(groq`
      *[_type == "jobPosting" && company._ref == $companyId && publishedAt >= $startDate && publishedAt <= $endDate] {
        _id,
        title,
        viewCount,
        applicationCount,
        publishedAt
      }
    `, { companyId, startDate: startDate.toISOString(), endDate: endDate.toISOString() }),
    
    client.fetch(groq`
      *[_type == "jobApplication" && job->company._ref == $companyId && appliedDate >= $startDate && appliedDate <= $endDate] {
        _id,
        status,
        appliedDate,
        reviewedDate,
        interviewDate,
        "jobId": job->_id
      }
    `, { companyId, startDate: startDate.toISOString(), endDate: endDate.toISOString() })
  ]);

  // Calculate overall metrics
  const totalViews = jobs.reduce((sum, job) => sum + (job.viewCount || 0), 0);
  const totalApplications = applications.length;
  const avgConversionRate = totalViews > 0 ? (totalApplications / totalViews) * 100 : 0;

  // Calculate application status breakdown
  const applicationsByStatus = applications.reduce((acc, app) => {
    acc[app.status] = (acc[app.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Calculate hiring funnel
  const hiringFunnel = {
    applied: applications.length,
    reviewed: applications.filter(a => ['reviewed', 'interviewing', 'hired', 'rejected'].includes(a.status)).length,
    interviewed: applications.filter(a => ['interviewing', 'hired'].includes(a.status)).length,
    hired: applications.filter(a => a.status === 'hired').length
  };

  // Calculate average time to hire
  const hiredApplications = applications.filter(a => a.status === 'hired' && a.interviewDate);
  const avgTimeToHire = hiredApplications.length > 0
    ? hiredApplications.reduce((sum, app) => {
        const days = Math.floor(
          (new Date(app.interviewDate).getTime() - new Date(app.appliedDate).getTime()) / (1000 * 60 * 60 * 24)
        );
        return sum + days;
      }, 0) / hiredApplications.length
    : 0;

  // Get top performing jobs
  const topPerformingJobs = jobs
    .map(job => ({
      jobId: job._id,
      title: job.title,
      views: job.viewCount || 0,
      applications: job.applicationCount || 0,
      conversionRate: job.viewCount > 0 ? (job.applicationCount / job.viewCount) * 100 : 0,
      avgTimeToApplication: 0, // Calculate if needed
      topSources: [],
      dailyViews: []
    }))
    .sort((a, b) => b.applications - a.applications)
    .slice(0, 5);

  // Calculate monthly trends
  const monthlyTrends = calculateMonthlyTrends(jobs, applications, dateRange);

  return {
    totalJobs: jobs.length,
    totalViews,
    totalApplications,
    avgConversionRate,
    avgTimeToHire,
    topPerformingJobs,
    applicationsByStatus,
    hiringFunnel,
    monthlyTrends
  };
}

export async function getJobAnalytics(
  jobId: string,
  companyId: string,
  dateRange: DateRange
) {
  const job = await client.fetch(groq`
    *[_type == "jobPosting" && _id == $jobId && company._ref == $companyId][0] {
      _id,
      title,
      viewCount,
      applicationCount,
      "viewLogs": *[_type == "jobView" && job._ref == ^._id && timestamp >= $startDate && timestamp <= $endDate] {
        timestamp,
        source
      },
      "applications": *[_type == "jobApplication" && job._ref == ^._id && appliedDate >= $startDate && appliedDate <= $endDate] {
        appliedDate,
        source
      }
    }
  `, { 
    jobId, 
    companyId, 
    startDate: dateRange.startDate.toISOString(), 
    endDate: dateRange.endDate.toISOString() 
  });

  if (!job) return null;

  // Calculate daily views
  const dailyViews = calculateDailyMetrics(job.viewLogs || [], 'timestamp', dateRange);

  // Calculate top sources
  const sourceCounts = (job.viewLogs || []).reduce((acc, log) => {
    const source = log.source || 'direct';
    acc[source] = (acc[source] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topSources = Object.entries(sourceCounts)
    .map(([source, count]) => ({ source, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // Calculate average time to application
  const applicationTimes = (job.applications || []).map(app => {
    const applyTime = new Date(app.appliedDate).getTime();
    const publishTime = new Date(job.publishedAt).getTime();
    return (applyTime - publishTime) / (1000 * 60 * 60 * 24); // Days
  });

  const avgTimeToApplication = applicationTimes.length > 0
    ? applicationTimes.reduce((sum, time) => sum + time, 0) / applicationTimes.length
    : 0;

  return {
    jobId: job._id,
    title: job.title,
    views: job.viewCount || 0,
    applications: job.applicationCount || 0,
    conversionRate: job.viewCount > 0 ? (job.applicationCount / job.viewCount) * 100 : 0,
    avgTimeToApplication,
    topSources,
    dailyViews
  };
}

function calculateMonthlyTrends(jobs: any[], applications: any[], dateRange: DateRange) {
  const trends: Record<string, any> = {};
  
  // Initialize months
  const current = new Date(dateRange.startDate);
  while (current <= dateRange.endDate) {
    const monthKey = format(current, 'yyyy-MM');
    trends[monthKey] = {
      month: format(current, 'MMM yyyy'),
      jobs: 0,
      applications: 0,
      hires: 0
    };
    current.setMonth(current.getMonth() + 1);
  }

  // Count jobs by month
  jobs.forEach(job => {
    const monthKey = format(new Date(job.publishedAt), 'yyyy-MM');
    if (trends[monthKey]) {
      trends[monthKey].jobs++;
    }
  });

  // Count applications and hires by month
  applications.forEach(app => {
    const monthKey = format(new Date(app.appliedDate), 'yyyy-MM');
    if (trends[monthKey]) {
      trends[monthKey].applications++;
      if (app.status === 'hired') {
        trends[monthKey].hires++;
      }
    }
  });

  return Object.values(trends);
}

function calculateDailyMetrics(
  items: any[],
  dateField: string,
  dateRange: DateRange
): Array<{ date: string; count: number }> {
  const dailyCounts: Record<string, number> = {};
  
  // Initialize all days in range
  const current = new Date(dateRange.startDate);
  while (current <= dateRange.endDate) {
    dailyCounts[format(current, 'yyyy-MM-dd')] = 0;
    current.setDate(current.getDate() + 1);
  }

  // Count items by day
  items.forEach(item => {
    const date = format(new Date(item[dateField]), 'yyyy-MM-dd');
    if (dailyCounts[date] !== undefined) {
      dailyCounts[date]++;
    }
  });

  return Object.entries(dailyCounts)
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

export async function exportAnalyticsReport(
  companyId: string,
  dateRange: DateRange,
  format: 'csv' | 'json' = 'csv'
) {
  const analytics = await getOverallAnalytics(companyId, dateRange);

  if (format === 'json') {
    return JSON.stringify(analytics, null, 2);
  }

  // Convert to CSV
  const rows = [
    ['Metric', 'Value'],
    ['Total Jobs', analytics.totalJobs],
    ['Total Views', analytics.totalViews],
    ['Total Applications', analytics.totalApplications],
    ['Average Conversion Rate', `${analytics.avgConversionRate.toFixed(2)}%`],
    ['Average Time to Hire', `${analytics.avgTimeToHire.toFixed(1)} days`],
    [''],
    ['Application Status', 'Count'],
    ...Object.entries(analytics.applicationsByStatus).map(([status, count]) => [status, count]),
    [''],
    ['Top Performing Jobs', 'Applications'],
    ...analytics.topPerformingJobs.map(job => [job.title, job.applications])
  ];

  return rows.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
}
```

### 3. Create Analytics API Routes

```typescript
// app/api/analytics/overview/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getOverallAnalytics } from '@/lib/analytics-utils';
import { subDays } from 'date-fns';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'employer') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const preset = searchParams.get('preset') || 'last30days';
    const startDateParam = searchParams.get('startDate');
    const endDateParam = searchParams.get('endDate');

    let dateRange;
    if (startDateParam && endDateParam) {
      dateRange = {
        startDate: new Date(startDateParam),
        endDate: new Date(endDateParam),
        preset: 'custom' as const
      };
    } else {
      const endDate = new Date();
      const days = preset === 'last7days' ? 7 : preset === 'last90days' ? 90 : 30;
      dateRange = {
        startDate: subDays(endDate, days),
        endDate,
        preset: preset as any
      };
    }

    const analytics = await getOverallAnalytics(session.user.companyId, dateRange);
    return NextResponse.json(analytics);
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}
```

### 4. Create Date Range Picker Component

```typescript
// components/Dashboard/DateRangePicker.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { format, subDays } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import type { DateRange } from '@/types/analytics';

interface DateRangePickerProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
}

export default function DateRangePicker({ value, onChange }: DateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false);

  const presets = [
    { label: 'Last 7 days', value: 'last7days', days: 7 },
    { label: 'Last 30 days', value: 'last30days', days: 30 },
    { label: 'Last 90 days', value: 'last90days', days: 90 },
    { label: 'Custom', value: 'custom', days: 0 },
  ];

  const handlePresetChange = (preset: string) => {
    if (preset === 'custom') {
      setIsOpen(true);
      return;
    }

    const presetConfig = presets.find(p => p.value === preset);
    if (presetConfig && presetConfig.days > 0) {
      onChange({
        startDate: subDays(new Date(), presetConfig.days),
        endDate: new Date(),
        preset: preset as any
      });
    }
  };

  const handleDateSelect = (dates: { from?: Date; to?: Date }) => {
    if (dates.from && dates.to) {
      onChange({
        startDate: dates.from,
        endDate: dates.to,
        preset: 'custom'
      });
      setIsOpen(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Select
        value={value.preset || 'custom'}
        onValueChange={handlePresetChange}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {presets.map(preset => (
            <SelectItem key={preset.value} value={preset.value}>
              {preset.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {value.preset === 'custom' && (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "justify-start text-left font-normal",
                "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {format(value.startDate, "PPP")} - {format(value.endDate, "PPP")}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <Calendar
              mode="range"
              selected={{
                from: value.startDate,
                to: value.endDate
              }}
              onSelect={handleDateSelect}
              numberOfMonths={2}
              disabled={(date) => date > new Date()}
            />
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
}
```

### 5. Create Performance Overview Component

```typescript
// components/Dashboard/Analytics/PerformanceOverview.tsx
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp, TrendingDown, Users, Eye, Briefcase, Target } from 'lucide-react';
import type { OverallAnalytics } from '@/types/analytics';

interface PerformanceOverviewProps {
  analytics: OverallAnalytics;
}

export default function PerformanceOverview({ analytics }: PerformanceOverviewProps) {
  const metrics = [
    {
      title: 'Total Views',
      value: analytics.totalViews.toLocaleString(),
      icon: Eye,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Total Applications',
      value: analytics.totalApplications.toLocaleString(),
      icon: Users,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Conversion Rate',
      value: `${analytics.avgConversionRate.toFixed(2)}%`,
      icon: Target,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      trend: analytics.avgConversionRate > 3 ? 'up' : 'down',
    },
    {
      title: 'Avg. Time to Hire',
      value: `${analytics.avgTimeToHire.toFixed(1)} days`,
      icon: Briefcase,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {metric.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${metric.bgColor}`}>
                  <Icon className={`h-4 w-4 ${metric.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metric.value}</div>
                {metric.trend && (
                  <div className="flex items-center gap-1 mt-2">
                    {metric.trend === 'up' ? (
                      <TrendingUp className="h-4 w-4 text-green-600" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-600" />
                    )}
                    <span className={`text-xs ${metric.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                      vs. industry avg (3%)
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Monthly Trends Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analytics.monthlyTrends}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200" />
                <XAxis dataKey="month" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '6px',
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="jobs"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  name="Jobs Posted"
                />
                <Line
                  type="monotone"
                  dataKey="applications"
                  stroke="#10b981"
                  strokeWidth={2}
                  name="Applications"
                />
                <Line
                  type="monotone"
                  dataKey="hires"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  name="Hires"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
```

### 6. Create Hiring Funnel Component

```typescript
// components/Dashboard/Analytics/HiringFunnel.tsx
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import type { OverallAnalytics } from '@/types/analytics';

interface HiringFunnelProps {
  analytics: OverallAnalytics;
}

export default function HiringFunnel({ analytics }: HiringFunnelProps) {
  const { hiringFunnel } = analytics;

  const stages = [
    {
      name: 'Applied',
      count: hiringFunnel.applied,
      percentage: 100,
      color: 'bg-blue-500',
    },
    {
      name: 'Reviewed',
      count: hiringFunnel.reviewed,
      percentage: hiringFunnel.applied > 0 ? (hiringFunnel.reviewed / hiringFunnel.applied) * 100 : 0,
      color: 'bg-indigo-500',
    },
    {
      name: 'Interviewed',
      count: hiringFunnel.interviewed,
      percentage: hiringFunnel.applied > 0 ? (hiringFunnel.interviewed / hiringFunnel.applied) * 100 : 0,
      color: 'bg-purple-500',
    },
    {
      name: 'Hired',
      count: hiringFunnel.hired,
      percentage: hiringFunnel.applied > 0 ? (hiringFunnel.hired / hiringFunnel.applied) * 100 : 0,
      color: 'bg-green-500',
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Hiring Funnel</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {stages.map((stage, index) => (
            <div key={stage.name}>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">{stage.name}</span>
                <span className="text-sm text-gray-600">
                  {stage.count} ({stage.percentage.toFixed(1)}%)
                </span>
              </div>
              <div className="relative">
                <Progress
                  value={stage.percentage}
                  className="h-8"
                  indicatorClassName={stage.color}
                />
                {index < stages.length - 1 && (
                  <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2">
                    <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 pt-6 border-t">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-600">Conversion Rate</p>
              <p className="font-semibold">
                {hiringFunnel.applied > 0 
                  ? `${((hiringFunnel.hired / hiringFunnel.applied) * 100).toFixed(1)}%`
                  : '0%'}
              </p>
            </div>
            <div>
              <p className="text-gray-600">Avg. per Job</p>
              <p className="font-semibold">
                {analytics.totalJobs > 0 
                  ? `${(hiringFunnel.hired / analytics.totalJobs).toFixed(1)} hires`
                  : '0 hires'}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
```

### 7. Create Job Performance Table

```typescript
// components/Dashboard/Analytics/JobPerformanceTable.tsx
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { ArrowUpRight, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import type { JobAnalytics } from '@/types/analytics';

interface JobPerformanceTableProps {
  jobs: JobAnalytics[];
}

export default function JobPerformanceTable({ jobs }: JobPerformanceTableProps) {
  const maxViews = Math.max(...jobs.map(j => j.views), 1);
  const maxApplications = Math.max(...jobs.map(j => j.applications), 1);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Performing Jobs</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Job Title</TableHead>
              <TableHead>Views</TableHead>
              <TableHead>Applications</TableHead>
              <TableHead>Conversion</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {jobs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  No job data available
                </TableCell>
              </TableRow>
            ) : (
              jobs.map((job) => (
                <TableRow key={job.jobId}>
                  <TableCell className="font-medium">
                    {job.title}
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="text-sm font-medium">{job.applications.toLocaleString()}</div>
                      <Progress
                        value={(job.applications / maxApplications) * 100}
                        className="h-2"
                        indicatorClassName="bg-green-500"
                      />
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{job.conversionRate.toFixed(2)}%</span>
                      {job.conversionRate > 5 && (
                        <TrendingUp className="h-4 w-4 text-green-600" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Link href={`/dashboard/analytics/job/${job.jobId}`}>
                      <ArrowUpRight className="h-4 w-4 text-gray-600 hover:text-gray-900" />
                    </Link>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
```

### 8. Create Application Status Breakdown

```typescript
// components/Dashboard/Analytics/ApplicationStatusBreakdown.tsx
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import type { OverallAnalytics } from '@/types/analytics';

interface ApplicationStatusBreakdownProps {
  analytics: OverallAnalytics;
}

const statusColors = {
  new: '#3b82f6',
  reviewed: '#6366f1',
  interviewing: '#8b5cf6',
  hired: '#10b981',
  rejected: '#ef4444',
};

const statusLabels = {
  new: 'New',
  reviewed: 'Reviewed',
  interviewing: 'Interviewing',
  hired: 'Hired',
  rejected: 'Rejected',
};

export default function ApplicationStatusBreakdown({ 
  analytics 
}: ApplicationStatusBreakdownProps) {
  const data = Object.entries(analytics.applicationsByStatus).map(([status, count]) => ({
    name: statusLabels[status as keyof typeof statusLabels] || status,
    value: count,
    color: statusColors[status as keyof typeof statusColors] || '#gray',
  }));

  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Application Status Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        <div className="mt-4 space-y-2">
          {data.map((item) => (
            <div key={item.name} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-sm">{item.name}</span>
              </div>
              <span className="text-sm font-medium">
                {item.value} ({total > 0 ? ((item.value / total) * 100).toFixed(1) : 0}%)
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
```

### 9. Create Analytics Dashboard Page

```typescript
// components/Dashboard/Analytics/AnalyticsDashboard.tsx
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Download, RefreshCw } from 'lucide-react';
import { subDays } from 'date-fns';
import DateRangePicker from '../DateRangePicker';
import PerformanceOverview from './PerformanceOverview';
import HiringFunnel from './HiringFunnel';
import JobPerformanceTable from './JobPerformanceTable';
import ApplicationStatusBreakdown from './ApplicationStatusBreakdown';
import type { OverallAnalytics, DateRange } from '@/types/analytics';

export default function AnalyticsDashboard() {
  const [analytics, setAnalytics] = useState<OverallAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange>({
    startDate: subDays(new Date(), 30),
    endDate: new Date(),
    preset: 'last30days',
  });

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange]);

  const fetchAnalytics = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      
      if (dateRange.preset && dateRange.preset !== 'custom') {
        params.append('preset', dateRange.preset);
      } else {
        params.append('startDate', dateRange.startDate.toISOString());
        params.append('endDate', dateRange.endDate.toISOString());
      }

      const response = await fetch(`/api/analytics/overview?${params}`);
      if (!response.ok) throw new Error('Failed to fetch analytics');
      
      const data = await response.json();
      setAnalytics(data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      setIsExporting(true);
      const params = new URLSearchParams();
      
      if (dateRange.preset && dateRange.preset !== 'custom') {
        params.append('preset', dateRange.preset);
      } else {
        params.append('startDate', dateRange.startDate.toISOString());
        params.append('endDate', dateRange.endDate.toISOString());
      }

      const response = await fetch(`/api/analytics/export?${params}`);
      if (!response.ok) throw new Error('Export failed');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics-report-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error exporting analytics:', error);
    } finally {
      setIsExporting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-10 w-40" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Failed to load analytics data</p>
        <Button onClick={fetchAnalytics} className="mt-4">
          <RefreshCw className="h-4 w-4 mr-2" />
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Analytics</h1>
          <p className="text-gray-600 mt-2">
            Track your job posting performance and hiring metrics
          </p>
        </div>
        <div className="flex items-center gap-4">
          <DateRangePicker value={dateRange} onChange={setDateRange} />
          <Button onClick={handleExport} disabled={isExporting} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Performance Overview */}
      <PerformanceOverview analytics={analytics} />

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <HiringFunnel analytics={analytics} />
        <ApplicationStatusBreakdown analytics={analytics} />
      </div>

      {/* Job Performance Table */}
      <JobPerformanceTable jobs={analytics.topPerformingJobs} />
    </div>
  );
}
```

### 10. Create Export API Route

```typescript
// app/api/analytics/export/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { exportAnalyticsReport } from '@/lib/analytics-utils';
import { subDays } from 'date-fns';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'employer') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const format = searchParams.get('format') || 'csv';
    const preset = searchParams.get('preset') || 'last30days';
    const startDateParam = searchParams.get('startDate');
    const endDateParam = searchParams.get('endDate');

    let dateRange;
    if (startDateParam && endDateParam) {
      dateRange = {
        startDate: new Date(startDateParam),
        endDate: new Date(endDateParam),
        preset: 'custom' as const
      };
    } else {
      const endDate = new Date();
      const days = preset === 'last7days' ? 7 : preset === 'last90days' ? 90 : 30;
      dateRange = {
        startDate: subDays(endDate, days),
        endDate,
        preset: preset as any
      };
    }

    const report = await exportAnalyticsReport(
      session.user.companyId,
      dateRange,
      format as 'csv' | 'json'
    );

    const contentType = format === 'json' ? 'application/json' : 'text/csv';
    const fileExtension = format === 'json' ? 'json' : 'csv';

    return new NextResponse(report, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="analytics-report-${new Date().toISOString().split('T')[0]}.${fileExtension}"`
      }
    });
  } catch (error) {
    console.error('Error exporting analytics:', error);
    return NextResponse.json(
      { error: 'Failed to export analytics' },
      { status: 500 }
    );
  }
}
```

### 11. Create Job Analytics Detail Page

```typescript
// app/dashboard/analytics/job/[jobId]/page.tsx
import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect, notFound } from 'next/navigation';
import { getJobAnalytics } from '@/lib/analytics-utils';
import { subDays } from 'date-fns';
import JobAnalyticsDetail from '@/components/Dashboard/Analytics/JobAnalyticsDetail';

export const metadata: Metadata = {
  title: 'Job Analytics | Dashboard',
  description: 'Detailed analytics for job posting',
};

export default async function JobAnalyticsPage({ 
  params 
}: { 
  params: { jobId: string } 
}) {
  const session = await getServerSession(authOptions);
  
  if (!session || session.user.role !== 'employer') {
    redirect('/auth/signin');
  }

  // Default to last 30 days
  const dateRange = {
    startDate: subDays(new Date(), 30),
    endDate: new Date(),
    preset: 'last30days' as const
  };

  const analytics = await getJobAnalytics(
    params.jobId,
    session.user.companyId,
    dateRange
  );

  if (!analytics) {
    notFound();
  }

  return (
    <div className="p-6">
      <JobAnalyticsDetail analytics={analytics} />
    </div>
  );
}
```

### 12. Create Main Analytics Page

```typescript
// app/dashboard/analytics/page.tsx
import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import AnalyticsDashboard from '@/components/Dashboard/Analytics/AnalyticsDashboard';

export const metadata: Metadata = {
  title: 'Analytics | Dashboard',
  description: 'Job posting analytics and insights',
};

export default async function AnalyticsPage() {
  const session = await getServerSession(authOptions);
  
  if (!session || session.user.role !== 'employer') {
    redirect('/auth/signin');
  }

  return (
    <div className="p-6">
      <AnalyticsDashboard />
    </div>
  );
}
```

## Verification Steps

1. **Test Date Range Selection:**
   - Select each preset (7, 30, 90 days)
   - Use custom date range picker
   - Verify data updates correctly

2. **Test Performance Metrics:**
   - Check all metric cards calculate correctly
   - Verify conversion rate calculation
   - Test with zero data scenarios

3. **Test Charts:**
   - Verify monthly trends chart renders
   - Check hiring funnel percentages
   - Test pie chart with various data
   - Ensure tooltips work properly

4. **Test Export Functionality:**
   - Export as CSV
   - Export as JSON (if implemented)
   - Verify file downloads correctly
   - Check data completeness

5. **Test Job Performance Table:**
   - Click through to job details
   - Verify progress bars scale correctly
   - Check sorting and data accuracy

6. **Test Responsive Design:**
   - View on mobile devices
   - Check chart responsiveness
   - Verify date picker works on touch

## Common Issues & Solutions

### Issue: Charts not rendering
**Solution:**
1. Ensure recharts is installed: `npm install recharts`
2. Check ResponsiveContainer has explicit height
3. Verify data format matches chart expectations

### Issue: Date range picker not working
**Solution:**
1. Install date-fns: `npm install date-fns`
2. Check Calendar component from shadcn/ui
3. Verify date parsing is correct

### Issue: Export creates empty file
**Solution:**
1. Check data fetching completes before export
2. Verify CSV generation logic
3. Test with console.log before download

### Issue: Analytics calculations incorrect
**Solution:**
1. Verify date filtering in queries
2. Check division by zero cases
3. Ensure proper data aggregation

## Next Steps

Proceed to [DOC-016: Company Profile Management](doc-016-company-profile.md) to build company profile editing features.

## Notes for Claude Code

When implementing analytics:
1. Always handle zero-data cases gracefully
2. Use proper number formatting for large values
3. Implement loading states for all charts
4. Consider caching analytics data
5. Add drill-down capabilities where useful
6. Test with various data volumes
7. Ensure date ranges are inclusive
8. Consider adding comparison periods
9. Add print-friendly styles for reports
                    <div className="space-y-1">
                      <div className="text-sm font-medium">{job.views.toLocaleString()}</div>
                      <Progress
                        value={(job.views / maxViews) * 100}
                        className="h-2"
                      />
                    </div>
                  </TableCell>
                  <TableCell>