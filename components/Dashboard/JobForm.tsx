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