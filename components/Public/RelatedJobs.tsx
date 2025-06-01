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
                      {job.salaryMax && ` - $${job.salaryMax.toLocaleString()}`}
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