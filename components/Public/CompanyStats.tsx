import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, Users, Briefcase, Calendar } from 'lucide-react';

interface CompanyStatsProps {
  stats: {
    totalJobs: number;
    totalHires: number;
    avgTimeToHire: number;
    growthRate: number;
  };
}

export default function CompanyStats({ stats }: CompanyStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Jobs</p>
              <p className="text-2xl font-bold">{stats.totalJobs}</p>
            </div>
            <Briefcase className="h-8 w-8 text-blue-500 opacity-20" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Hires</p>
              <p className="text-2xl font-bold">{stats.totalHires}</p>
            </div>
            <Users className="h-8 w-8 text-green-500 opacity-20" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg. Time to Hire</p>
              <p className="text-2xl font-bold">{stats.avgTimeToHire} days</p>
            </div>
            <Calendar className="h-8 w-8 text-orange-500 opacity-20" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Growth Rate</p>
              <p className="text-2xl font-bold">+{stats.growthRate}%</p>
            </div>
            <TrendingUp className="h-8 w-8 text-purple-500 opacity-20" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}