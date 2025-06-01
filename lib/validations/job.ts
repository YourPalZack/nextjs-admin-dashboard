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