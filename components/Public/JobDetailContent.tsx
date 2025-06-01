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
    ? `$${job.salaryMin.toLocaleString()}${
        job.salaryMax ? ` - $${job.salaryMax.toLocaleString()}` : '+'
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
            {job.description && job.description.length > 0 ? (
              <PortableText value={job.description} />
            ) : (
              <p>No description available.</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Requirements */}
      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold">Requirements</h2>
        </CardHeader>
        <CardContent>
          <div className="whitespace-pre-wrap">{job.requirements || 'No specific requirements listed.'}</div>
          
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