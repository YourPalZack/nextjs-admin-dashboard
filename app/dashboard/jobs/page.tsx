import { Metadata } from 'next';
import JobsDataTable from '@/components/Dashboard/JobsDataTable';

export const metadata: Metadata = {
  title: 'Manage Jobs | Dashboard',
  description: 'Manage your job postings',
};

export default function JobsPage() {
  return (
    <div className="p-6">
      <JobsDataTable />
    </div>
  );
}