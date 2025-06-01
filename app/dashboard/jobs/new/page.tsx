import { Metadata } from 'next';
import { getCategories } from '@/lib/sanity-utils';
import JobForm from '@/components/Dashboard/JobForm';

export const metadata: Metadata = {
  title: 'Post New Job | Dashboard',
  description: 'Create a new job posting',
};

export default async function NewJobPage() {
  const categories = await getCategories();

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Post New Job</h1>
        <JobForm categories={categories} />
      </div>
    </div>
  );
}