# DOC-014: Application Management

## Overview
This document covers building the application management system for employers, including viewing applications by job, implementing status workflows, applicant details view, rating system, and communication features using NextAdmin components.

## Prerequisites
- DOC-001 through DOC-013 completed
- Applications being submitted through the system
- Email system configured with Resend
- Job management system working

## Steps

### 1. Create Application Management Types

Define TypeScript types for application management:

```typescript
// types/application-management.ts
export interface ApplicationDetails {
  _id: string;
  job: {
    _id: string;
    title: string;
    slug: { current: string };
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
  rating?: number;
  appliedDate: string;
  employerNotes?: string;
  interviewDate?: string;
  reviewedDate?: string;
  reviewedBy?: string;
}

export interface ApplicationTableRow {
  id: string;
  applicantName: string;
  applicantEmail: string;
  jobTitle: string;
  jobId: string;
  appliedDate: string;
  status: ApplicationDetails['status'];
  rating?: number;
  hasResume: boolean;
}

export interface ApplicationStats {
  total: number;
  new: number;
  reviewed: number;
  interviewing: number;
  hired: number;
  rejected: number;
}
```

### 2. Create Application Queries

Set up data fetching utilities:

```typescript
// lib/application-utils.ts
import { client } from '@/lib/sanity';
import { groq } from 'next-sanity';

export async function getApplicationsByCompany(companyId: string, filters?: {
  jobId?: string;
  status?: string;
  search?: string;
}) {
  let query = groq`*[_type == "jobApplication" && job->company._ref == $companyId`;
  const params: any = { companyId };

  if (filters?.jobId) {
    query += ` && job._ref == $jobId`;
    params.jobId = filters.jobId;
  }

  if (filters?.status && filters.status !== 'all') {
    query += ` && status == $status`;
    params.status = filters.status;
  }

  query += `] | order(appliedDate desc) {
    _id,
    "applicantName": applicantInfo.name,
    "applicantEmail": applicantInfo.email,
    "jobTitle": job->title,
    "jobId": job->_id,
    appliedDate,
    status,
    rating,
    "hasResume": defined(applicantInfo.resumeUrl)
  }`;

  const applications = await client.fetch(query, params);

  // Filter by search term on client side
  if (filters?.search) {
    const searchLower = filters.search.toLowerCase();
    return applications.filter((app: any) =>
      app.applicantName.toLowerCase().includes(searchLower) ||
      app.applicantEmail.toLowerCase().includes(searchLower) ||
      app.jobTitle.toLowerCase().includes(searchLower)
    );
  }

  return applications;
}

export async function getApplicationById(applicationId: string, companyId: string) {
  const application = await client.fetch(groq`
    *[_type == "jobApplication" && _id == $applicationId && job->company._ref == $companyId][0] {
      ...,
      "job": job->{
        _id,
        title,
        "slug": slug.current,
        location,
        salaryMin,
        salaryMax,
        salaryType
      }
    }
  `, { applicationId, companyId });

  return application;
}

export async function getApplicationStats(companyId: string, jobId?: string) {
  const baseQuery = jobId
    ? `*[_type == "jobApplication" && job._ref == $jobId && job->company._ref == $companyId]`
    : `*[_type == "jobApplication" && job->company._ref == $companyId]`;

  const stats = await client.fetch(groq`{
    "total": count(${baseQuery}),
    "new": count(${baseQuery} && status == "new"),
    "reviewed": count(${baseQuery} && status == "reviewed"),
    "interviewing": count(${baseQuery} && status == "interviewing"),
    "hired": count(${baseQuery} && status == "hired"),
    "rejected": count(${baseQuery} && status == "rejected")
  }`, { companyId, jobId });

  return stats;
}

export async function getJobsWithApplications(companyId: string) {
  const jobs = await client.fetch(groq`
    *[_type == "jobPosting" && company._ref == $companyId && applicationCount > 0] {
      _id,
      title,
      applicationCount
    } | order(applicationCount desc)
  `, { companyId });

  return jobs;
}
```

### 3. Create Application Status Update API

```typescript
// app/api/applications/[applicationId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { client } from '@/lib/sanity';
import { sendApplicationStatusEmail } from '@/lib/email';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { applicationId: string } }
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
    const { status, rating, employerNotes, interviewDate } = body;

    // Verify ownership
    const application = await client.fetch(groq`
      *[_type == "jobApplication" && _id == $applicationId && job->company._ref == $companyId][0] {
        ...,
        "jobTitle": job->title,
        "companyName": job->company->name
      }
    `, { 
      applicationId: params.applicationId, 
      companyId: session.user.companyId 
    });

    if (!application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      );
    }

    // Update application
    const updateData: any = {};
    if (status) updateData.status = status;
    if (rating !== undefined) updateData.rating = rating;
    if (employerNotes !== undefined) updateData.employerNotes = employerNotes;
    if (interviewDate !== undefined) updateData.interviewDate = interviewDate;

    // Add metadata for status changes
    if (status && status !== application.status) {
      updateData.reviewedDate = new Date().toISOString();
      updateData.reviewedBy = session.user.name || session.user.email;

      // Send status update email
      if (['interviewing', 'hired', 'rejected'].includes(status)) {
        await sendApplicationStatusEmail({
          to: application.applicantInfo.email,
          applicantName: application.applicantInfo.name,
          jobTitle: application.jobTitle,
          companyName: application.companyName,
          status,
          interviewDate: status === 'interviewing' ? interviewDate : undefined
        });
      }
    }

    const updatedApplication = await client
      .patch(params.applicationId)
      .set(updateData)
      .commit();

    return NextResponse.json(updatedApplication);
  } catch (error) {
    console.error('Error updating application:', error);
    return NextResponse.json(
      { error: 'Failed to update application' },
      { status: 500 }
    );
  }
}
```

### 4. Create Application Export API

```typescript
// app/api/applications/export/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getApplicationsByCompany } from '@/lib/application-utils';
import { format } from 'date-fns';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'employer') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const jobId = searchParams.get('jobId') || undefined;
    const status = searchParams.get('status') || undefined;

    const applications = await getApplicationsByCompany(
      session.user.companyId,
      { jobId, status }
    );

    // Convert to CSV
    const headers = [
      'Applicant Name',
      'Email',
      'Job Title',
      'Applied Date',
      'Status',
      'Rating',
      'Has Resume'
    ];

    const rows = applications.map((app: any) => [
      app.applicantName,
      app.applicantEmail,
      app.jobTitle,
      format(new Date(app.appliedDate), 'yyyy-MM-dd'),
      app.status,
      app.rating || '',
      app.hasResume ? 'Yes' : 'No'
    ]);

    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="applications-${format(new Date(), 'yyyy-MM-dd')}.csv"`
      }
    });
  } catch (error) {
    console.error('Error exporting applications:', error);
    return NextResponse.json(
      { error: 'Failed to export applications' },
      { status: 500 }
    );
  }
}
```

### 5. Create Applications Table Component

```typescript
// components/Dashboard/ApplicationsTable.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Search, 
  Download, 
  Filter,
  Eye,
  Star,
  FileText,
  Calendar
} from 'lucide-react';
import { format } from 'date-fns';
import ApplicationDetailsModal from './ApplicationDetailsModal';
import type { ApplicationTableRow, ApplicationStats } from '@/types/application-management';

interface ApplicationsTableProps {
  companyId: string;
}

const statusConfig = {
  new: { label: 'New', variant: 'default' as const, color: 'bg-blue-500' },
  reviewed: { label: 'Reviewed', variant: 'secondary' as const, color: 'bg-gray-500' },
  interviewing: { label: 'Interview', variant: 'outline' as const, color: 'bg-purple-500' },
  hired: { label: 'Hired', variant: 'default' as const, color: 'bg-green-500' },
  rejected: { label: 'Rejected', variant: 'destructive' as const, color: 'bg-red-500' }
};

export default function ApplicationsTable({ companyId }: ApplicationsTableProps) {
  const searchParams = useSearchParams();
  const initialJobId = searchParams.get('job') || '';

  const [applications, setApplications] = useState<ApplicationTableRow[]>([]);
  const [stats, setStats] = useState<ApplicationStats | null>(null);
  const [jobs, setJobs] = useState<Array<{ _id: string; title: string; applicationCount: number }>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState(initialJobId);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedApplication, setSelectedApplication] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, [selectedJob, statusFilter, searchTerm]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch jobs list if not already loaded
      if (jobs.length === 0) {
        const jobsResponse = await fetch('/api/applications/jobs');
        if (jobsResponse.ok) {
          const jobsData = await jobsResponse.json();
          setJobs(jobsData);
        }
      }

      // Fetch applications
      const params = new URLSearchParams();
      if (selectedJob) params.append('jobId', selectedJob);
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (searchTerm) params.append('search', searchTerm);

      const [appsResponse, statsResponse] = await Promise.all([
        fetch(`/api/applications?${params}`),
        fetch(`/api/applications/stats?${params}`)
      ]);

      if (appsResponse.ok) {
        const appsData = await appsResponse.json();
        setApplications(appsData.map((app: any) => ({ ...app, id: app._id })));
      }

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData);
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = async () => {
    const params = new URLSearchParams();
    if (selectedJob) params.append('jobId', selectedJob);
    if (statusFilter !== 'all') params.append('status', statusFilter);

    window.location.href = `/api/applications/export?${params}`;
  };

  const renderRating = (rating?: number) => {
    if (!rating) return null;
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Applications</CardTitle>
            <Button onClick={handleExport} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Stats Cards */}
            {stats && (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Total</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
                {Object.entries(statusConfig).map(([key, config]) => (
                  <div key={key} className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">{config.label}</p>
                    <p className="text-2xl font-bold">{stats[key as keyof ApplicationStats]}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={selectedJob} onValueChange={setSelectedJob}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue placeholder="All Jobs" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Jobs</SelectItem>
                  {jobs.map((job) => (
                    <SelectItem key={job._id} value={job._id}>
                      {job.title} ({job.applicationCount})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[150px]">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  {Object.entries(statusConfig).map(([key, config]) => (
                    <SelectItem key={key} value={key}>
                      {config.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Table */}
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Applicant</TableHead>
                    <TableHead>Job</TableHead>
                    <TableHead>Applied</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Resume</TableHead>
                    <TableHead className="w-20">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <>
                      {[1, 2, 3].map((i) => (
                        <TableRow key={i}>
                          <TableCell colSpan={7}>
                            <Skeleton className="h-12 w-full" />
                          </TableCell>
                        </TableRow>
                      ))}
                    </>
                  ) : applications.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        No applications found
                      </TableCell>
                    </TableRow>
                  ) : (
                    applications.map((application) => (
                      <TableRow key={application.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{application.applicantName}</p>
                            <p className="text-sm text-gray-600">{application.applicantEmail}</p>
                          </div>
                        </TableCell>
                        <TableCell>{application.jobTitle}</TableCell>
                        <TableCell>
                          {format(new Date(application.appliedDate), 'MMM d, yyyy')}
                        </TableCell>
                        <TableCell>
                          <Badge variant={statusConfig[application.status].variant}>
                            {statusConfig[application.status].label}
                          </Badge>
                        </TableCell>
                        <TableCell>{renderRating(application.rating)}</TableCell>
                        <TableCell>
                          {application.hasResume && (
                            <FileText className="h-4 w-4 text-gray-600" />
                          )}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedApplication(application.id)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
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

      {/* Application Details Modal */}
      {selectedApplication && (
        <ApplicationDetailsModal
          applicationId={selectedApplication}
          companyId={companyId}
          onClose={() => setSelectedApplication(null)}
          onUpdate={fetchData}
        />
      )}
    </>
  );
}
```

### 6. Create Application Details Modal

```typescript
// components/Dashboard/ApplicationDetailsModal.tsx
'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import {
  Mail,
  Phone,
  FileText,
  Calendar as CalendarIcon,
  Star,
  Download,
  ExternalLink,
  Loader2,
  User,
  MapPin,
  DollarSign
} from 'lucide-react';
import type { ApplicationDetails } from '@/types/application-management';

interface ApplicationDetailsModalProps {
  applicationId: string;
  companyId: string;
  onClose: () => void;
  onUpdate: () => void;
}

export default function ApplicationDetailsModal({
  applicationId,
  companyId,
  onClose,
  onUpdate
}: ApplicationDetailsModalProps) {
  const [application, setApplication] = useState<ApplicationDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  
  // Form states
  const [status, setStatus] = useState<ApplicationDetails['status']>('new');
  const [rating, setRating] = useState(0);
  const [notes, setNotes] = useState('');
  const [interviewDate, setInterviewDate] = useState<Date | undefined>();

  useEffect(() => {
    fetchApplication();
  }, [applicationId]);

  const fetchApplication = async () => {
    try {
      const response = await fetch(`/api/applications/${applicationId}`);
      if (!response.ok) throw new Error('Failed to fetch application');
      
      const data = await response.json();
      setApplication(data);
      setStatus(data.status);
      setRating(data.rating || 0);
      setNotes(data.employerNotes || '');
      if (data.interviewDate) {
        setInterviewDate(new Date(data.interviewDate));
      }
    } catch (error) {
      console.error('Error fetching application:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusUpdate = async () => {
    setIsSaving(true);
    try {
      const response = await fetch(`/api/applications/${applicationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          rating,
          employerNotes: notes,
          interviewDate: status === 'interviewing' && interviewDate 
            ? interviewDate.toISOString() 
            : null
        })
      });

      if (!response.ok) throw new Error('Failed to update application');
      
      onUpdate();
      onClose();
    } catch (error) {
      console.error('Error updating application:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDownloadResume = () => {
    if (application?.applicantInfo.resumeUrl) {
      window.open(application.applicantInfo.resumeUrl, '_blank');
    }
  };

  if (isLoading) {
    return (
      <Dialog open onOpenChange={onClose}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <Skeleton className="h-8 w-64" />
          </DialogHeader>
          <div className="space-y-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!application) {
    return null;
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Application Details</DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="application">Application</TabsTrigger>
            <TabsTrigger value="review">Review & Actions</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            {/* Applicant Info Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Applicant Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label className="text-sm text-gray-600">Name</Label>
                  <p className="font-medium">{application.applicantInfo.name}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm text-gray-600">Email</Label>
                    <a
                      href={`mailto:${application.applicantInfo.email}`}
                      className="flex items-center gap-1 text-blue-600 hover:underline"
                    >
                      <Mail className="h-4 w-4" />
                      {application.applicantInfo.email}
                    </a>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-600">Phone</Label>
                    <a
                      href={`tel:${application.applicantInfo.phone}`}
                      className="flex items-center gap-1 text-blue-600 hover:underline"
                    >
                      <Phone className="h-4 w-4" />
                      {application.applicantInfo.phone}
                    </a>
                  </div>
                </div>
                {application.applicantInfo.linkedIn && (
                  <div>
                    <Label className="text-sm text-gray-600">LinkedIn</Label>
                    <a
                      href={application.applicantInfo.linkedIn}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-blue-600 hover:underline"
                    >
                      <ExternalLink className="h-4 w-4" />
                      View Profile
                    </a>
                  </div>
                )}
                {application.applicantInfo.resumeUrl && (
                  <div>
                    <Button
                      variant="outline"
                      onClick={handleDownloadResume}
                      className="w-full"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download Resume
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Job Info Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5" />
                  Job Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label className="text-sm text-gray-600">Position</Label>
                  <p className="font-medium">{application.job.title}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm text-gray-600">Location</Label>
                    <p className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {application.job.location.city}, CO
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-600">Salary Range</Label>
                    <p className="flex items-center gap-1">
                      <DollarSign className="h-4 w-4" />
                      ${application.job.salaryMin}-{application.job.salaryMax || '?'}/
                      {application.job.salaryType === 'hourly' ? 'hr' : 'yr'}
                    </p>
                  </div>
                </div>
                <div>
                  <Label className="text-sm text-gray-600">Applied Date</Label>
                  <p>{format(new Date(application.appliedDate), 'MMMM d, yyyy')}</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="application" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Cover Message</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="whitespace-pre-wrap">{application.coverMessage}</div>
              </CardContent>
            </Card>

            {application.reviewedDate && (
              <Card>
                <CardHeader>
                  <CardTitle>Review History</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">
                    Reviewed by {application.reviewedBy} on{' '}
                    {format(new Date(application.reviewedDate), 'MMMM d, yyyy')}
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="review" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Application Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Status</Label>
                  <Select value={status} onValueChange={(value: any) => setStatus(value)}>
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">New</SelectItem>
                      <SelectItem value="reviewed">Reviewed</SelectItem>
                      <SelectItem value="interviewing">Interview Scheduled</SelectItem>
                      <SelectItem value="hired">Hired</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {status === 'interviewing' && (
                  <div>
                    <Label>Interview Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal mt-2",
                            !interviewDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {interviewDate ? (
                            format(interviewDate, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={interviewDate}
                          onSelect={setInterviewDate}
                          initialFocus
                          disabled={(date) => date < new Date()}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                )}

                <div>
                  <Label>Rating</Label>
                  <div className="flex items-center gap-2 mt-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className="focus:outline-none"
                      >
                        <Star
                          className={`h-6 w-6 ${
                            star <= rating
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-gray-300'
                          } hover:fill-yellow-400 hover:text-yellow-400 transition-colors`}
                        />
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => setRating(0)}
                      className="text-sm text-gray-600 hover:text-gray-900 ml-2"
                    >
                      Clear
                    </button>
                  </div>
                </div>

                <div>
                  <Label htmlFor="notes">Internal Notes</Label>
                  <Textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add notes about this applicant..."
                    rows={4}
                    className="mt-2"
                  />
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end gap-4">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button onClick={handleStatusUpdate} disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
```

### 7. Create Applications API Routes

```typescript
// app/api/applications/route.ts (GET endpoint for employer)
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getApplicationsByCompany } from '@/lib/application-utils';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'employer') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const filters = {
      jobId: searchParams.get('jobId') || undefined,
      status: searchParams.get('status') || undefined,
      search: searchParams.get('search') || undefined,
    };

    const applications = await getApplicationsByCompany(
      session.user.companyId,
      filters
    );

    return NextResponse.json(applications);
  } catch (error) {
    console.error('Error fetching applications:', error);
    return NextResponse.json(
      { error: 'Failed to fetch applications' },
      { status: 500 }
    );
  }
}
```

### 8. Create Application Stats API

```typescript
// app/api/applications/stats/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getApplicationStats } from '@/lib/application-utils';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'employer') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const jobId = request.nextUrl.searchParams.get('jobId') || undefined;
    const stats = await getApplicationStats(session.user.companyId, jobId);

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}
```

### 9. Create Jobs List API for Filters

```typescript
// app/api/applications/jobs/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getJobsWithApplications } from '@/lib/application-utils';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'employer') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const jobs = await getJobsWithApplications(session.user.companyId);
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

### 10. Create Email Templates for Status Updates

```typescript
// lib/email/templates/ApplicationStatus.tsx
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
import { format } from 'date-fns';

interface ApplicationStatusProps {
  applicantName: string;
  jobTitle: string;
  companyName: string;
  status: 'interviewing' | 'hired' | 'rejected';
  interviewDate?: string;
}

export function ApplicationStatusEmail({
  applicantName,
  jobTitle,
  companyName,
  status,
  interviewDate,
}: ApplicationStatusProps) {
  const getStatusMessage = () => {
    switch (status) {
      case 'interviewing':
        return {
          preview: `Interview scheduled for ${jobTitle}`,
          heading: 'Interview Scheduled!',
          message: `Great news! ${companyName} would like to interview you for the ${jobTitle} position.`,
          details: interviewDate
            ? `Your interview is scheduled for ${format(new Date(interviewDate), 'EEEE, MMMM d, yyyy at h:mm a')}.`
            : 'The employer will contact you with interview details.',
        };
      case 'hired':
        return {
          preview: `Congratulations! You got the job`,
          heading: 'Congratulations!',
          message: `We're thrilled to inform you that ${companyName} has selected you for the ${jobTitle} position!`,
          details: 'The employer will contact you with next steps and onboarding information.',
        };
      case 'rejected':
        return {
          preview: `Update on your application`,
          heading: 'Application Update',
          message: `Thank you for your interest in the ${jobTitle} position at ${companyName}.`,
          details: 'After careful consideration, they have decided to move forward with other candidates. We encourage you to continue applying to other positions that match your skills.',
        };
    }
  };

  const { preview, heading, message, details } = getStatusMessage();

  return (
    <Html>
      <Head />
      <Preview>{preview}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>{heading}</Heading>
          
          <Text style={text}>Hi {applicantName},</Text>
          
          <Text style={text}>{message}</Text>
          
          <Text style={text}>{details}</Text>
          
          {status !== 'rejected' && (
            <Text style={text}>
              If you have any questions, please contact the employer directly.
            </Text>
          )}
          
          <Link href="https://coloradotradesjobs.com/my-applications" style={button}>
            View My Applications
          </Link>
          
          <Text style={footer}>
            Best regards,
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

### 11. Update Email Sending Function

```typescript
// lib/email/index.ts (add to existing file)
import { ApplicationStatusEmail } from './templates/ApplicationStatus';

export async function sendApplicationStatusEmail({
  to,
  applicantName,
  jobTitle,
  companyName,
  status,
  interviewDate,
}: {
  to: string;
  applicantName: string;
  jobTitle: string;
  companyName: string;
  status: 'interviewing' | 'hired' | 'rejected';
  interviewDate?: string;
}) {
  try {
    const subject = status === 'interviewing'
      ? `Interview Scheduled - ${jobTitle}`
      : status === 'hired'
      ? `Congratulations! Job Offer - ${jobTitle}`
      : `Application Update - ${jobTitle}`;

    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'noreply@coloradotradesjobs.com',
      to,
      subject,
      react: ApplicationStatusEmail({ 
        applicantName, 
        jobTitle, 
        companyName, 
        status, 
        interviewDate 
      }),
    });

    if (error) {
      console.error('Email send error:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Failed to send status email:', error);
    throw error;
  }
}
```

### 12. Create Applications Management Page

```typescript
// app/dashboard/applications/page.tsx
import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import ApplicationsTable from '@/components/Dashboard/ApplicationsTable';

export const metadata: Metadata = {
  title: 'Applications | Dashboard',
  description: 'Manage job applications',
};

export default async function ApplicationsPage() {
  const session = await getServerSession(authOptions);
  
  if (!session || session.user.role !== 'employer') {
    redirect('/auth/signin');
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Applications</h1>
        <p className="text-gray-600 mt-2">
          Review and manage applications for your job postings
        </p>
      </div>
      <ApplicationsTable companyId={session.user.companyId} />
    </div>
  );
}
```

## Verification Steps

1. **Test Application Viewing:**
   - Navigate to /dashboard/applications
   - Verify all applications appear
   - Check status badges display correctly
   - Test rating stars show properly

2. **Test Filtering:**
   - Filter by job posting
   - Filter by status
   - Search by applicant name/email
   - Verify stats update with filters

3. **Test Application Details:**
   - Click view on an application
   - Check all tabs load correctly
   - Verify resume download works
   - Test email/phone links

4. **Test Status Updates:**
   - Change application status
   - Add rating
   - Add employer notes
   - Schedule interview (if status = interviewing)
   - Verify email sent for status changes

5. **Test Export:**
   - Click Export CSV button
   - Verify file downloads
   - Check CSV contains correct data
   - Test with filters applied

6. **Test Responsive Design:**
   - Check table on mobile (horizontal scroll)
   - Test modal on mobile devices
   - Verify all interactions work on touch

## Common Issues & Solutions

### Issue: Applications not showing
**Solution:**
1. Verify job references are correct in applications
2. Check company ownership in queries
3. Ensure proper authentication

### Issue: Status update emails not sending
**Solution:**
1. Check Resend API key and limits
2. Verify email templates compile
3. Check recipient email validity
4. Monitor Resend dashboard

### Issue: Export failing with large datasets
**Solution:**
1. Implement pagination for export
2. Add streaming response
3. Limit export to date range

### Issue: Modal not closing after update
**Solution:**
1. Ensure onUpdate callback runs
2. Check for errors in console
3. Verify state updates properly

## Next Steps

Proceed to [DOC-015: Analytics Dashboard](doc-015-analytics-dashboard.md) to build the analytics and reporting features.

## Notes for Claude Code

When implementing application management:
1. Always verify company ownership before showing data
2. Implement proper loading states for all async operations
3. Handle edge cases (no applications, missing data)
4. Test email sending in development with preview
5. Consider adding bulk status updates
6. Implement keyboard navigation in table
7. Add application notes history
8. Consider implementing filters in URL params
9. Test with various data volumes for performance