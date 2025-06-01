# DOC-013: Job Management

## Overview
This document covers building the job management system for employers, including creating new job postings, editing existing jobs, managing job status (draft/published/expired), and implementing bulk operations using NextAdmin's DataTable component.

## Prerequisites
- DOC-001 through DOC-012 completed
- Dashboard layout configured
- Sanity write permissions set up
- NextAdmin DataTable component available

## Steps

### 1. Create Job Management Types

Define types for job management:

```typescript
// types/job-management.ts
export interface JobFormData {
  title: string;
  description: string;
  requirements: string;
  company: string;
  location: {
    city: string;
    county: string;
    zipCode: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  salaryMin: number;
  salaryMax?: number;
  salaryType: 'hourly' | 'salary' | 'contract';
  jobType: 'full-time' | 'part-time' | 'contract' | 'temporary';
  category: string;
  experienceLevel: 'entry' | 'intermediate' | 'experienced';
  benefits: string[];
  applicationDeadline?: string;
  isUrgent: boolean;
  featured: boolean;
  status: 'draft' | 'published' | 'expired' | 'filled';
}

export interface JobTableRow {
  id: string;
  title: string;
  status: 'draft' | 'published' | 'expired' | 'filled';
  applications: number;
  views: number;
  publishedAt?: string;
  expiresAt?: string;
  selected?: boolean;
}
```

### 2. Create Job Form Schema

Set up form validation with Zod:

```typescript
// lib/validations/job.ts
import { z } from 'zod';

export const jobFormSchema = z.object({
  title: z.string()
    .min(5, 'Job title must be at least 5 characters')
    .max(100, 'Job title must be less than 100 characters'),
  
  description: z.string()
    .min(100, 'Description must be at least 100 characters')
    .max(5000, 'Description must be less than 5000 characters'),
  
  requirements: z.string()
    .min(50, 'Requirements must be at least 50 characters')
    .max(3000, 'Requirements must be less than 3000 characters'),
  
  location: z.object({
    city: z.string().min(2, 'City is required'),
    county: z.string().min(2, 'County is required'),
    zipCode: z.string().regex(/^\d{5}$/, 'Invalid ZIP code'),
    coordinates: z.object({
      lat: z.number(),
      lng: z.number()
    }).optional()
  }),
  
  salaryMin: z.number()
    .min(0, 'Minimum salary must be positive')
    .max(1000000, 'Salary seems too high'),
  
  salaryMax: z.number()
    .min(0, 'Maximum salary must be positive')
    .max(1000000, 'Salary seems too high')
    .optional(),
  
  salaryType: z.enum(['hourly', 'salary', 'contract']),
  jobType: z.enum(['full-time', 'part-time', 'contract', 'temporary']),
  experienceLevel: z.enum(['entry', 'intermediate', 'experienced']),
  
  category: z.string().min(1, 'Category is required'),
  benefits: z.array(z.string()).default([]),
  
  applicationDeadline: z.string().optional(),
  isUrgent: z.boolean().default(false),
  featured: z.boolean().default(false),
  status: z.enum(['draft', 'published'])
}).refine((data) => {
  if (data.salaryMax) {
    return data.salaryMax >= data.salaryMin;
  }
  return true;
}, {
  message: 'Maximum salary must be greater than minimum salary',
  path: ['salaryMax']
});

export type JobFormValues = z.infer<typeof jobFormSchema>;
```

### 3. Create Job Form Component

Build a multi-step job posting form:

```typescript
// components/Dashboard/JobForm.tsx
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { CalendarIcon, Loader2, MapPin, Plus, X } from 'lucide-react';
import { jobFormSchema, type JobFormValues } from '@/lib/validations/job';

interface JobFormProps {
  initialData?: Partial<JobFormValues>;
  jobId?: string;
  categories: Array<{ _id: string; name: string; slug: { current: string } }>;
}

const benefits = [
  'Health Insurance',
  'Dental Insurance',
  'Vision Insurance',
  '401(k)',
  '401(k) Matching',
  'Paid Time Off',
  'Paid Holidays',
  'Flexible Schedule',
  'Remote Work Options',
  'Life Insurance',
  'Disability Insurance',
  'Employee Assistance Program',
  'Professional Development',
  'Tuition Reimbursement',
  'Retirement Plan',
  'Overtime Pay',
  'Performance Bonus',
  'Company Vehicle',
  'Tool Allowance',
  'Uniform Provided'
];

export default function JobForm({ initialData, jobId, categories }: JobFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('basics');
  const [selectedBenefits, setSelectedBenefits] = useState<string[]>(
    initialData?.benefits || []
  );

  const form = useForm<JobFormValues>({
    resolver: zodResolver(jobFormSchema),
    defaultValues: {
      title: '',
      description: '',
      requirements: '',
      location: { city: '', county: '', zipCode: '' },
      salaryMin: 0,
      salaryType: 'hourly',
      jobType: 'full-time',
      experienceLevel: 'entry',
      category: '',
      benefits: [],
      isUrgent: false,
      featured: false,
      status: 'draft',
      ...initialData,
    }
  });

  const onSubmit = async (data: JobFormValues) => {
    setIsSubmitting(true);
    try {
      const url = jobId ? `/api/jobs/${jobId}` : '/api/jobs';
      const method = jobId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          benefits: selectedBenefits
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save job');
      }

      const result = await response.json();
      router.push('/dashboard/jobs');
      router.refresh();
    } catch (error) {
      console.error('Error saving job:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleBenefit = (benefit: string) => {
    setSelectedBenefits(prev =>
      prev.includes(benefit)
        ? prev.filter(b => b !== benefit)
        : [...prev, benefit]
    );
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="basics">Basic Info</TabsTrigger>
          <TabsTrigger value="details">Job Details</TabsTrigger>
          <TabsTrigger value="compensation">Compensation</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="basics">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="title">Job Title *</Label>
                <Input
                  id="title"
                  {...form.register('title')}
                  placeholder="e.g., Senior Electrician"
                />
                {form.formState.errors.title && (
                  <p className="text-sm text-red-600 mt-1">
                    {form.formState.errors.title.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="category">Category *</Label>
                <Select
                  value={form.watch('category')}
                  onValueChange={(value) => form.setValue('category', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category._id} value={category._id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.formState.errors.category && (
                  <p className="text-sm text-red-600 mt-1">
                    {form.formState.errors.category.message}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="jobType">Job Type *</Label>
                  <Select
                    value={form.watch('jobType')}
                    onValueChange={(value: any) => form.setValue('jobType', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="full-time">Full Time</SelectItem>
                      <SelectItem value="part-time">Part Time</SelectItem>
                      <SelectItem value="contract">Contract</SelectItem>
                      <SelectItem value="temporary">Temporary</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="experienceLevel">Experience Level *</Label>
                  <Select
                    value={form.watch('experienceLevel')}
                    onValueChange={(value: any) => form.setValue('experienceLevel', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="entry">Entry Level</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="experienced">Experienced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="description">Job Description *</Label>
                <Textarea
                  id="description"
                  {...form.register('description')}
                  placeholder="Provide a detailed description of the position..."
                  rows={8}
                />
                {form.formState.errors.description && (
                  <p className="text-sm text-red-600 mt-1">
                    {form.formState.errors.description.message}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="details">
          <Card>
            <CardHeader>
              <CardTitle>Job Details & Location</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="requirements">Requirements & Qualifications *</Label>
                <Textarea
                  id="requirements"
                  {...form.register('requirements')}
                  placeholder="List the key requirements and qualifications..."
                  rows={6}
                />
                {form.formState.errors.requirements && (
                  <p className="text-sm text-red-600 mt-1">
                    {form.formState.errors.requirements.message}
                  </p>
                )}
              </div>

              <div className="space-y-4">
                <Label>Location</Label>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Input
                      {...form.register('location.city')}
                      placeholder="City"
                    />
                    {form.formState.errors.location?.city && (
                      <p className="text-sm text-red-600 mt-1">
                        {form.formState.errors.location.city.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <Input
                      {...form.register('location.county')}
                      placeholder="County"
                    />
                    {form.formState.errors.location?.county && (
                      <p className="text-sm text-red-600 mt-1">
                        {form.formState.errors.location.county.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <Input
                      {...form.register('location.zipCode')}
                      placeholder="ZIP Code"
                      maxLength={5}
                    />
                    {form.formState.errors.location?.zipCode && (
                      <p className="text-sm text-red-600 mt-1">
                        {form.formState.errors.location.zipCode.message}
                      </p>
                    )}
                  </div>
                </div>
                <p className="text-sm text-gray-600 flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  Location will be shown on map if coordinates are available
                </p>
              </div>

              <div>
                <Label>Application Deadline (Optional)</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !form.watch('applicationDeadline') && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {form.watch('applicationDeadline') ? (
                        format(new Date(form.watch('applicationDeadline')), "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={form.watch('applicationDeadline') ? new Date(form.watch('applicationDeadline')) : undefined}
                      onSelect={(date) => form.setValue('applicationDeadline', date?.toISOString())}
                      initialFocus
                      disabled={(date) => date < new Date()}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compensation">
          <Card>
            <CardHeader>
              <CardTitle>Compensation & Benefits</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label>Salary Type *</Label>
                <Select
                  value={form.watch('salaryType')}
                  onValueChange={(value: any) => form.setValue('salaryType', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hourly">Hourly</SelectItem>
                    <SelectItem value="salary">Annual Salary</SelectItem>
                    <SelectItem value="contract">Contract</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="salaryMin">
                    Minimum {form.watch('salaryType') === 'hourly' ? 'Hourly Rate' : 'Salary'} *
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                      $
                    </span>
                    <Input
                      id="salaryMin"
                      type="number"
                      {...form.register('salaryMin', { valueAsNumber: true })}
                      className="pl-8"
                      placeholder="0"
                    />
                  </div>
                  {form.formState.errors.salaryMin && (
                    <p className="text-sm text-red-600 mt-1">
                      {form.formState.errors.salaryMin.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="salaryMax">
                    Maximum {form.watch('salaryType') === 'hourly' ? 'Hourly Rate' : 'Salary'} (Optional)
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                      $
                    </span>
                    <Input
                      id="salaryMax"
                      type="number"
                      {...form.register('salaryMax', { valueAsNumber: true })}
                      className="pl-8"
                      placeholder="0"
                    />
                  </div>
                  {form.formState.errors.salaryMax && (
                    <p className="text-sm text-red-600 mt-1">
                      {form.formState.errors.salaryMax.message}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <Label>Benefits</Label>
                <div className="mt-2 space-y-2">
                  <div className="flex flex-wrap gap-2">
                    {selectedBenefits.map((benefit) => (
                      <Badge key={benefit} variant="secondary" className="gap-1">
                        {benefit}
                        <button
                          type="button"
                          onClick={() => toggleBenefit(benefit)}
                          className="ml-1 hover:text-red-600"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button type="button" variant="outline" size="sm">
                        <Plus className="h-4 w-4 mr-1" />
                        Add Benefits
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80">
                      <div className="grid gap-2 max-h-60 overflow-y-auto">
                        {benefits.map((benefit) => (
                          <label
                            key={benefit}
                            className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded"
                          >
                            <input
                              type="checkbox"
                              checked={selectedBenefits.includes(benefit)}
                              onChange={() => toggleBenefit(benefit)}
                              className="rounded"
                            />
                            <span className="text-sm">{benefit}</span>
                          </label>
                        ))}
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Job Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Urgent Hiring</Label>
                    <p className="text-sm text-gray-600">
                      Mark this job as urgent to attract more applicants
                    </p>
                  </div>
                  <Switch
                    checked={form.watch('isUrgent')}
                    onCheckedChange={(checked) => form.setValue('isUrgent', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Featured Job</Label>
                    <p className="text-sm text-gray-600">
                      Featured jobs appear at the top of search results
                    </p>
                  </div>
                  <Switch
                    checked={form.watch('featured')}
                    onCheckedChange={(checked) => form.setValue('featured', checked)}
                  />
                </div>

                <div>
                  <Label>Job Status</Label>
                  <Select
                    value={form.watch('status')}
                    onValueChange={(value: any) => form.setValue('status', value)}
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Save as Draft</SelectItem>
                      <SelectItem value="published">Publish Now</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-gray-600 mt-2">
                    {form.watch('status') === 'draft' 
                      ? 'Job will be saved but not visible to job seekers'
                      : 'Job will be immediately visible to job seekers'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-between mt-6">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push('/dashboard/jobs')}
        >
          Cancel
        </Button>
        <div className="flex gap-4">
          <Button
            type="submit"
            variant={form.watch('status') === 'published' ? 'default' : 'secondary'}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                {jobId ? 'Update' : 'Create'} Job
                {form.watch('status') === 'published' && ' & Publish'}
              </>
            )}
          </Button>
        </div>
      </div>
    </form>
  );
}
```

### 4. Create Jobs API Routes

Implement API endpoints for job CRUD operations:

```typescript
// app/api/jobs/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { client } from '@/lib/sanity';
import { jobFormSchema } from '@/lib/validations/job';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
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
    const session = await getServerSession(authOptions);
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
```

### 5. Create Job Update/Delete API

```typescript
// app/api/jobs/[jobId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { client } from '@/lib/sanity';

export async function GET(
  request: NextRequest,
  { params }: { params: { jobId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'employer') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const job = await client.fetch(
      `*[_type == "jobPosting" && _id == $jobId && company._ref == $companyId][0]`,
      { jobId: params.jobId, companyId: session.user.companyId }
    );

    if (!job) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(job);
  } catch (error) {
    console.error('Error fetching job:', error);
    return NextResponse.json(
      { error: 'Failed to fetch job' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { jobId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'employer') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Verify ownership
    const existingJob = await client.fetch(
      `*[_type == "jobPosting" && _id == $jobId && company._ref == $companyId][0]`,
      { jobId: params.jobId, companyId: session.user.companyId }
    );

    if (!existingJob) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      );
    }

    const updatedJob = await client
      .patch(params.jobId)
      .set({
        ...body,
        publishedAt: body.status === 'published' && !existingJob.publishedAt 
          ? new Date().toISOString() 
          : existingJob.publishedAt
      })
      .commit();

    return NextResponse.json(updatedJob);
  } catch (error) {
    console.error('Error updating job:', error);
    return NextResponse.json(
      { error: 'Failed to update job' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { jobId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'employer') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify ownership
    const job = await client.fetch(
      `*[_type == "jobPosting" && _id == $jobId && company._ref == $companyId][0]`,
      { jobId: params.jobId, companyId: session.user.companyId }
    );

    if (!job) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      );
    }

    await client.delete(params.jobId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting job:', error);
    return NextResponse.json(
      { error: 'Failed to delete job' },
      { status: 500 }
    );
  }
}
```

### 6. Create Bulk Operations API

```typescript
// app/api/jobs/bulk/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { client } from '@/lib/sanity';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
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
```

### 7. Create Jobs DataTable Component

Build the jobs management table:

```typescript
// components/Dashboard/JobsDataTable.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  MoreHorizontal, 
  Edit, 
  Trash, 
  Eye, 
  Calendar,
  Search,
  Filter,
  Download,
  Plus
} from 'lucide-react';
import { format } from 'date-fns';
import type { JobTableRow } from '@/types/job-management';

export default function JobsDataTable() {
  const router = useRouter();
  const [jobs, setJobs] = useState<JobTableRow[]>([]);
  const [selectedJobs, setSelectedJobs] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const response = await fetch('/api/jobs');
      if (!response.ok) throw new Error('Failed to fetch jobs');
      
      const data = await response.json();
      setJobs(data.map(job => ({ ...job, id: job._id })));
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedJobs(jobs.map(job => job.id));
    } else {
      setSelectedJobs([]);
    }
  };

  const handleSelectJob = (jobId: string, checked: boolean) => {
    if (checked) {
      setSelectedJobs([...selectedJobs, jobId]);
    } else {
      setSelectedJobs(selectedJobs.filter(id => id !== jobId));
    }
  };

  const handleBulkAction = async (action: string) => {
    if (selectedJobs.length === 0) return;

    const confirmed = confirm(
      `Are you sure you want to ${action} ${selectedJobs.length} job(s)?`
    );

    if (!confirmed) return;

    try {
      const response = await fetch('/api/jobs/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, jobIds: selectedJobs }),
      });

      if (!response.ok) throw new Error('Bulk action failed');

      await fetchJobs();
      setSelectedJobs([]);
    } catch (error) {
      console.error('Error performing bulk action:', error);
    }
  };

  const handleDeleteJob = async (jobId: string) => {
    const confirmed = confirm('Are you sure you want to delete this job?');
    if (!confirmed) return;

    try {
      const response = await fetch(`/api/jobs/${jobId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Delete failed');

      await fetchJobs();
    } catch (error) {
      console.error('Error deleting job:', error);
    }
  };

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || job.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const statusConfig = {
    draft: { label: 'Draft', variant: 'secondary' as const },
    published: { label: 'Published', variant: 'default' as const },
    expired: { label: 'Expired', variant: 'outline' as const },
    filled: { label: 'Filled', variant: 'default' as const }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Manage Jobs</CardTitle>
          <Button onClick={() => router.push('/dashboard/jobs/new')}>
            <Plus className="h-4 w-4 mr-2" />
            Post New Job
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Filters and Search */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search jobs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <Filter className="h-4 w-4 mr-2" />
                  Status: {statusFilter === 'all' ? 'All' : statusConfig[statusFilter]?.label}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setStatusFilter('all')}>
                  All Status
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setStatusFilter('draft')}>
                  Draft
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter('published')}>
                  Published
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter('expired')}>
                  Expired
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter('filled')}>
                  Filled
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Bulk Actions */}
          {selectedJobs.length > 0 && (
            <div className="bg-gray-50 p-4 rounded-lg flex items-center justify-between">
              <span className="text-sm text-gray-600">
                {selectedJobs.length} job(s) selected
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkAction('publish')}
                >
                  Publish
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkAction('expire')}
                >
                  Expire
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleBulkAction('delete')}
                >
                  Delete
                </Button>
              </div>
            </div>
          )}

          {/* Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedJobs.length === filteredJobs.length && filteredJobs.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead>Job Title</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-center">Applications</TableHead>
                  <TableHead className="text-center">Views</TableHead>
                  <TableHead>Posted</TableHead>
                  <TableHead>Expires</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      Loading jobs...
                    </TableCell>
                  </TableRow>
                ) : filteredJobs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      No jobs found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredJobs.map((job) => (
                    <TableRow key={job.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedJobs.includes(job.id)}
                          onCheckedChange={(checked) => 
                            handleSelectJob(job.id, checked as boolean)
                          }
                        />
                      </TableCell>
                      <TableCell className="font-medium">{job.title}</TableCell>
                      <TableCell>
                        <Badge variant={statusConfig[job.status].variant}>
                          {statusConfig[job.status].label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        {job.applications}
                      </TableCell>
                      <TableCell className="text-center">
                        {job.views}
                      </TableCell>
                      <TableCell>
                        {job.publishedAt 
                          ? format(new Date(job.publishedAt), 'MMM d, yyyy')
                          : '-'
                        }
                      </TableCell>
                      <TableCell>
                        {job.expiresAt 
                          ? format(new Date(job.expiresAt), 'MMM d, yyyy')
                          : '-'
                        }
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => router.push(`/jobs/${job.slug}`)}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              View
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => router.push(`/dashboard/jobs/${job.id}/edit`)}
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => router.push(`/dashboard/applications?job=${job.id}`)}
                            >
                              <Calendar className="h-4 w-4 mr-2" />
                              View Applications
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleDeleteJob(job.id)}
                              className="text-red-600"
                            >
                              <Trash className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
```

### 8. Create Job Management Pages

Create the main jobs management page:

```typescript
// app/dashboard/jobs/page.tsx
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
```

### 9. Create New Job Page

```typescript
// app/dashboard/jobs/new/page.tsx
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
```

### 10. Create Edit Job Page

```typescript
// app/dashboard/jobs/[jobId]/edit/page.tsx
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
```

## Verification Steps

1. **Test Job Creation:**
   - Navigate to /dashboard/jobs/new
   - Fill out all form fields
   - Switch between tabs
   - Add multiple benefits
   - Save as draft and publish

2. **Test Form Validation:**
   - Try submitting with empty required fields
   - Enter invalid ZIP code
   - Set max salary lower than min
   - Verify all error messages appear

3. **Test Job Listing:**
   - Check all jobs appear in table
   - Verify status badges are correct
   - Test search functionality
   - Apply status filters

4. **Test Bulk Operations:**
   - Select multiple jobs
   - Try bulk publish/expire/delete
   - Verify confirmation dialogs work
   - Check operations complete successfully

5. **Test Job Editing:**
   - Click edit on existing job
   - Verify all fields populated correctly
   - Make changes and save
   - Verify updates appear in table

6. **Test Responsive Design:**
   - Check form on mobile devices
   - Verify table scrolls horizontally
   - Test all dropdowns and modals

## Common Issues & Solutions

### Issue: Form data not saving
**Solution:**
1. Check API routes are properly configured
2. Verify Sanity write permissions
3. Ensure session includes companyId
4. Check form validation passes

### Issue: Benefits not saving
**Solution:**
1. Ensure benefits array is included in submit data
2. Check Sanity schema includes benefits field
3. Verify state management for selectedBenefits

### Issue: Bulk operations failing
**Solution:**
1. Verify job ownership checks in API
2. Check array handling in bulk endpoint
3. Ensure proper error handling for partial failures

### Issue: Table not updating after actions
**Solution:**
1. Call fetchJobs after operations
2. Add router.refresh() where needed
3. Implement optimistic updates

## Next Steps

Proceed to [DOC-014: Application Management](doc-014-application-management.md) to build the application review system.

## Notes for Claude Code

When implementing job management:
1. Always validate job ownership before updates/deletes
2. Implement proper error handling for all API calls
3. Use optimistic UI updates for better UX
4. Add loading states for all async operations
5. Consider implementing auto-save for drafts
6. Test with various screen sizes
7. Add keyboard shortcuts for power users
8. Implement proper pagination for large job lists
9. Consider adding job duplication feature