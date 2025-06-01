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