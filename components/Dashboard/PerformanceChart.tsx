'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { JobPerformance } from '@/types/dashboard';

interface PerformanceChartProps {
  jobs: JobPerformance[];
}

export default function PerformanceChart({ jobs }: PerformanceChartProps) {
  if (!jobs || jobs.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Top Performing Jobs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center text-gray-500">
            <div className="text-center">
              <p>No job performance data available</p>
              <p className="text-sm mt-2">Post some jobs to see performance metrics here.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

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
                formatter={(value, name) => [
                  value,
                  name === 'views' ? 'Views' : 'Applications'
                ]}
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