# DOC-016: Company Profile Management

## Overview
This document covers building the company profile management system, including editing company information, logo upload to Sanity assets, managing multiple locations, benefits list management, and verification request functionality.

## Prerequisites
- DOC-001 through DOC-015 completed
- Company schema in Sanity configured
- Image upload functionality working
- NextAdmin form components available

## Steps

### 1. Create Company Profile Types

Define TypeScript types for company management:

```typescript
// types/company.ts
export interface CompanyProfile {
  _id: string;
  name: string;
  slug: { current: string };
  logo?: {
    _type: 'image';
    asset: {
      _ref: string;
      _type: 'reference';
    };
  };
  description?: string;
  website?: string;
  email?: string;
  phone?: string;
  size?: '1-10' | '11-50' | '51-200' | '200+';
  industry?: string;
  founded?: string;
  locations: Array<{
    _key?: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    isPrimary: boolean;
    coordinates?: {
      lat: number;
      lng: number;
    };
  }>;
  benefitsOffered: string[];
  socialLinks?: {
    linkedin?: string;
    twitter?: string;
    facebook?: string;
    instagram?: string;
  };
  verified: boolean;
  verificationStatus?: 'pending' | 'approved' | 'rejected';
  verificationRequestDate?: string;
  ownerId: string;
}

export interface CompanyFormData {
  name: string;
  description: string;
  website: string;
  email: string;
  phone: string;
  size: string;
  industry: string;
  founded: string;
  benefitsOffered: string[];
  socialLinks: {
    linkedin: string;
    twitter: string;
    facebook: string;
    instagram: string;
  };
}
```

### 2. Create Company Form Validation

Set up form validation schema:

```typescript
// lib/validations/company.ts
import { z } from 'zod';

export const companyFormSchema = z.object({
  name: z.string()
    .min(2, 'Company name must be at least 2 characters')
    .max(100, 'Company name must be less than 100 characters'),
  
  description: z.string()
    .max(1000, 'Description must be less than 1000 characters')
    .optional(),
  
  website: z.string()
    .url('Please enter a valid URL')
    .optional()
    .or(z.literal('')),
  
  email: z.string()
    .email('Please enter a valid email')
    .optional()
    .or(z.literal('')),
  
  phone: z.string()
    .regex(/^[\d\s\-\(\)\+]+$/, 'Invalid phone number')
    .optional()
    .or(z.literal('')),
  
  size: z.enum(['1-10', '11-50', '51-200', '200+']).optional(),
  
  industry: z.string().optional(),
  
  founded: z.string()
    .regex(/^\d{4}$/, 'Please enter a valid year')
    .optional()
    .or(z.literal('')),
  
  benefitsOffered: z.array(z.string()).default([]),
  
  socialLinks: z.object({
    linkedin: z.string().url().optional().or(z.literal('')),
    twitter: z.string().url().optional().or(z.literal('')),
    facebook: z.string().url().optional().or(z.literal('')),
    instagram: z.string().url().optional().or(z.literal(''))
  }).optional()
});

export const locationFormSchema = z.object({
  address: z.string().min(5, 'Address is required'),
  city: z.string().min(2, 'City is required'),
  state: z.string().length(2, 'State must be 2 characters'),
  zipCode: z.string().regex(/^\d{5}$/, 'Invalid ZIP code'),
  isPrimary: z.boolean().default(false)
});

export type CompanyFormValues = z.infer<typeof companyFormSchema>;
export type LocationFormValues = z.infer<typeof locationFormSchema>;
```

### 3. Create Logo Upload Component

Build a logo upload component with preview:

```typescript
// components/Dashboard/LogoUpload.tsx
'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, X, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { urlFor } from '@/lib/sanity';

interface LogoUploadProps {
  currentLogo?: any;
  onUpload: (logoUrl: string, assetId: string) => void;
  onRemove: () => void;
}

export default function LogoUpload({ currentLogo, onUpload, onRemove }: LogoUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    // Validate file
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file');
      return;
    }

    if (file.size > 2 * 1024 * 1024) { // 2MB limit
      setError('Image must be less than 2MB');
      return;
    }

    setError(null);
    setIsUploading(true);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload-logo', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      onUpload(data.url, data.assetId);
    } catch (error) {
      console.error('Logo upload error:', error);
      setError('Failed to upload logo. Please try again.');
      setPreview(null);
    } finally {
      setIsUploading(false);
    }
  }, [onUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.svg']
    },
    maxFiles: 1,
    disabled: isUploading
  });

  const handleRemove = () => {
    setPreview(null);
    onRemove();
  };

  const displayImage = preview || (currentLogo && urlFor(currentLogo).width(200).url());

  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {displayImage ? (
        <Card className="p-4">
          <div className="relative inline-block">
            <Image
              src={displayImage}
              alt="Company logo"
              width={200}
              height={200}
              className="rounded-lg object-contain"
            />
            {!isUploading && (
              <Button
                variant="destructive"
                size="icon"
                className="absolute -top-2 -right-2"
                onClick={handleRemove}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </Card>
      ) : (
        <Card
          {...getRootProps()}
          className={`border-2 border-dashed p-8 text-center cursor-pointer transition-colors ${
            isDragActive ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-gray-400'
          }`}
        >
          <input {...getInputProps()} />
          {isUploading ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              <p className="text-sm text-gray-600">Uploading...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <Upload className="h-8 w-8 text-gray-400" />
              <p className="text-sm text-gray-600">
                {isDragActive
                  ? 'Drop the image here'
                  : 'Drag & drop logo here, or click to select'}
              </p>
              <p className="text-xs text-gray-500">
                PNG, JPG, GIF up to 2MB
              </p>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
```

### 4. Create Location Management Component

Build a component to manage multiple locations:

```typescript
// components/Dashboard/LocationManager.tsx
'use client';

import { useState } from 'react';
import { useFieldArray, UseFormReturn } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { MapPin, Plus, Trash2, Edit } from 'lucide-react';
import type { LocationFormValues } from '@/lib/validations/company';

interface LocationManagerProps {
  form: UseFormReturn<any>;
}

export default function LocationManager({ form }: LocationManagerProps) {
  const [showDialog, setShowDialog] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [locationForm, setLocationForm] = useState<LocationFormValues>({
    address: '',
    city: '',
    state: 'CO',
    zipCode: '',
    isPrimary: false
  });

  const { fields, append, remove, update } = useFieldArray({
    control: form.control,
    name: 'locations'
  });

  const handleAddLocation = () => {
    setEditingIndex(null);
    setLocationForm({
      address: '',
      city: '',
      state: 'CO',
      zipCode: '',
      isPrimary: fields.length === 0
    });
    setShowDialog(true);
  };

  const handleEditLocation = (index: number) => {
    setEditingIndex(index);
    setLocationForm(fields[index]);
    setShowDialog(true);
  };

  const handleSaveLocation = () => {
    if (editingIndex !== null) {
      update(editingIndex, locationForm);
    } else {
      // If this is marked as primary, unmark others
      if (locationForm.isPrimary) {
        fields.forEach((field, index) => {
          if (field.isPrimary) {
            update(index, { ...field, isPrimary: false });
          }
        });
      }
      append(locationForm);
    }
    setShowDialog(false);
  };

  const handleSetPrimary = (index: number) => {
    fields.forEach((field, i) => {
      update(i, { ...field, isPrimary: i === index });
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label>Locations</Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAddLocation}
        >
          <Plus className="h-4 w-4 mr-1" />
          Add Location
        </Button>
      </div>

      {fields.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <MapPin className="h-8 w-8 mx-auto text-gray-400 mb-2" />
            <p className="text-sm text-gray-600">No locations added yet</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {fields.map((field, index) => (
            <Card key={field.id}>
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="font-medium">{field.address}</p>
                    <p className="text-sm text-gray-600">
                      {field.city}, {field.state} {field.zipCode}
                    </p>
                    {field.isPrimary && (
                      <span className="text-xs text-blue-600 font-medium">
                        Primary Location
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {!field.isPrimary && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSetPrimary(index)}
                    >
                      Set Primary
                    </Button>
                  )}
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEditLocation(index)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => remove(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingIndex !== null ? 'Edit' : 'Add'} Location
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="address">Street Address</Label>
              <Input
                id="address"
                value={locationForm.address}
                onChange={(e) => setLocationForm({ ...locationForm, address: e.target.value })}
                placeholder="123 Main St"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={locationForm.city}
                  onChange={(e) => setLocationForm({ ...locationForm, city: e.target.value })}
                  placeholder="Denver"
                />
              </div>
              <div>
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  value={locationForm.state}
                  onChange={(e) => setLocationForm({ ...locationForm, state: e.target.value })}
                  maxLength={2}
                  placeholder="CO"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="zipCode">ZIP Code</Label>
              <Input
                id="zipCode"
                value={locationForm.zipCode}
                onChange={(e) => setLocationForm({ ...locationForm, zipCode: e.target.value })}
                placeholder="80202"
                maxLength={5}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="isPrimary" className="text-sm">
                Set as primary location
              </Label>
              <Switch
                id="isPrimary"
                checked={locationForm.isPrimary}
                onCheckedChange={(checked) => 
                  setLocationForm({ ...locationForm, isPrimary: checked })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveLocation}>
              {editingIndex !== null ? 'Update' : 'Add'} Location
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
```

### 5. Create Benefits Selection Component

```typescript
// components/Dashboard/BenefitsSelector.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Plus, X, Check } from 'lucide-react';

const commonBenefits = [
  'Health Insurance',
  'Dental Insurance',
  'Vision Insurance',
  '401(k)',
  '401(k) Matching',
  'Life Insurance',
  'Disability Insurance',
  'Paid Time Off',
  'Paid Holidays',
  'Sick Leave',
  'Flexible Schedule',
  'Remote Work Options',
  'Professional Development',
  'Tuition Reimbursement',
  'Employee Discount',
  'Gym Membership',
  'Wellness Program',
  'Employee Assistance Program',
  'Retirement Plan',
  'Stock Options',
  'Performance Bonus',
  'Signing Bonus',
  'Relocation Assistance',
  'Company Vehicle',
  'Parking',
  'Transit Subsidy',
  'Tool Allowance',
  'Uniform Provided',
  'Safety Equipment Provided',
  'Overtime Pay',
  'Double Time Pay',
  'Hazard Pay',
  'Per Diem',
  'Travel Reimbursement'
];

interface BenefitsSelectorProps {
  value: string[];
  onChange: (benefits: string[]) => void;
}

export default function BenefitsSelector({ value, onChange }: BenefitsSelectorProps) {
  const [customBenefit, setCustomBenefit] = useState('');
  const [showPopover, setShowPopover] = useState(false);

  const toggleBenefit = (benefit: string) => {
    if (value.includes(benefit)) {
      onChange(value.filter(b => b !== benefit));
    } else {
      onChange([...value, benefit]);
    }
  };

  const addCustomBenefit = () => {
    if (customBenefit.trim() && !value.includes(customBenefit.trim())) {
      onChange([...value, customBenefit.trim()]);
      setCustomBenefit('');
    }
  };

  const removeBenefit = (benefit: string) => {
    onChange(value.filter(b => b !== benefit));
  };

  // Categorize benefits
  const categories = {
    'Insurance': ['Health Insurance', 'Dental Insurance', 'Vision Insurance', 'Life Insurance', 'Disability Insurance'],
    'Retirement': ['401(k)', '401(k) Matching', 'Retirement Plan', 'Stock Options'],
    'Time Off': ['Paid Time Off', 'Paid Holidays', 'Sick Leave', 'Flexible Schedule'],
    'Professional': ['Professional Development', 'Tuition Reimbursement', 'Remote Work Options'],
    'Compensation': ['Performance Bonus', 'Signing Bonus', 'Overtime Pay', 'Double Time Pay', 'Hazard Pay'],
    'Other': commonBenefits.filter(b => 
      !['Insurance', 'Retirement', 'Time Off', 'Professional', 'Compensation']
        .some(cat => categories[cat as keyof typeof categories]?.includes(b))
    )
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label>Benefits Offered</Label>
        <Popover open={showPopover} onOpenChange={setShowPopover}>
          <PopoverTrigger asChild>
            <Button type="button" variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-1" />
              Add Benefits
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[400px] max-h-[500px] overflow-y-auto">
            <div className="space-y-4">
              <div>
                <Label>Select Common Benefits</Label>
                <div className="mt-2 space-y-4">
                  {Object.entries(categories).map(([category, benefits]) => (
                    <div key={category}>
                      <p className="text-sm font-medium text-gray-700 mb-2">{category}</p>
                      <div className="grid grid-cols-2 gap-2">
                        {benefits.map(benefit => (
                          <label
                            key={benefit}
                            className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded text-sm"
                          >
                            <input
                              type="checkbox"
                              checked={value.includes(benefit)}
                              onChange={() => toggleBenefit(benefit)}
                              className="rounded"
                            />
                            <span>{benefit}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="border-t pt-4">
                <Label htmlFor="customBenefit">Add Custom Benefit</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    id="customBenefit"
                    value={customBenefit}
                    onChange={(e) => setCustomBenefit(e.target.value)}
                    placeholder="Enter custom benefit"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addCustomBenefit();
                      }
                    }}
                  />
                  <Button
                    type="button"
                    size="sm"
                    onClick={addCustomBenefit}
                    disabled={!customBenefit.trim()}
                  >
                    Add
                  </Button>
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {value.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {value.map(benefit => (
            <Badge key={benefit} variant="secondary" className="gap-1">
              {benefit}
              <button
                type="button"
                onClick={() => removeBenefit(benefit)}
                className="ml-1 hover:text-red-600"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-600">No benefits added yet</p>
      )}
    </div>
  );
}
```

### 6. Create Company Profile Form

```typescript
// components/Dashboard/CompanyProfileForm.tsx
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Building2, Globe, Users, Award } from 'lucide-react';
import LogoUpload from './LogoUpload';
import LocationManager from './LocationManager';
import BenefitsSelector from './BenefitsSelector';
import { companyFormSchema, type CompanyFormValues } from '@/lib/validations/company';
import type { CompanyProfile } from '@/types/company';

interface CompanyProfileFormProps {
  company: CompanyProfile;
}

const industries = [
  'Construction',
  'Manufacturing',
  'Transportation',
  'Utilities',
  'Retail',
  'Healthcare',
  'Education',
  'Technology',
  'Finance',
  'Real Estate',
  'Other'
];

export default function CompanyProfileForm({ company }: CompanyProfileFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [logo, setLogo] = useState(company.logo);
  const [requestingVerification, setRequestingVerification] = useState(false);

  const form = useForm<CompanyFormValues>({
    resolver: zodResolver(companyFormSchema),
    defaultValues: {
      name: company.name || '',
      description: company.description || '',
      website: company.website || '',
      email: company.email || '',
      phone: company.phone || '',
      size: company.size || '1-10',
      industry: company.industry || '',
      founded: company.founded || '',
      benefitsOffered: company.benefitsOffered || [],
      socialLinks: company.socialLinks || {
        linkedin: '',
        twitter: '',
        facebook: '',
        instagram: ''
      }
    }
  });

  const onSubmit = async (data: CompanyFormValues) => {
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/company/${company._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          logo,
          locations: form.getValues('locations')
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update company profile');
      }

      router.refresh();
    } catch (error) {
      console.error('Error updating company:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogoUpload = (url: string, assetId: string) => {
    setLogo({
      _type: 'image',
      asset: {
        _ref: assetId,
        _type: 'reference'
      }
    });
  };

  const handleLogoRemove = () => {
    setLogo(undefined);
  };

  const handleRequestVerification = async () => {
    setRequestingVerification(true);
    try {
      const response = await fetch(`/api/company/${company._id}/verify`, {
        method: 'POST'
      });

      if (!response.ok) {
        throw new Error('Failed to request verification');
      }

      router.refresh();
    } catch (error) {
      console.error('Error requesting verification:', error);
    } finally {
      setRequestingVerification(false);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <Tabs defaultValue="basic" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="basic">Basic Info</TabsTrigger>
          <TabsTrigger value="contact">Contact & Social</TabsTrigger>
          <TabsTrigger value="locations">Locations</TabsTrigger>
          <TabsTrigger value="benefits">Benefits</TabsTrigger>
        </TabsList>

        <TabsContent value="basic">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>
                Update your company's basic information and branding
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label>Company Logo</Label>
                <div className="mt-2">
                  <LogoUpload
                    currentLogo={logo}
                    onUpload={handleLogoUpload}
                    onRemove={handleLogoRemove}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="name">Company Name</Label>
                <Input
                  id="name"
                  {...form.register('name')}
                  placeholder="Your Company Name"
                />
                {form.formState.errors.name && (
                  <p className="text-sm text-red-600 mt-1">
                    {form.formState.errors.name.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="description">Company Description</Label>
                <Textarea
                  id="description"
                  {...form.register('description')}
                  placeholder="Tell job seekers about your company..."
                  rows={4}
                />
                {form.formState.errors.description && (
                  <p className="text-sm text-red-600 mt-1">
                    {form.formState.errors.description.message}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="industry">Industry</Label>
                  <Select
                    value={form.watch('industry')}
                    onValueChange={(value) => form.setValue('industry', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select industry" />
                    </SelectTrigger>
                    <SelectContent>
                      {industries.map(industry => (
                        <SelectItem key={industry} value={industry}>
                          {industry}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="size">Company Size</Label>
                  <Select
                    value={form.watch('size')}
                    onValueChange={(value) => form.setValue('size', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1-10">1-10 employees</SelectItem>
                      <SelectItem value="11-50">11-50 employees</SelectItem>
                      <SelectItem value="51-200">51-200 employees</SelectItem>
                      <SelectItem value="200+">200+ employees</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="founded">Year Founded</Label>
                <Input
                  id="founded"
                  {...form.register('founded')}
                  placeholder="e.g., 2010"
                  maxLength={4}
                />
                {form.formState.errors.founded && (
                  <p className="text-sm text-red-600 mt-1">
                    {form.formState.errors.founded.message}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contact">
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
              <CardDescription>
                How can job seekers reach you?
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="website">Company Website</Label>
                <Input
                  id="website"
                  type="url"
                  {...form.register('website')}
                  placeholder="https://example.com"
                />
                {form.formState.errors.website && (
                  <p className="text-sm text-red-600 mt-1">
                    {form.formState.errors.website.message}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">Contact Email</Label>
                  <Input
                    id="email"
                    type="email"
                    {...form.register('email')}
                    placeholder="hr@example.com"
                  />
                  {form.formState.errors.email && (
                    <p className="text-sm text-red-600 mt-1">
                      {form.formState.errors.email.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    {...form.register('phone')}
                    placeholder="(303) 555-0100"
                  />
                  {form.formState.errors.phone && (
                    <p className="text-sm text-red-600 mt-1">
                      {form.formState.errors.phone.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <Label>Social Media Links</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="linkedin" className="text-sm">LinkedIn</Label>
                    <Input
                      id="linkedin"
                      {...form.register('socialLinks.linkedin')}
                      placeholder="https://linkedin.com/company/..."
                    />
                  </div>
                  <div>
                    <Label htmlFor="twitter" className="text-sm">Twitter</Label>
                    <Input
                      id="twitter"
                      {...form.register('socialLinks.twitter')}
                      placeholder="https://twitter.com/..."
                    />
                  </div>
                  <div>
                    <Label htmlFor="facebook" className="text-sm">Facebook</Label>
                    <Input
                      id="facebook"
                      {...form.register('socialLinks.facebook')}
                      placeholder="https://facebook.com/..."
                    />
                  </div>
                  <div>
                    <Label htmlFor="instagram" className="text-sm">Instagram</Label>
                    <Input
                      id="instagram"
                      {...form.register('socialLinks.instagram')}
                      placeholder="https://instagram.com/..."
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="locations">
          <Card>
            <CardHeader>
              <CardTitle>Company Locations</CardTitle>
              <CardDescription>
                Add all locations where you have operations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <LocationManager form={form} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="benefits">
          <Card>
            <CardHeader>
              <CardTitle>Benefits & Perks</CardTitle>
              <CardDescription>
                What benefits do you offer to employees?
              </CardDescription>
            </CardHeader>
            <CardContent>
              <BenefitsSelector
                value={form.watch('benefitsOffered')}
                onChange={(benefits) => form.setValue('benefitsOffered', benefits)}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Verification Status */}
      {!company.verified && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Company Verification
            </CardTitle>
          </CardHeader>
          <CardContent>
            {company.verificationStatus === 'pending' ? (
              <Alert>
                <AlertDescription>
                  Your verification request is pending review. We'll notify you once it's processed.
                </AlertDescription>
              </Alert>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  Get verified to build trust with job seekers. Verified companies get:
                </p>
                <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                  <li>Verified badge on your profile</li>
                  <li>Higher visibility in search results</li>
                  <li>Increased applicant trust</li>
                </ul>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleRequestVerification}
                  disabled={requestingVerification}
                >
                  {requestingVerification ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Requesting...
                    </>
                  ) : (
                    <>
                      <Award className="mr-2 h-4 w-4" />
                      Request Verification
                    </>
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Submit Button */}
      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting} size="lg">
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            'Save Changes'
          )}
        </Button>
      </div>
    </form>
  );
}
```

### 7. Create Company API Routes

```typescript
// app/api/company/[companyId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { client } from '@/lib/sanity';

export async function GET(
  request: NextRequest,
  { params }: { params: { companyId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.companyId !== params.companyId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const company = await client.fetch(
      `*[_type == "company" && _id == $companyId][0]`,
      { companyId: params.companyId }
    );

    if (!company) {
      return NextResponse.json(
        { error: 'Company not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(company);
  } catch (error) {
    console.error('Error fetching company:', error);
    return NextResponse.json(
      { error: 'Failed to fetch company' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { companyId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.companyId !== params.companyId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    
    // Update company
    const updatedCompany = await client
      .patch(params.companyId)
      .set({
        name: body.name,
        description: body.description,
        website: body.website,
        email: body.email,
        phone: body.phone,
        size: body.size,
        industry: body.industry,
        founded: body.founded,
        logo: body.logo,
        locations: body.locations,
        benefitsOffered: body.benefitsOffered,
        socialLinks: body.socialLinks,
        slug: {
          _type: 'slug',
          current: body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')
        }
      })
      .commit();

    return NextResponse.json(updatedCompany);
  } catch (error) {
    console.error('Error updating company:', error);
    return NextResponse.json(
      { error: 'Failed to update company' },
      { status: 500 }
    );
  }
}
```

### 8. Create Logo Upload API

```typescript
// app/api/upload-logo/route.ts
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

    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/svg+xml'];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Please upload an image.' },
        { status: 400 }
      );
    }

    // Validate file size (2MB)
    if (file.size > 2 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 2MB.' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // Upload to Sanity
    const asset = await client.assets.upload('image', buffer, {
      filename: file.name,
      contentType: file.type,
    });

    return NextResponse.json({ 
      url: asset.url,
      assetId: asset._id 
    });
  } catch (error) {
    console.error('Logo upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload logo' },
      { status: 500 }
    );
  }
}
```

### 9. Create Verification Request API

```typescript
// app/api/company/[companyId]/verify/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { client } from '@/lib/sanity';
import { sendVerificationRequestEmail } from '@/lib/email';

export async function POST(
  request: NextRequest,
  { params }: { params: { companyId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.companyId !== params.companyId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if already verified or pending
    const company = await client.fetch(
      `*[_type == "company" && _id == $companyId][0]{
        verified,
        verificationStatus,
        name,
        email
      }`,
      { companyId: params.companyId }
    );

    if (company.verified) {
      return NextResponse.json(
        { error: 'Company already verified' },
        { status: 400 }
      );
    }

    if (company.verificationStatus === 'pending') {
      return NextResponse.json(
        { error: 'Verification already pending' },
        { status: 400 }
      );
    }

    // Update verification status
    await client
      .patch(params.companyId)
      .set({
        verificationStatus: 'pending',
        verificationRequestDate: new Date().toISOString()
      })
      .commit();

    // Send notification email to admin
    await sendVerificationRequestEmail({
      companyName: company.name,
      companyEmail: company.email,
      companyId: params.companyId
    });

    return NextResponse.json({ 
      success: true,
      message: 'Verification request submitted' 
    });
  } catch (error) {
    console.error('Error requesting verification:', error);
    return NextResponse.json(
      { error: 'Failed to request verification' },
      { status: 500 }
    );
  }
}