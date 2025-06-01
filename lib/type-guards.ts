import type { Job, Company, JobApplication } from '@/types';

export function isJob(item: any): item is Job {
  return item?._type === 'jobPosting';
}

export function isCompany(item: any): item is Company {
  return item?._type === 'company';
}

export function isApplication(item: any): item is JobApplication {
  return item?._type === 'jobApplication';
}

export function hasValidLocation(job: Job): boolean {
  return !!(
    job.location?.city &&
    job.location?.coordinates?.lat &&
    job.location?.coordinates?.lng
  );
}