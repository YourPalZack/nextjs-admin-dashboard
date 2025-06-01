import { client } from './sanity';

// Job mutations
export async function createJob(data: any, companyId: string) {
  return client.create({
    _type: 'jobPosting',
    ...data,
    company: { _ref: companyId },
    status: 'draft',
    viewCount: 0,
    applicationCount: 0,
    createdAt: new Date().toISOString(),
  });
}

export async function updateJob(jobId: string, data: any) {
  return client.patch(jobId).set(data).commit();
}

export async function publishJob(jobId: string) {
  return client
    .patch(jobId)
    .set({ 
      status: 'published',
      publishedAt: new Date().toISOString()
    })
    .commit();
}

export async function deleteJob(jobId: string) {
  return client.delete(jobId);
}

// Application mutations
export async function updateApplicationStatus(
  applicationId: string,
  status: string
) {
  return client
    .patch(applicationId)
    .set({ status })
    .commit();
}

export async function addEmployerNotes(
  applicationId: string,
  notes: string
) {
  return client
    .patch(applicationId)
    .set({ employerNotes: notes })
    .commit();
}

// Company mutations
export async function createCompany(data: any, userId: string) {
  return client.create({
    _type: 'company',
    ...data,
    ownerId: userId,
    verified: false,
    createdAt: new Date().toISOString(),
  });
}

export async function updateCompany(companyId: string, data: any) {
  return client.patch(companyId).set(data).commit();
}