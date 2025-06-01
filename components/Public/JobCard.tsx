import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  MapPin,
  Briefcase,
  DollarSign,
  Clock,
  Building2,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { Job } from '@/types';
import { formatDistanceToNow } from 'date-fns';
import { urlFor } from '@/lib/sanity';

interface JobCardProps {
  job: Job;
}

export default function JobCard({ job }: JobCardProps) {
  const salaryDisplay = job.showSalary && job.salaryMin
    ? `$${job.salaryMin.toLocaleString()}${
        job.salaryMax ? ` - $${job.salaryMax.toLocaleString()}` : '+'
      } ${job.salaryType === 'hourly' ? '/hr' : '/yr'}`
    : null;

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          {/* Company Logo */}
          <Avatar className="h-12 w-12">
            {job.company.logo ? (
              <AvatarImage
                src={urlFor(job.company.logo).width(96).height(96).url()}
                alt={job.company.name}
              />
            ) : (
              <AvatarFallback>
                <Building2 className="h-6 w-6" />
              </AvatarFallback>
            )}
          </Avatar>

          {/* Job Details */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold">
                  <Link
                    href={`/jobs/${job.slug.current}`}
                    className="hover:text-blue-600 transition-colors"
                  >
                    {job.title}
                  </Link>
                </h3>

                <div className="flex items-center gap-3 mt-1 text-sm text-gray-600">
                  <span className="flex items-center gap-1">
                    {job.company.verified && (
                      <CheckCircle2 className="h-4 w-4 text-blue-500" />
                    )}
                    {job.company.name}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {job.location.city}, CO
                  </span>
                  <span className="flex items-center gap-1">
                    <Briefcase className="h-4 w-4" />
                    {job.jobType}
                  </span>
                </div>

                {/* Salary */}
                {salaryDisplay && (
                  <div className="flex items-center gap-1 mt-2 text-sm font-medium text-green-600">
                    <DollarSign className="h-4 w-4" />
                    {salaryDisplay}
                  </div>
                )}

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mt-3">
                  {job.isUrgent && (
                    <Badge variant="destructive" className="gap-1">
                      <AlertCircle className="h-3 w-3" />
                      Urgent Hire
                    </Badge>
                  )}
                  {job.featured && (
                    <Badge variant="default">Featured</Badge>
                  )}
                  {job.category && (
                    <Badge variant="secondary">{job.category.name}</Badge>
                  )}
                  <Badge variant="outline">{job.experienceLevel}</Badge>
                  {job.remoteOptions && job.remoteOptions !== 'onsite' && (
                    <Badge variant="outline">
                      {job.remoteOptions === 'remote' ? 'Remote' : 'Hybrid'}
                    </Badge>
                  )}
                </div>

                {/* Posted Time */}
                <p className="text-xs text-gray-500 mt-3">
                  Posted {formatDistanceToNow(new Date(job.publishedAt), { addSuffix: true })}
                </p>
              </div>

              {/* Apply Button */}
              <div className="flex-shrink-0">
                <Link href={`/jobs/${job.slug.current}`}>
                  <Button>Apply Now</Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}