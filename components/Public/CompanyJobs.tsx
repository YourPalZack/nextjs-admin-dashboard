'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import JobCard from './JobCard';
import { Job } from '@/types';
import { Briefcase } from 'lucide-react';

interface CompanyJobsProps {
  jobs: Job[];
  companyName: string;
}

export default function CompanyJobs({ jobs, companyName }: CompanyJobsProps) {
  const [filter, setFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('newest');

  // Filter jobs
  const filteredJobs = jobs.filter(job => {
    if (filter === 'all') return true;
    if (filter === 'urgent') return job.isUrgent;
    if (filter === 'remote') return job.remoteOptions !== 'onsite';
    return job.jobType === filter;
  });

  // Sort jobs
  const sortedJobs = [...filteredJobs].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
      case 'salary':
        return (b.salaryMax || b.salaryMin || 0) - (a.salaryMax || a.salaryMin || 0);
      default:
        return 0;
    }
  });

  if (jobs.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600">
            No open positions at {companyName} right now.
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Check back soon or set up job alerts to be notified of new openings.
          </p>
          <Button variant="outline" className="mt-4">
            Set Up Job Alert
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Jobs</SelectItem>
            <SelectItem value="full-time">Full-time</SelectItem>
            <SelectItem value="part-time">Part-time</SelectItem>
            <SelectItem value="contract">Contract</SelectItem>
            <SelectItem value="urgent">Urgent Hiring</SelectItem>
            <SelectItem value="remote">Remote Available</SelectItem>
          </SelectContent>
        </Select>

        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest First</SelectItem>
            <SelectItem value="salary">Highest Salary</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex-1 text-right">
          <p className="text-sm text-gray-600">
            Showing {sortedJobs.length} of {jobs.length} positions
          </p>
        </div>
      </div>

      {/* Job List */}
      <div className="space-y-4">
        {sortedJobs.map((job) => (
          <JobCard key={job._id} job={job} />
        ))}
      </div>
    </div>
  );
}