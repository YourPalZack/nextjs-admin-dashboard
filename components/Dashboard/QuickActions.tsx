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