# DOC-011: Application System

## Overview
This document covers implementing the job application system, including the application form, resume upload to Sanity assets, submission handling, email confirmations, and application tracking for job seekers.

## Prerequisites
- DOC-001 through DOC-010 completed
- Sanity client configured with write permissions
- Resend API key configured
- Authentication system working

## Steps

### 1. Create Application Types

First, define the TypeScript types for applications:

```typescript
// types/application.ts
export interface JobApplication {
  _id: string;
  _type: 'jobApplication';
  job: {
    _ref: string;
    _type: 'reference';
  };
  applicantInfo: {
    name: string;
    email: string;
    phone: string;
    resumeUrl?: string;
    linkedIn?: string;
  };
  coverMessage: string;
  status: 'new' | 'reviewed' | 'interviewing' | 'hired' | 'rejected';
  appliedDate: string;
  rating?: number;
  employerNotes?: string;
  interviewDate?: string;
}

export interface ApplicationFormData {
  name: string;
  email: string;
  phone: string;
  resume?: File;
  linkedIn?: string;
  coverMessage: string;
}
```

### 2. Create Resume Upload Handler

Create an API route to handle resume uploads to Sanity:

```typescript
// app/api/upload-resume/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { client } from '@/lib/sanity';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type and size
    const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Please upload PDF or DOC/DOCX' },
        { status: 400 }
      );
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      return NextResponse.json(
        { error: 'File too large. Maximum size is 5MB' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // Upload to Sanity
    const asset = await client.assets.upload('file', buffer, {
      filename: file.name,
      contentType: file.type,
    });

    return NextResponse.json({ 
      url: asset.url,
      assetId: asset._id 
    });
  } catch (error) {
    console.error('Resume upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload resume' },
      { status: 500 }
    );
  }
}
```

### 3. Create Application Form Component

Build the application form using NextAdmin components:

```typescript
// components/Public/ApplicationForm.tsx
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Upload, CheckCircle } from 'lucide-react';
import type { ApplicationFormData } from '@/types/application';

const applicationSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().regex(/^[\d\s\-\(\)]+$/, 'Invalid phone number'),
  linkedIn: z.string().url().optional().or(z.literal('')),
  coverMessage: z.string().min(50, 'Cover message must be at least 50 characters'),
});

interface ApplicationFormProps {
  jobId: string;
  jobTitle: string;
  companyName: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function ApplicationForm({
  jobId,
  jobTitle,
  companyName,
  onSuccess,
  onCancel,
}: ApplicationFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ApplicationFormData>({
    resolver: zodResolver(applicationSchema),
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setResumeFile(file);
      setError(null);
    }
  };

  const uploadResume = async (file: File): Promise<string | null> => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      setUploadProgress(30);
      const response = await fetch('/api/upload-resume', {
        method: 'POST',
        body: formData,
      });

      setUploadProgress(70);
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Upload failed');
      }

      const data = await response.json();
      setUploadProgress(100);
      return data.url;
    } catch (error) {
      console.error('Resume upload error:', error);
      setError(error.message || 'Failed to upload resume');
      return null;
    }
  };

  const onSubmit = async (data: ApplicationFormData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      let resumeUrl = null;
      
      // Upload resume if provided
      if (resumeFile) {
        resumeUrl = await uploadResume(resumeFile);
        if (!resumeUrl) {
          setIsSubmitting(false);
          return;
        }
      }

      // Submit application
      const response = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobId,
          applicantInfo: {
            ...data,
            resumeUrl,
          },
          coverMessage: data.coverMessage,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit application');
      }

      onSuccess();
    } catch (error) {
      setError(error.message || 'Failed to submit application');
    } finally {
      setIsSubmitting(false);
      setUploadProgress(0);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold">{jobTitle}</h3>
        <p className="text-sm text-gray-600">at {companyName}</p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-4">
        <div>
          <Label htmlFor="name">Full Name *</Label>
          <Input
            id="name"
            {...register('name')}
            placeholder="John Smith"
            disabled={isSubmitting}
          />
          {errors.name && (
            <p className="text-sm text-red-600 mt-1">{errors.name.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="email">Email Address *</Label>
          <Input
            id="email"
            type="email"
            {...register('email')}
            placeholder="john@example.com"
            disabled={isSubmitting}
          />
          {errors.email && (
            <p className="text-sm text-red-600 mt-1">{errors.email.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="phone">Phone Number *</Label>
          <Input
            id="phone"
            type="tel"
            {...register('phone')}
            placeholder="(303) 555-0100"
            disabled={isSubmitting}
          />
          {errors.phone && (
            <p className="text-sm text-red-600 mt-1">{errors.phone.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="linkedIn">LinkedIn Profile (Optional)</Label>
          <Input
            id="linkedIn"
            {...register('linkedIn')}
            placeholder="https://linkedin.com/in/yourprofile"
            disabled={isSubmitting}
          />
          {errors.linkedIn && (
            <p className="text-sm text-red-600 mt-1">{errors.linkedIn.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="resume">Resume (PDF, DOC, DOCX - Max 5MB)</Label>
          <div className="mt-2">
            <Input
              id="resume"
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={handleFileChange}
              disabled={isSubmitting}
              className="cursor-pointer"
            />
            {resumeFile && (
              <p className="text-sm text-gray-600 mt-2 flex items-center gap-2">
                <Upload className="h-4 w-4" />
                {resumeFile.name}
              </p>
            )}
            {uploadProgress > 0 && uploadProgress < 100 && (
              <div className="mt-2">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        <div>
          <Label htmlFor="coverMessage">Cover Message *</Label>
          <Textarea
            id="coverMessage"
            {...register('coverMessage')}
            placeholder="Tell us why you're a great fit for this position..."
            rows={5}
            disabled={isSubmitting}
          />
          {errors.coverMessage && (
            <p className="text-sm text-red-600 mt-1">{errors.coverMessage.message}</p>
          )}
        </div>
      </div>

      <div className="flex gap-4">
        <Button
          type="submit"
          className="flex-1"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Submitting...
            </>
          ) : (
            'Submit Application'
          )}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
```

### 4. Create Application Submission API

Create the API route to handle application submissions:

```typescript
// app/api/applications/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { client } from '@/lib/sanity';
import { sendApplicationConfirmation } from '@/lib/email';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const session = await getServerSession(authOptions);

    // Create application in Sanity
    const application = await client.create({
      _type: 'jobApplication',
      job: {
        _type: 'reference',
        _ref: body.jobId,
      },
      applicantInfo: body.applicantInfo,
      coverMessage: body.coverMessage,
      status: 'new',
      appliedDate: new Date().toISOString(),
      userId: session?.user?.id || null,
    });

    // Increment application count on job
    await client
      .patch(body.jobId)
      .inc({ applicationCount: 1 })
      .commit();

    // Fetch job details for email
    const job = await client.fetch(
      `*[_type == "jobPosting" && _id == $jobId][0]{
        title,
        "companyName": company->name,
        "companyEmail": company->email
      }`,
      { jobId: body.jobId }
    );

    // Send confirmation email
    await sendApplicationConfirmation({
      to: body.applicantInfo.email,
      applicantName: body.applicantInfo.name,
      jobTitle: job.title,
      companyName: job.companyName,
    });

    return NextResponse.json({ 
      success: true, 
      applicationId: application._id 
    });
  } catch (error) {
    console.error('Application submission error:', error);
    return NextResponse.json(
      { error: 'Failed to submit application' },
      { status: 500 }
    );
  }
}

// GET endpoint for retrieving user's applications
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ applications: [] });
    }

    const applications = await client.fetch(
      `*[_type == "jobApplication" && applicantInfo.email == $email] | order(appliedDate desc) {
        _id,
        status,
        appliedDate,
        "job": job->{
          _id,
          title,
          slug,
          "company": company->{
            name,
            logo
          }
        }
      }`,
      { email: session.user.email }
    );

    return NextResponse.json({ applications });
  } catch (error) {
    console.error('Error fetching applications:', error);
    return NextResponse.json(
      { error: 'Failed to fetch applications' },
      { status: 500 }
    );
  }
}
```

### 5. Create Email Templates

Set up email templates using React Email:

```typescript
// lib/email/templates/ApplicationConfirmation.tsx
import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Text,
} from '@react-email/components';

interface ApplicationConfirmationProps {
  applicantName: string;
  jobTitle: string;
  companyName: string;
}

export function ApplicationConfirmationEmail({
  applicantName,
  jobTitle,
  companyName,
}: ApplicationConfirmationProps) {
  return (
    <Html>
      <Head />
      <Preview>Your application for {jobTitle} has been received</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Application Received!</Heading>
          
          <Text style={text}>Hi {applicantName},</Text>
          
          <Text style={text}>
            Thank you for applying to the <strong>{jobTitle}</strong> position 
            at <strong>{companyName}</strong>.
          </Text>
          
          <Text style={text}>
            We've successfully received your application. The employer will 
            review it and contact you if they'd like to move forward with 
            the next steps.
          </Text>
          
          <Text style={text}>
            You can track all your applications by logging into your account.
          </Text>
          
          <Link href="https://coloradotradesjobs.com/dashboard/applications" style={button}>
            View My Applications
          </Link>
          
          <Text style={footer}>
            Best of luck with your application!
            <br />
            The Colorado Trades Jobs Team
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
};

const h1 = {
  color: '#333',
  fontSize: '24px',
  fontWeight: '600',
  lineHeight: '40px',
  margin: '0 0 20px',
  padding: '0 48px',
};

const text = {
  color: '#333',
  fontSize: '16px',
  lineHeight: '26px',
  margin: '0 0 10px',
  padding: '0 48px',
};

const button = {
  backgroundColor: '#2563eb',
  borderRadius: '5px',
  color: '#fff',
  display: 'inline-block',
  fontSize: '16px',
  fontWeight: '600',
  lineHeight: '50px',
  textAlign: 'center' as const,
  textDecoration: 'none',
  width: '200px',
  margin: '20px auto',
};

const footer = {
  color: '#666',
  fontSize: '14px',
  lineHeight: '24px',
  margin: '32px 0 0',
  padding: '0 48px',
};
```

### 6. Create Email Sending Function

Set up the email sending utility:

```typescript
// lib/email/index.ts
import { Resend } from 'resend';
import { ApplicationConfirmationEmail } from './templates/ApplicationConfirmation';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendApplicationConfirmation({
  to,
  applicantName,
  jobTitle,
  companyName,
}: {
  to: string;
  applicantName: string;
  jobTitle: string;
  companyName: string;
}) {
  try {
    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'noreply@coloradotradesjobs.com',
      to,
      subject: `Application Received - ${jobTitle} at ${companyName}`,
      react: ApplicationConfirmationEmail({ applicantName, jobTitle, companyName }),
    });

    if (error) {
      console.error('Email send error:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Failed to send email:', error);
    throw error;
  }
}
```

### 7. Create Application Tracking Page

Build a page for job seekers to track their applications:

```typescript
// app/(public)/my-applications/page.tsx
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import ApplicationsList from '@/components/Public/ApplicationsList';

export default async function MyApplicationsPage() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect('/auth/signin?callbackUrl=/my-applications');
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">My Applications</h1>
      <ApplicationsList userEmail={session.user.email} />
    </div>
  );
}
```

### 8. Create Applications List Component

```typescript
// components/Public/ApplicationsList.tsx
'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar, Building2, FileText } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';

interface Application {
  _id: string;
  status: 'new' | 'reviewed' | 'interviewing' | 'hired' | 'rejected';
  appliedDate: string;
  job: {
    _id: string;
    title: string;
    slug: { current: string };
    company: {
      name: string;
      logo?: any;
    };
  };
}

const statusConfig = {
  new: { label: 'Submitted', variant: 'default' as const },
  reviewed: { label: 'Under Review', variant: 'secondary' as const },
  interviewing: { label: 'Interview Stage', variant: 'default' as const },
  hired: { label: 'Hired', variant: 'default' as const },
  rejected: { label: 'Not Selected', variant: 'destructive' as const },
};

export default function ApplicationsList({ userEmail }: { userEmail: string }) {
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const response = await fetch('/api/applications');
      if (!response.ok) throw new Error('Failed to fetch applications');
      
      const data = await response.json();
      setApplications(data.applications);
    } catch (error) {
      setError('Failed to load applications');
      console.error('Error fetching applications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-3/4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-1/2" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <p className="text-red-600">{error}</p>
          <Button onClick={fetchApplications} className="mt-4">
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (applications.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Applications Yet</h3>
          <p className="text-gray-600 mb-4">
            Start applying to jobs to track your applications here.
          </p>
          <Link href="/jobs">
            <Button>Browse Jobs</Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {applications.map((application) => (
        <Card key={application._id} className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-xl">
                  {application.job.title}
                </CardTitle>
                <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                  <span className="flex items-center gap-1">
                    <Building2 className="h-4 w-4" />
                    {application.job.company.name}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    Applied {format(new Date(application.appliedDate), 'MMM d, yyyy')}
                  </span>
                </div>
              </div>
              <Badge variant={statusConfig[application.status].variant}>
                {statusConfig[application.status].label}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Link href={`/jobs/${application.job.slug.current}`}>
                <Button variant="outline" size="sm">
                  View Job
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
```

### 9. Add Application Modal to Job Detail Page

Update the job detail page to include the application modal:

```typescript
// components/Public/ApplyButton.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { CheckCircle } from 'lucide-react';
import ApplicationForm from './ApplicationForm';

interface ApplyButtonProps {
  jobId: string;
  jobTitle: string;
  companyName: string;
}

export default function ApplyButton({ jobId, jobTitle, companyName }: ApplyButtonProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleApplyClick = () => {
    if (!session) {
      router.push(`/auth/signin?callbackUrl=/jobs/${jobId}`);
      return;
    }
    setShowModal(true);
  };

  const handleSuccess = () => {
    setShowModal(false);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 5000);
  };

  return (
    <>
      <Button 
        onClick={handleApplyClick} 
        size="lg" 
        className="w-full sm:w-auto"
      >
        Apply Now
      </Button>

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Apply for Position</DialogTitle>
          </DialogHeader>
          <ApplicationForm
            jobId={jobId}
            jobTitle={jobTitle}
            companyName={companyName}
            onSuccess={handleSuccess}
            onCancel={() => setShowModal(false)}
          />
        </DialogContent>
      </Dialog>

      {showSuccess && (
        <div className="fixed bottom-4 right-4 bg-green-600 text-white p-4 rounded-lg shadow-lg flex items-center gap-2 animate-in slide-in-from-bottom">
          <CheckCircle className="h-5 w-5" />
          <div>
            <p className="font-semibold">Application Submitted!</p>
            <p className="text-sm">Check your email for confirmation.</p>
          </div>
        </div>
      )}
    </>
  );
}
```

## Verification Steps

1. **Test Application Form:**
   - Navigate to a job detail page
   - Click "Apply Now" button
   - Fill out form with valid data
   - Verify form validation works
   - Submit application

2. **Test Resume Upload:**
   - Select a PDF file under 5MB
   - Verify upload progress shows
   - Try uploading invalid file types (should show error)
   - Try uploading file over 5MB (should show error)

3. **Test Email Confirmation:**
   - Submit an application
   - Check email for confirmation
   - Verify email contains correct job details

4. **Test Application Tracking:**
   - Sign in as a job seeker
   - Navigate to /my-applications
   - Verify submitted applications appear
   - Check application status badges

5. **Test Error Handling:**
   - Submit form with network disconnected
   - Verify error messages appear
   - Test retry functionality

## Common Issues & Solutions

### Issue: Resume upload fails with "Failed to upload resume"
**Solution:** 
1. Check Sanity API token has write permissions
2. Verify file size is under 5MB
3. Ensure Sanity asset upload is enabled in project settings

### Issue: Email not sending
**Solution:**
1. Verify RESEND_API_KEY is set in .env.local
2. Check EMAIL_FROM address is verified in Resend
3. Monitor Resend dashboard for quota limits

### Issue: Applications not showing in tracking page
**Solution:**
1. Ensure user is signed in
2. Check email matches between session and application
3. Verify Sanity query permissions

### Issue: Form validation not working properly
**Solution:**
1. Ensure @hookform/resolvers and zod are installed
2. Check zodResolver is imported correctly
3. Verify form field names match schema

## Next Steps

Proceed to [DOC-012: Dashboard Overview](doc-012-dashboard-overview.md) to build the employer dashboard homepage.

## Notes for Claude Code

When implementing the application system:
1. Always validate file uploads on both client and server
2. Use optimistic UI updates for better UX
3. Implement proper error boundaries
4. Consider adding application draft saving
5. Test with various file types and sizes
6. Ensure mobile users can easily upload resumes
7. Add loading states for all async operations
8. Consider implementing rate limiting for applications