import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getCategories } from '@/lib/sanity-utils';
import JobForm from '@/components/Dashboard/JobForm';

export const metadata: Metadata = {
  title: 'Edit Job | Dashboard',
  description: 'Edit job posting',
};

async function getJob(jobId: string) {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL}/api/jobs/${jobId}`,
    { cache: 'no-store' }
  );
  
  if (!response.ok) return null;
  return response.json();
}

export default async function EditJobPage({ 
  params 
}: { 
  params: { jobId: string } 
}) {
  const [job, categories] = await Promise.all([
    getJob(params.jobId),
    getCategories()
  ]);

  if (!job) {
    notFound();
  }

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Edit Job</h1>
        <JobForm 
          initialData={job} 
          jobId={params.jobId}
          categories={categories} 
        />
      </div>
    </div>
  );
}