import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth.config';
import { 
  getDashboardStats, 
  getRecentActivity, 
  getTopPerformingJobs,
  getApplicationTrends 
} from '@/lib/dashboard-utils';
import DashboardContent from '@/components/Dashboard/DashboardContent';

export default async function DashboardPage() {
  const session = await getServerSession(authConfig);
  
  if (!session || session.user.role !== 'employer') {
    redirect('/auth/signin');
  }

  const companyId = session.user.companyId || '';
  
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