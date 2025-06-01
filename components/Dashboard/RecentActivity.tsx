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
            <p className="text-sm mt-2">Activity will appear here when you receive applications or post jobs.</p>
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
                    {activity.type === 'job_posted' && activity.metadata?.jobId && (
                      <Link 
                        href={`/dashboard/jobs/${activity.metadata.jobId}`}
                        className="text-xs text-blue-600 hover:underline"
                      >
                        View job →
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