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