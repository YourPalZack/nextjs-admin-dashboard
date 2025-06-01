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
                <p>• {job.applicationCount || 0} people have applied</p>
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