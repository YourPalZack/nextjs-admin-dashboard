'use client';

import StatsCards from './StatsCards';
import RecentActivityFeed from './RecentActivity';
import QuickActions from './QuickActions';
import PerformanceChart from './PerformanceChart';
import ApplicationTrends from './ApplicationTrends';
import type { DashboardStats, RecentActivity, JobPerformance, ApplicationTrend } from '@/types/dashboard';

interface DashboardContentProps {
  stats: DashboardStats;
  recentActivity: RecentActivity[];
  topJobs: JobPerformance[];
  applicationTrends: ApplicationTrend[];
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
          Welcome back! Here's an overview of your job postings and applications.
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