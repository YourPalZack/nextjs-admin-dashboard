# DOC-008: Job Detail Page

## Overview
Create the individual job detail page with static generation, application form, and related jobs.

## Prerequisites  
- Job listing page complete (from DOC-007)
- Sanity queries configured (from DOC-005)
- Authentication working (from DOC-004)

## Steps

### 1. Create Job Detail Page

Create `app/(public)/jobs/[slug]/page.tsx`:

```typescript
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import JobDetailContent from '@/components/Public/JobDetailContent';
import JobDetailSkeleton from '@/components/Public/JobDetailSkeleton';
import RelatedJobs from '@/components/Public/RelatedJobs';
import PageContainer from '@/components/Shared/PageContainer';
import { getJobBySlug, getRelatedJobs } from '@/lib/sanity-utils';
import { client } from '@/lib/sanity';

interface JobDetailPageProps {
  params: {
    slug: string;
  };
}

// Generate static params for all jobs
export async function generateStaticParams() {
  const jobs = await client.fetch(`
    *[_type == "jobPosting" && status == "published"] {
      "slug": slug.current
    }
  `);

  return jobs.map((job: any) => ({
    slug: job.slug,
  }));
}

// Generate metadata for SEO
export async function generateMetadata({
  params,
}: JobDetailPageProps): Promise<Metadata> {
  const job = await getJobBySlug(params.slug);

  if (!job) {
    return {
      title: 'Job Not Found',
    };
  }

  const description = job.description?.[0]?.children?.[0]?.text || '';
  const salary = job.showSalary && job.salaryMin
    ? `$${job.salaryMin.toLocaleString()}${
        job.salaryMax ? `-${job.salaryMax.toLocaleString()}` : '+'
      } ${job.salaryType === 'hourly' ? '/hr' : '/yr'}`
    : '';

  return {
    title: `${job.title} at ${job.company.name}`,
    description: `${description.substring(0, 160)}... ${salary}`,
    openGraph: {
      title: job.title,
      description: description.substring(0, 160),
      type: 'website',
      images: job.company.logo ? [urlFor(job.company.logo).url()] : [],
    },
  };
}

export default async function JobDetailPage({ params }: JobDetailPageProps) {
  const job = await getJobBySlug(params.slug);

  if (!job) {
    notFound();
  }

  // Fetch related jobs
  const relatedJobs = await getRelatedJobs(
    job.slug.current,
    job.category._id,
    job.location.city
  );

  return (
    <PageContainer>
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          <Suspense fallback={<JobDetailSkeleton />}>
            <JobDetailContent job={job} />
          </Suspense>
          
          {/* Related Jobs */}
          {relatedJobs.length > 0 && (
            <div className="mt-12">
              <h2 className="text-2xl font-bold mb-6">Similar Jobs</h2>
              <RelatedJobs jobs={relatedJobs} />
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-24">
            <ApplicationCard job={job} />
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
```

### 2. Create Job Detail Content Component

Create `components/Public/JobDetailContent.tsx`:

```typescript
'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { PortableText } from '@portabletext/react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  MapPin,
  Briefcase,
  DollarSign,
  Clock,
  Calendar,
  Users,
  Building2,
  CheckCircle2,
  AlertCircle,
  Share2,
  Bookmark,
  Globe,
} from 'lucide-react';
import { Job } from '@/types';
import { formatDistanceToNow, format } from 'date-fns';
import { urlFor } from '@/lib/sanity';
import { useToast } from '@/components/ui/use-toast';

interface JobDetailContentProps {
  job: Job;
}

export default function JobDetailContent({ job }: JobDetailContentProps) {
  const { toast } = useToast();
  const [isSaved, setIsSaved] = useState(false);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: job.title,
          text: `Check out this job at ${job.company.name}`,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback - copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: 'Link copied!',
        description: 'Job link has been copied to your clipboard.',
      });
    }
  };

  const handleSave = () => {
    setIsSaved(!isSaved);
    toast({
      title: isSaved ? 'Job removed' : 'Job saved!',
      description: isSaved 
        ? 'Job has been removed from your saved jobs.'
        : 'Job has been saved to your profile.',
    });
  };

  const salaryDisplay = job.showSalary && job.salaryMin
    ? `${job.salaryMin.toLocaleString()}${
        job.salaryMax ? ` - ${job.salaryMax.toLocaleString()}` : '+'
      } ${job.salaryType === 'hourly' ? '/hr' : '/yr'}`
    : 'Competitive salary';

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              {/* Company Logo */}
              {job.company.logo && (
                <Image
                  src={urlFor(job.company.logo).width(80).height(80).url()}
                  alt={job.company.name}
                  width={80}
                  height={80}
                  className="rounded-lg"
                />
              )}
              
              <div>
                <h1 className="text-2xl font-bold">{job.title}</h1>
                <div className="flex items-center gap-2 mt-1">
                  <Link
                    href={`/companies/${job.company.slug.current}`}
                    className="text-blue-600 hover:underline font-medium"
                  >
                    {job.company.name}
                  </Link>
                  {job.company.verified && (
                    <CheckCircle2 className="h-4 w-4 text-blue-500" />
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={handleShare}
              >
                <Share2 className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={handleSave}
              >
                <Bookmark className={`h-4 w-4 ${isSaved ? 'fill-current' : ''}`} />
              </Button>
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mt-4">
            {job.isUrgent && (
              <Badge variant="destructive" className="gap-1">
                <AlertCircle className="h-3 w-3" />
                Urgent Hire
              </Badge>
            )}
            {job.featured && (
              <Badge variant="default">Featured</Badge>
            )}
            <Badge variant="secondary">{job.category.name}</Badge>
            <Badge variant="outline">{job.experienceLevel}</Badge>
            {job.remoteOptions !== 'onsite' && (
              <Badge variant="outline">
                {job.remoteOptions === 'remote' ? 'Remote' : 'Hybrid'}
              </Badge>
            )}
          </div>
        </CardHeader>

        <Separator />

        <CardContent className="pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-gray-500" />
              <div>
                <p className="text-sm text-gray-500">Location</p>
                <p className="font-medium">{job.location.city}, CO</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-gray-500" />
              <div>
                <p className="text-sm text-gray-500">Job Type</p>
                <p className="font-medium">{job.jobType}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-gray-500" />
              <div>
                <p className="text-sm text-gray-500">Salary</p>
                <p className="font-medium">{salaryDisplay}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <div>
                <p className="text-sm text-gray-500">Posted</p>
                <p className="font-medium">
                  {formatDistanceToNow(new Date(job.publishedAt), { addSuffix: true })}
                </p>
              </div>
            </div>
          </div>

          {job.applicationDeadline && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                <Clock className="inline h-4 w-4 mr-1" />
                Application deadline: {format(new Date(job.applicationDeadline), 'MMMM d, yyyy')}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Job Description */}
      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold">Job Description</h2>
        </CardHeader>
        <CardContent>
          <div className="prose prose-gray max-w-none">
            <PortableText value={job.description} />
          </div>
        </CardContent>
      </Card>

      {/* Requirements */}
      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold">Requirements</h2>
        </CardHeader>
        <CardContent>
          <div className="whitespace-pre-wrap">{job.requirements}</div>
          
          {job.skills && job.skills.length > 0 && (
            <div className="mt-4">
              <h3 className="font-medium mb-2">Required Skills:</h3>
              <div className="flex flex-wrap gap-2">
                {job.skills.map((skill) => (
                  <Badge key={skill} variant="secondary">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {job.certifications && job.certifications.length > 0 && (
            <div className="mt-4">
              <h3 className="font-medium mb-2">Required Certifications:</h3>
              <div className="flex flex-wrap gap-2">
                {job.certifications.map((cert) => (
                  <Badge key={cert} variant="secondary">
                    {cert}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Responsibilities */}
      {job.responsibilities && (
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold">Responsibilities</h2>
          </CardHeader>
          <CardContent>
            <div className="whitespace-pre-wrap">{job.responsibilities}</div>
          </CardContent>
        </Card>
      )}

      {/* Benefits */}
      {job.benefits && job.benefits.length > 0 && (
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold">Benefits</h2>
          </CardHeader>
          <CardContent>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {job.benefits.map((benefit) => (
                <li key={benefit} className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Company Info */}
      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold">About {job.company.name}</h2>
        </CardHeader>
        <CardContent>
          {job.company.description && (
            <div className="prose prose-gray max-w-none mb-4">
              <PortableText value={job.company.description} />
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            {job.company.size && (
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-gray-500" />
                <span className="text-sm">
                  Company size: <span className="font-medium">{job.company.size} employees</span>
                </span>
              </div>
            )}
            
            {job.company.website && (
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-gray-500" />
                <a
                  href={job.company.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:underline"
                >
                  Visit company website
                </a>
              </div>
            )}
          </div>

          <div className="mt-4">
            <Link href={`/companies/${job.company.slug.current}`}>
              <Button variant="outline" className="w-full">
                View all jobs from {job.company.name}
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
```

### 3. Create Application Card Component

Create `components/Public/ApplicationCard.tsx`:

```typescript
'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import ApplicationForm from './ApplicationForm';
import { Job } from '@/types';
import { CheckCircle } from 'lucide-react';

interface ApplicationCardProps {
  job: Job;
}

export default function ApplicationCard({ job }: ApplicationCardProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);

  const handleApplyClick = () => {
    if (!session) {
      router.push(`/auth/signin?callbackUrl=/jobs/${job.slug.current}`);
      return;
    }
    setShowApplicationForm(true);
  };

  const handleApplicationSuccess = () => {
    setHasApplied(true);
    setShowApplicationForm(false);
  };

  return (
    <>
      <Card className="sticky top-4">
        <CardHeader>
          <CardTitle>Ready to Apply?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {hasApplied ? (
            <div className="text-center py-4">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-2" />
              <p className="font-medium">Application Submitted!</p>
              <p className="text-sm text-gray-600 mt-1">
                We've sent your application to {job.company.name}
              </p>
            </div>
          ) : (
            <>
              <Button 
                size="lg" 
                className="w-full"
                onClick={handleApplyClick}
              >
                Apply Now
              </Button>
              
              <div className="text-sm text-gray-600 space-y-1">
                <p>• {job.applicationCount} people have applied</p>
                <p>• Posted {new Date(job.publishedAt).toLocaleDateString()}</p>
                {job.startDate && (
                  <p>• Start date: {new Date(job.startDate).toLocaleDateString()}</p>
                )}
              </div>
            </>
          )}

          <div className="pt-4 border-t">
            <p className="text-sm text-gray-600 mb-2">Share this job:</p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  window.open(
                    `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`,
                    '_blank'
                  );
                }}
              >
                LinkedIn
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  window.open(
                    `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`,
                    '_blank'
                  );
                }}
              >
                Facebook
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  window.open(
                    `https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(`Check out this ${job.title} position at ${job.company.name}`)}`,
                    '_blank'
                  );
                }}
              >
                Twitter
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Application Form Dialog */}
      <Dialog open={showApplicationForm} onOpenChange={setShowApplicationForm}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Apply for {job.title}</DialogTitle>
          </DialogHeader>
          <ApplicationForm 
            job={job} 
            onSuccess={handleApplicationSuccess}
            onCancel={() => setShowApplicationForm(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
```

### 4. Create Application Form Component

Create `components/Public/ApplicationForm.tsx`:

```typescript
'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Upload, CheckCircle } from 'lucide-react';
import { Job, ApplicationForm as ApplicationFormData } from '@/types';
import { createApplication } from '@/lib/sanity-utils';
import { useToast } from '@/components/ui/use-toast';

const applicationSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Please enter a valid phone number'),
  coverMessage: z.string().optional(),
  resumeFile: z.any().optional(),
  linkedIn: z.string().url().optional().or(z.literal('')),
});

interface ApplicationFormProps {
  job: Job;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function ApplicationForm({ job, onSuccess, onCancel }: ApplicationFormProps) {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ApplicationFormData>({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      name: session?.user?.name || '',
      email: session?.user?.email || '',
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: 'File too large',
          description: 'Resume must be less than 5MB',
          variant: 'destructive',
        });
        return;
      }
      
      // Validate file type
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: 'Invalid file type',
          description: 'Please upload a PDF or Word document',
          variant: 'destructive',
        });
        return;
      }
      
      setResumeFile(file);
    }
  };

  const uploadResume = async (file: File): Promise<string> => {
    // In a real app, this would upload to Sanity assets
    // For now, we'll simulate an upload
    return new Promise((resolve) => {
      let progress = 0;
      const interval = setInterval(() => {
        progress += 10;
        setUploadProgress(progress);
        if (progress >= 100) {
          clearInterval(interval);
          resolve('https://example.com/resume.pdf');
        }
      }, 200);
    });
  };

  const onSubmit = async (data: ApplicationFormData) => {
    setIsSubmitting(true);
    
    try {
      let resumeUrl = '';
      
      // Upload resume if provided
      if (resumeFile) {
        resumeUrl = await uploadResume(resumeFile);
      }

      // Create application
      await createApplication({
        jobId: job._id,
        applicantInfo: {
          name: data.name,
          email: data.email,
          phone: data.phone,
          resumeUrl,
          linkedIn: data.linkedIn,
        },
        coverMessage: data.coverMessage,
      });

      toast({
        title: 'Application submitted!',
        description: 'Your application has been sent to the employer.',
      });

      onSuccess();
    } catch (error: any) {
      toast({
        title: 'Application failed',
        description: error.message || 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
      setUploadProgress(0);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Alert>
        <AlertDescription>
          You're applying for <strong>{job.title}</strong> at <strong>{job.company.name}</strong>
        </AlertDescription>
      </Alert>

      <div className="space-y-4">
        <div>
          <Label htmlFor="name">Full Name *</Label>
          <Input
            id="name"
            {...register('name')}
            disabled={isSubmitting}
          />
          {errors.name && (
            <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="email">Email Address *</Label>
          <Input
            id="email"
            type="email"
            {...register('email')}
            disabled={isSubmitting}
          />
          {errors.email && (
            <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="phone">Phone Number *</Label>
          <Input
            id="phone"
            type="tel"
            placeholder="(555) 123-4567"
            {...register('phone')}
            disabled={isSubmitting}
          />
          {errors.phone && (
            <p className="text-sm text-red-500 mt-1">{errors.phone.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="linkedIn">LinkedIn Profile (optional)</Label>
          <Input
            id="linkedIn"
            type="url"
            placeholder="https://linkedin.com/in/yourprofile"
            {...register('linkedIn')}
            disabled={isSubmitting}
          />
        </div>

        <div>
          <Label htmlFor="resume">Resume (optional)</Label>
          <div className="mt-2">
            <label
              htmlFor="resume"
              className="flex items-center justify-center w-full p-4 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 transition-colors"
            >
              {resumeFile ? (
                <div className="text-center">
                  <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                  <p className="text-sm font-medium">{resumeFile.name}</p>
                  <p className="text-xs text-gray-500">Click to change</p>
                </div>
              ) : (
                <div className="text-center">
                  <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm font-medium">Upload your resume</p>
                  <p className="text-xs text-gray-500">PDF or Word (max 5MB)</p>
                </div>
              )}
              <input
                id="resume"
                type="file"
                className="hidden"
                accept=".pdf,.doc,.docx"
                onChange={handleFileChange}
                disabled={isSubmitting}
              />
            </label>
            {uploadProgress > 0 && uploadProgress < 100 && (
              <div className="mt-2">
                <div className="bg-gray-200 rounded-full h-2">
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
          <Label htmlFor="coverMessage">Cover Message (optional)</Label>
          <Textarea
            id="coverMessage"
            rows={5}
            placeholder="Tell us why you're a great fit for this position..."
            {...register('coverMessage')}
            disabled={isSubmitting}
          />
        </div>
      </div>

      <div className="flex gap-3">
        <Button
          type="submit"
          disabled={isSubmitting}
          className="flex-1"
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

### 5. Create Related Jobs Component

Create `components/Public/RelatedJobs.tsx`:

```typescript
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, DollarSign, Building2 } from 'lucide-react';
import { Job } from '@/types';

interface RelatedJobsProps {
  jobs: Job[];
}

export default function RelatedJobs({ jobs }: RelatedJobsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {jobs.map((job) => (
        <Link key={job._id} href={`/jobs/${job.slug.current}`}>
          <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-4">
              <h3 className="font-semibold text-lg mb-2 line-clamp-1">
                {job.title}
              </h3>
              
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Building2 className="h-4 w-4" />
                  <span className="line-clamp-1">{job.company.name}</span>
                </div>
                
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span>{job.location.city}, CO</span>
                </div>
                
                {job.showSalary && job.salaryMin && (
                  <div className="flex items-center gap-1 text-green-600 font-medium">
                    <DollarSign className="h-4 w-4" />
                    <span>
                      ${job.salaryMin.toLocaleString()}
                      {job.salaryMax && ` - ${job.salaryMax.toLocaleString()}`}
                      {job.salaryType === 'hourly' ? '/hr' : '/yr'}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex gap-2 mt-3">
                <Badge variant="secondary" className="text-xs">
                  {job.jobType}
                </Badge>
                {job.isUrgent && (
                  <Badge variant="destructive" className="text-xs">
                    Urgent
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}
```

### 6. Create Job Detail Skeleton

Create `components/Public/JobDetailSkeleton.tsx`:

```typescript
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function JobDetailSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <Card>
        <CardHeader>
          <div className="flex items-start gap-4">
            <Skeleton className="h-20 w-20 rounded-lg" />
            <div className="space-y-2">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-5 w-32" />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-6 w-20" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="space-y-1">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-5 w-24" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Content Skeletons */}
      {[1, 2, 3].map((i) => (
        <Card key={i}>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
```

### 7. Add Structured Data for SEO

Create `components/Public/JobStructuredData.tsx`:

```typescript
import { Job } from '@/types';

interface JobStructuredDataProps {
  job: Job;
}

export default function JobStructuredData({ job }: JobStructuredDataProps) {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'JobPosting',
    title: job.title,
    description: job.description?.[0]?.children?.[0]?.text || '',
    datePosted: job.publishedAt,
    validThrough: job.expiresAt || job.applicationDeadline,
    employmentType: job.jobType.toUpperCase().replace('-', '_'),
    hiringOrganization: {
      '@type': 'Organization',
      name: job.company.name,
      sameAs: job.company.website,
    },
    jobLocation: {
      '@type': 'Place',
      address: {
        '@type': 'PostalAddress',
        addressLocality: job.location.city,
        addressRegion: 'CO',
        addressCountry: 'US',
        postalCode: job.location.zipCode,
      },
    },
    baseSalary: job.showSalary && job.salaryMin ? {
      '@type': 'MonetaryAmount',
      currency: 'USD',
      value: {
        '@type': 'QuantitativeValue',
        minValue: job.salaryMin,
        maxValue: job.salaryMax || job.salaryMin,
        unitText: job.salaryType === 'hourly' ? 'HOUR' : 'YEAR',
      },
    } : undefined,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}
```

### 8. Update Job Detail Page to Include Structured Data

Update the job detail page to include the structured data component in the head:

```typescript
// Add to app/(public)/jobs/[slug]/page.tsx
import JobStructuredData from '@/components/Public/JobStructuredData';

// In the component return:
return (
  <>
    <JobStructuredData job={job} />
    <PageContainer>
      {/* ... rest of the content */}
    </PageContainer>
  </>
);
```

## Verification Steps

1. **Test Static Generation:**
   - Build the app: `npm run build`
   - Check that job pages are pre-rendered

2. **Test Application Flow:**
   - Click Apply without auth (should redirect)
   - Submit application with auth
   - Verify success message

3. **Test Social Sharing:**
   - Try each share button
   - Verify correct URLs and text

4. **Test Related Jobs:**
   - Check that similar jobs appear
   - Verify links work correctly

## Common Issues & Solutions

### Issue: Application form not submitting
**Solution:** Check Sanity write permissions and API token

### Issue: Related jobs not showing
**Solution:** Ensure jobs have proper category references and locations

### Issue: File upload failing
**Solution:** Implement proper Sanity asset upload or use external service

## Next Steps

Proceed to [DOC-009: Search & Filters](doc-009-search-filters.md) to enhance job discovery.

## Notes for Claude Code

When implementing job details:
1. Test with jobs that have minimal vs complete data
2. Ensure mobile responsiveness for all components
3. Verify structured data validates correctly
4. Test application form validation thoroughly
5. Check that static paths are generated for all published jobs