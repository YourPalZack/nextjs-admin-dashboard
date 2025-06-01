import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth.config';
import { client } from '@/lib/sanity.client';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig);
    if (!session || session.user.role !== 'employer') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { action, jobIds } = await request.json();

    if (!action || !jobIds || !Array.isArray(jobIds)) {
      return NextResponse.json(
        { error: 'Invalid request' },
        { status: 400 }
      );
    }

    // Verify ownership of all jobs
    const jobs = await client.fetch(
      `*[_type == "jobPosting" && _id in $jobIds && company._ref == $companyId]._id`,
      { jobIds, companyId: session.user.companyId }
    );

    if (jobs.length !== jobIds.length) {
      return NextResponse.json(
        { error: 'One or more jobs not found or unauthorized' },
        { status: 403 }
      );
    }

    switch (action) {
      case 'delete':
        await Promise.all(jobIds.map(id => client.delete(id)));
        break;
      
      case 'expire':
        await Promise.all(
          jobIds.map(id => 
            client.patch(id).set({ status: 'expired' }).commit()
          )
        );
        break;
      
      case 'publish':
        await Promise.all(
          jobIds.map(id => 
            client.patch(id).set({ 
              status: 'published',
              publishedAt: new Date().toISOString()
            }).commit()
          )
        );
        break;
      
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

    return NextResponse.json({ success: true, count: jobIds.length });
  } catch (error) {
    console.error('Error performing bulk operation:', error);
    return NextResponse.json(
      { error: 'Failed to perform bulk operation' },
      { status: 500 }
    );
  }
}