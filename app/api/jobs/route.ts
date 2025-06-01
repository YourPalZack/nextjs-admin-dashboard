import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth.config';
import { client } from '@/lib/sanity.client';
import { jobFormSchema } from '@/lib/validations/job';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig);
    if (!session || session.user.role !== 'employer') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = jobFormSchema.parse(body);

    const job = await client.create({
      _type: 'jobPosting',
      ...validatedData,
      company: {
        _type: 'reference',
        _ref: session.user.companyId
      },
      slug: {
        _type: 'slug',
        current: validatedData.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '')
      },
      publishedAt: validatedData.status === 'published' ? new Date().toISOString() : null,
      viewCount: 0,
      applicationCount: 0
    });

    return NextResponse.json(job);
  } catch (error) {
    console.error('Error creating job:', error);
    return NextResponse.json(
      { error: 'Failed to create job' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig);
    if (!session || session.user.role !== 'employer') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const jobs = await client.fetch(
      `*[_type == "jobPosting" && company._ref == $companyId] | order(publishedAt desc) {
        _id,
        title,
        status,
        viewCount,
        applicationCount,
        publishedAt,
        applicationDeadline,
        "slug": slug.current
      }`,
      { companyId: session.user.companyId }
    );

    return NextResponse.json(jobs);
  } catch (error) {
    console.error('Error fetching jobs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch jobs' },
      { status: 500 }
    );
  }
}