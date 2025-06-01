# DOC-020: SEO & Performance Optimization

## Overview

This document implements comprehensive SEO optimization and performance monitoring for the Colorado Job Board. This includes structured data, dynamic sitemaps, meta tag optimization, Core Web Vitals monitoring, and search engine optimization specifically for job-related content.

## Prerequisites

- **DOC-001**: Basic project setup completed
- **DOC-007**: Job listing pages implemented
- **DOC-008**: Job detail pages with static generation
- **DOC-010**: Company pages implemented
- All core functionality working

## SEO Strategy for Job Board

### Target Keywords
- Primary: "Colorado jobs", "blue collar jobs Colorado", "construction jobs Colorado"
- Secondary: "manufacturing jobs Colorado", "skilled trades Colorado", "Denver jobs"
- Long-tail: "[city name] construction jobs", "[trade] jobs Colorado"

### Content Strategy
- Job listings are the primary content
- Company profiles provide additional indexable content
- Location-based landing pages for major Colorado cities
- Industry-specific pages for different trades

## Steps

### 1. Dynamic Sitemap Generation

#### Main Sitemap
```typescript
// app/sitemap.ts
import { MetadataRoute } from 'next';
import { client } from '@/lib/sanity';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://coloradotradesjobs.com';

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/jobs`,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/companies`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ];

  // Dynamic job pages
  const jobs = await client.fetch(`
    *[_type == "jobPosting" && status == "published"] {
      slug,
      _updatedAt
    }
  `);

  const jobPages: MetadataRoute.Sitemap = jobs.map((job: any) => ({
    url: `${baseUrl}/jobs/${job.slug.current}`,
    lastModified: new Date(job._updatedAt),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  // Dynamic company pages
  const companies = await client.fetch(`
    *[_type == "company"] {
      slug,
      _updatedAt
    }
  `);

  const companyPages: MetadataRoute.Sitemap = companies.map((company: any) => ({
    url: `${baseUrl}/companies/${company.slug.current}`,
    lastModified: new Date(company._updatedAt),
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }));

  // Location-based pages
  const coloradoCities = [
    'denver', 'colorado-springs', 'aurora', 'fort-collins', 'lakewood',
    'thornton', 'arvada', 'westminster', 'pueblo', 'boulder'
  ];

  const locationPages: MetadataRoute.Sitemap = coloradoCities.map(city => ({
    url: `${baseUrl}/jobs/location/${city}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.8,
  }));

  // Industry-specific pages
  const industries = [
    'construction', 'manufacturing', 'automotive', 'electrical',
    'plumbing', 'hvac', 'welding', 'carpentry'
  ];

  const industryPages: MetadataRoute.Sitemap = industries.map(industry => ({
    url: `${baseUrl}/jobs/industry/${industry}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.8,
  }));

  return [
    ...staticPages,
    ...jobPages,
    ...companyPages,
    ...locationPages,
    ...industryPages,
  ];
}
```

#### Robots.txt
```typescript
// app/robots.ts
import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/dashboard/',
        '/api/',
        '/admin/',
        '/auth/',
        '/_next/',
        '/static/',
      ],
    },
    sitemap: 'https://coloradotradesjobs.com/sitemap.xml',
  };
}
```

### 2. Structured Data Implementation

#### Job Posting Schema
```typescript
// lib/structured-data.ts
import { Job, Company } from '@/types';

export function generateJobPostingSchema(job: Job, company: Company) {
  const baseUrl = 'https://coloradotradesjobs.com';
  
  return {
    '@context': 'https://schema.org',
    '@type': 'JobPosting',
    title: job.title,
    description: job.description,
    identifier: {
      '@type': 'PropertyValue',
      name: company.name,
      value: job._id,
    },
    datePosted: job.publishedAt,
    validThrough: job.applicationDeadline,
    employmentType: mapEmploymentType(job.jobType),
    hiringOrganization: {
      '@type': 'Organization',
      name: company.name,
      sameAs: company.website,
      logo: company.logo ? `https://cdn.sanity.io/${company.logo}` : undefined,
    },
    jobLocation: {
      '@type': 'Place',
      address: {
        '@type': 'PostalAddress',
        addressLocality: job.location.city,
        addressRegion: 'CO',
        postalCode: job.location.zipCode,
        addressCountry: 'US',
      },
      geo: job.location.coordinates ? {
        '@type': 'GeoCoordinates',
        latitude: job.location.coordinates.lat,
        longitude: job.location.coordinates.lng,
      } : undefined,
    },
    baseSalary: job.salaryMin ? {
      '@type': 'MonetaryAmount',
      currency: 'USD',
      value: {
        '@type': 'QuantitativeValue',
        minValue: job.salaryMin,
        maxValue: job.salaryMax || job.salaryMin,
        unitText: job.salaryType === 'hourly' ? 'HOUR' : 'YEAR',
      },
    } : undefined,
    workHours: mapWorkHours(job.jobType),
    qualifications: job.requirements,
    responsibilities: job.description,
    benefits: job.benefits?.join(', '),
    industry: job.category?.name,
    occupationalCategory: job.category?.name,
    url: `${baseUrl}/jobs/${job.slug.current}`,
    applicationContact: {
      '@type': 'ContactPoint',
      contactType: 'HR',
      email: company.email,
      telephone: company.phone,
    },
  };
}

function mapEmploymentType(jobType: string): string {
  const mapping: Record<string, string> = {
    'full-time': 'FULL_TIME',
    'part-time': 'PART_TIME',
    'contract': 'CONTRACTOR',
    'temporary': 'TEMPORARY',
  };
  return mapping[jobType] || 'FULL_TIME';
}

function mapWorkHours(jobType: string): string {
  return jobType === 'full-time' ? '40 hours per week' : 'Varies';
}

export function generateOrganizationSchema(company: Company) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: company.name,
    url: company.website,
    logo: company.logo ? `https://cdn.sanity.io/${company.logo}` : undefined,
    description: company.description,
    email: company.email,
    telephone: company.phone,
    address: company.locations?.[0] ? {
      '@type': 'PostalAddress',
      addressLocality: company.locations[0].city,
      addressRegion: 'CO',
      addressCountry: 'US',
    } : undefined,
    sameAs: [
      company.website,
      // Add social media links if available
    ].filter(Boolean),
  };
}

export function generateBreadcrumbSchema(items: Array<{ name: string; url: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}
```

### 3. Enhanced Meta Tags

#### Dynamic Meta Tags for Job Pages
```typescript
// app/jobs/[slug]/page.tsx - Update existing job detail page
import { Metadata } from 'next';
import { generateJobPostingSchema } from '@/lib/structured-data';

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const job = await getJobBySlug(params.slug);
  
  if (!job) {
    return {
      title: 'Job Not Found',
    };
  }

  const title = `${job.title} at ${job.company.name} - Colorado Trades Jobs`;
  const description = `Apply for ${job.title} position at ${job.company.name} in ${job.location.city}, Colorado. ${job.salaryMin ? `Starting at $${job.salaryMin}/${job.salaryType === 'hourly' ? 'hour' : 'year'}.` : ''} Apply now!`;

  return {
    title,
    description,
    keywords: [
      job.title.toLowerCase(),
      job.company.name.toLowerCase(),
      `${job.location.city.toLowerCase()} jobs`,
      'colorado jobs',
      job.category?.name.toLowerCase(),
      'blue collar jobs',
    ].filter(Boolean),
    openGraph: {
      title,
      description,
      type: 'article',
      url: `https://coloradotradesjobs.com/jobs/${job.slug.current}`,
      images: [
        {
          url: job.company.logo 
            ? `https://cdn.sanity.io/${job.company.logo}` 
            : '/og-job-default.png',
          width: 1200,
          height: 630,
          alt: `${job.title} at ${job.company.name}`,
        },
      ],
      siteName: 'Colorado Trades Jobs',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [
        job.company.logo 
          ? `https://cdn.sanity.io/${job.company.logo}` 
          : '/og-job-default.png'
      ],
    },
    alternates: {
      canonical: `https://coloradotradesjobs.com/jobs/${job.slug.current}`,
    },
  };
}

export default async function JobDetailPage({ params }: { params: { slug: string } }) {
  const job = await getJobBySlug(params.slug);
  
  if (!job) {
    notFound();
  }

  const jobSchema = generateJobPostingSchema(job, job.company);
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: 'https://coloradotradesjobs.com' },
    { name: 'Jobs', url: 'https://coloradotradesjobs.com/jobs' },
    { name: job.title, url: `https://coloradotradesjobs.com/jobs/${job.slug.current}` },
  ]);

  return (
    <>
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jobSchema),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchema),
        }}
      />
      
      {/* Page Content */}
      <JobDetailContent job={job} />
    </>
  );
}
```

### 4. Location-Based Landing Pages

#### Dynamic Location Pages
```typescript
// app/jobs/location/[city]/page.tsx
import { Metadata } from 'next';
import { client } from '@/lib/sanity';
import JobListingContent from '@/components/Public/JobListingContent';

const COLORADO_CITIES = {
  'denver': { name: 'Denver', county: 'Denver County' },
  'colorado-springs': { name: 'Colorado Springs', county: 'El Paso County' },
  'aurora': { name: 'Aurora', county: 'Adams County' },
  'fort-collins': { name: 'Fort Collins', county: 'Larimer County' },
  'boulder': { name: 'Boulder', county: 'Boulder County' },
  'lakewood': { name: 'Lakewood', county: 'Jefferson County' },
  'thornton': { name: 'Thornton', county: 'Adams County' },
  'arvada': { name: 'Arvada', county: 'Jefferson County' },
  'westminster': { name: 'Westminster', county: 'Adams County' },
  'pueblo': { name: 'Pueblo', county: 'Pueblo County' },
};

export async function generateStaticParams() {
  return Object.keys(COLORADO_CITIES).map((city) => ({
    city,
  }));
}

export async function generateMetadata({ params }: { params: { city: string } }): Promise<Metadata> {
  const cityInfo = COLORADO_CITIES[params.city as keyof typeof COLORADO_CITIES];
  
  if (!cityInfo) {
    return { title: 'City Not Found' };
  }

  const title = `Jobs in ${cityInfo.name}, Colorado - Blue Collar & Skilled Trades`;
  const description = `Find construction, manufacturing, and skilled trade jobs in ${cityInfo.name}, Colorado. Browse current openings from top employers in ${cityInfo.county}. Apply today!`;

  return {
    title,
    description,
    keywords: [
      `${cityInfo.name.toLowerCase()} jobs`,
      `jobs in ${cityInfo.name.toLowerCase()}`,
      `${cityInfo.name.toLowerCase()} construction jobs`,
      `${cityInfo.name.toLowerCase()} manufacturing`,
      'colorado jobs',
      'blue collar jobs',
    ],
    openGraph: {
      title,
      description,
      url: `https://coloradotradesjobs.com/jobs/location/${params.city}`,
      images: [
        {
          url: `/og-images/city-${params.city}.png`,
          width: 1200,
          height: 630,
          alt: `Jobs in ${cityInfo.name}, Colorado`,
        },
      ],
    },
    alternates: {
      canonical: `https://coloradotradesjobs.com/jobs/location/${params.city}`,
    },
  };
}

async function getJobsByCity(citySlug: string) {
  const cityInfo = COLORADO_CITIES[citySlug as keyof typeof COLORADO_CITIES];
  if (!cityInfo) return { jobs: [], total: 0 };

  const query = `
    *[_type == "jobPosting" && status == "published" && location.city == $city] | order(publishedAt desc) {
      _id,
      title,
      slug,
      "company": company->{name, slug, logo, verified},
      location,
      salaryMin,
      salaryMax,
      salaryType,
      jobType,
      isUrgent,
      featured,
      publishedAt
    }
  `;

  const jobs = await client.fetch(query, { city: cityInfo.name });
  
  return {
    jobs,
    total: jobs.length,
  };
}

export default async function CityJobsPage({ params }: { params: { city: string } }) {
  const cityInfo = COLORADO_CITIES[params.city as keyof typeof COLORADO_CITIES];
  
  if (!cityInfo) {
    notFound();
  }

  const { jobs, total } = await getJobsByCity(params.city);

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: 'https://coloradotradesjobs.com' },
    { name: 'Jobs', url: 'https://coloradotradesjobs.com/jobs' },
    { name: `${cityInfo.name} Jobs`, url: `https://coloradotradesjobs.com/jobs/location/${params.city}` },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchema),
        }}
      />
      
      <div className="container mx-auto py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">
            Jobs in {cityInfo.name}, Colorado
          </h1>
          <p className="text-lg text-gray-600 mb-4">
            Discover {total} blue-collar and skilled trade opportunities in {cityInfo.name}. 
            From construction to manufacturing, find your next career opportunity in {cityInfo.county}.
          </p>
          
          <div className="bg-blue-50 p-4 rounded-lg">
            <h2 className="font-semibold mb-2">Popular Job Categories in {cityInfo.name}:</h2>
            <div className="flex flex-wrap gap-2">
              {['Construction', 'Manufacturing', 'Automotive', 'Electrical', 'Plumbing', 'HVAC'].map(category => (
                <span key={category} className="bg-white px-3 py-1 rounded-full text-sm border">
                  {category}
                </span>
              ))}
            </div>
          </div>
        </div>

        <JobListingContent
          initialJobs={jobs}
          title={`${total} Jobs Found in ${cityInfo.name}`}
          showLocationFilter={false}
        />
      </div>
    </>
  );
}
```

### 5. Core Web Vitals Monitoring

#### Performance Monitoring Component
```typescript
// lib/analytics.ts
import { getCLS, getFID, getFCP, getLCP, getTTFB, Metric } from 'web-vitals';

function sendToAnalytics(metric: Metric) {
  // Send to your analytics provider
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', metric.name, {
      custom_parameter_1: metric.value,
      custom_parameter_2: metric.id,
      custom_parameter_3: metric.name,
    });
  }

  // Also send to Vercel Analytics if available
  if (typeof window !== 'undefined' && (window as any).va) {
    (window as any).va('track', 'web-vital', {
      name: metric.name,
      value: metric.value,
      id: metric.id,
    });
  }

  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Web Vital] ${metric.name}:`, metric.value);
  }
}

export function trackWebVitals() {
  getCLS(sendToAnalytics);
  getFID(sendToAnalytics);
  getFCP(sendToAnalytics);
  getLCP(sendToAnalytics);
  getTTFB(sendToAnalytics);
}

// Page load performance tracking
export function trackPagePerformance(pageName: string) {
  if (typeof window !== 'undefined' && window.performance) {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    
    const metrics = {
      page: pageName,
      loadTime: navigation.loadEventEnd - navigation.loadEventStart,
      domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
      firstByte: navigation.responseStart - navigation.requestStart,
      dns: navigation.domainLookupEnd - navigation.domainLookupStart,
      tcp: navigation.connectEnd - navigation.connectStart,
    };

    // Send to analytics
    if ((window as any).gtag) {
      (window as any).gtag('event', 'page_performance', metrics);
    }
  }
}
```

#### Performance Monitoring Hook
```typescript
// hooks/usePerformanceMonitoring.ts
'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { trackWebVitals, trackPagePerformance } from '@/lib/analytics';

export function usePerformanceMonitoring() {
  const pathname = usePathname();

  useEffect(() => {
    // Track web vitals
    trackWebVitals();

    // Track page-specific performance
    const pageName = pathname === '/' ? 'home' : pathname.replace('/', '').replace(/\//g, '-');
    trackPagePerformance(pageName);

    // Performance observer for resource timing
    if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          if (entry.entryType === 'largest-contentful-paint') {
            console.log('LCP:', entry.startTime);
          }
          if (entry.entryType === 'layout-shift') {
            console.log('CLS:', (entry as any).value);
          }
        });
      });

      observer.observe({ entryTypes: ['largest-contentful-paint', 'layout-shift'] });

      return () => {
        observer.disconnect();
      };
    }
  }, [pathname]);
}
```

### 6. Image Optimization

#### Optimized Image Component
```typescript
// components/Shared/OptimizedImage.tsx
import Image from 'next/image';
import { useState } from 'react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  priority?: boolean;
  className?: string;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
}

export default function OptimizedImage({
  src,
  alt,
  width,
  height,
  priority = false,
  className = '',
  placeholder = 'empty',
  blurDataURL,
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Generate blur data URL for Sanity images
  const getBlurDataURL = (imageUrl: string) => {
    if (blurDataURL) return blurDataURL;
    
    // For Sanity images, create a low-quality version
    if (imageUrl.includes('cdn.sanity.io')) {
      return imageUrl + '?w=10&q=10&blur=50';
    }
    
    return undefined;
  };

  if (hasError) {
    return (
      <div 
        className={`flex items-center justify-center bg-gray-200 ${className}`}
        style={{ width, height }}
      >
        <span className="text-gray-400 text-sm">Image unavailable</span>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        priority={priority}
        placeholder={placeholder}
        blurDataURL={getBlurDataURL(src)}
        className={`transition-opacity duration-300 ${
          isLoading ? 'opacity-0' : 'opacity-100'
        }`}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setIsLoading(false);
          setHasError(true);
        }}
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      />
      
      {isLoading && (
        <div 
          className="absolute inset-0 bg-gray-200 animate-pulse"
          style={{ width, height }}
        />
      )}
    </div>
  );
}
```

### 7. SEO Analytics and Monitoring

#### Google Search Console Setup
```typescript
// components/SEO/GoogleSearchConsole.tsx
export default function GoogleSearchConsole() {
  const verificationId = process.env.NEXT_PUBLIC_GOOGLE_SEARCH_CONSOLE_ID;
  
  if (!verificationId) return null;

  return (
    <meta 
      name="google-site-verification" 
      content={verificationId} 
    />
  );
}
```

#### Analytics Integration
```typescript
// components/SEO/Analytics.tsx
import Script from 'next/script';

export default function Analytics() {
  const gaId = process.env.NEXT_PUBLIC_GA_ID;
  
  if (!gaId) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${gaId}', {
            page_title: document.title,
            page_location: window.location.href,
          });
          
          // Track job applications
          window.trackJobApplication = function(jobId, jobTitle) {
            gtag('event', 'job_application', {
              event_category: 'engagement',
              event_label: jobTitle,
              job_id: jobId,
            });
          };
          
          // Track job views
          window.trackJobView = function(jobId, jobTitle) {
            gtag('event', 'job_view', {
              event_category: 'engagement',
              event_label: jobTitle,
              job_id: jobId,
            });
          };
        `}
      </Script>
    </>
  );
}
```

### 8. RSS Feed for Jobs

#### RSS Feed Generation
```typescript
// app/feed.xml/route.ts
import { NextResponse } from 'next/server';
import { client } from '@/lib/sanity';

export async function GET() {
  const jobs = await client.fetch(`
    *[_type == "jobPosting" && status == "published"] | order(publishedAt desc) [0...50] {
      _id,
      title,
      slug,
      description,
      "company": company->{name},
      location,
      salaryMin,
      publishedAt
    }
  `);

  const baseUrl = 'https://coloradotradesjobs.com';
  
  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Colorado Trades Jobs - Latest Job Openings</title>
    <description>Latest blue-collar and skilled trade job openings in Colorado</description>
    <link>${baseUrl}</link>
    <atom:link href="${baseUrl}/feed.xml" rel="self" type="application/rss+xml"/>
    <language>en-US</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <generator>Colorado Trades Jobs</generator>
    
    ${jobs.map((job: any) => `
    <item>
      <title><![CDATA[${job.title} at ${job.company.name}]]></title>
      <description><![CDATA[${job.description?.substring(0, 200) || 'Job opportunity in Colorado'}...]]></description>
      <link>${baseUrl}/jobs/${job.slug.current}</link>
      <guid>${baseUrl}/jobs/${job.slug.current}</guid>
      <pubDate>${new Date(job.publishedAt).toUTCString()}</pubDate>
      <category>Jobs</category>
      <category>${job.location.city}</category>
      ${job.salaryMin ? `<category>$${job.salaryMin}+</category>` : ''}
    </item>
    `).join('')}
  </channel>
</rss>`;

  return new NextResponse(rss, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}
```

### 9. Local SEO Optimization

#### Local Business Schema
```typescript
// lib/local-seo.ts
export function generateLocalBusinessSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': 'https://coloradotradesjobs.com/#organization',
    name: 'Colorado Trades Jobs',
    url: 'https://coloradotradesjobs.com',
    description: 'Colorado\'s premier job board for blue-collar and skilled trade positions',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Denver',
      addressRegion: 'CO',
      addressCountry: 'US',
    },
    areaServed: {
      '@type': 'State',
      name: 'Colorado',
    },
    serviceArea: {
      '@type': 'GeoCircle',
      geoMidpoint: {
        '@type': 'GeoCoordinates',
        latitude: 39.7392,
        longitude: -104.9903,
      },
      geoRadius: '500000', // 500km radius
    },
    knowsAbout: [
      'Construction Jobs',
      'Manufacturing Jobs',
      'Skilled Trades',
      'Blue Collar Employment',
      'Colorado Employment',
    ],
    sameAs: [
      'https://www.facebook.com/coloradotradesjobs',
      'https://www.linkedin.com/company/coloradotradesjobs',
      'https://twitter.com/cotradesjobs',
    ],
  };
}
```

### 10. Performance Optimization Techniques

#### Bundle Analysis Script
```json
// package.json - Add script
{
  "scripts": {
    "analyze": "ANALYZE=true npm run build",
    "lighthouse": "lighthouse http://localhost:3000 --output json --output html --view"
  }
}
```

#### Critical CSS Extraction
```typescript
// lib/critical-css.ts
export const criticalCSS = `
  /* Critical above-the-fold styles */
  .header { display: flex; justify-content: space-between; }
  .hero { text-align: center; padding: 4rem 1rem; }
  .job-card { border: 1px solid #e5e7eb; border-radius: 8px; }
  /* Add minimal styles for LCP elements */
`;
```

#### Add Critical CSS to Layout
```typescript
// app/layout.tsx - Add to head
<style dangerouslySetInnerHTML={{ __html: criticalCSS }} />
```

## Verification Steps

### 1. SEO Audit
1. **Google PageSpeed Insights**: Test both mobile and desktop
2. **Google Search Console**: Submit sitemap and monitor indexing
3. **Lighthouse SEO Audit**: Aim for 90+ SEO score
4. **Rich Results Test**: Verify structured data displays correctly
5. **Mobile-Friendly Test**: Ensure all pages pass Google's mobile test

### 2. Performance Testing
1. **Core Web Vitals**: 
   - LCP < 2.5s
   - FID < 100ms
   - CLS < 0.1
2. **Bundle Size**: Keep JavaScript bundles under 250KB
3. **Image Optimization**: All images using next/image with proper sizing
4. **Caching**: Verify proper cache headers are set

### 3. Structured Data Validation
1. **Schema.org Validator**: Test job posting schemas
2. **Google Rich Results**: Check job posting rich snippets
3. **Breadcrumb Testing**: Verify breadcrumb markup
4. **Organization Schema**: Test company profile schemas

### 4. Local SEO Testing
1. **Google My Business**: Set up business profile if applicable
2. **Local Keywords**: Test ranking for "colorado jobs" searches
3. **City Pages**: Verify location-based landing pages rank
4. **Local Directories**: Submit to Colorado business directories

## Common Issues & Solutions

### Issue: Poor Core Web Vitals
**Solution:**
- Optimize images with next/image
- Preload critical resources
- Minimize layout shifts with proper sizing
- Use dynamic imports for non-critical components

### Issue: Low SEO Score
**Solution:**
- Add missing meta descriptions
- Improve heading structure (H1, H2, H3)
- Add alt text to all images
- Fix broken internal links

### Issue: Structured Data Errors
**Solution:**
- Validate JSON-LD syntax
- Ensure required properties are included
- Test with Google's Rich Results tool
- Check for missing organization data

### Issue: Slow Page Load Times
**Solution:**
- Enable static generation where possible
- Optimize database queries
- Implement proper caching strategies
- Use CDN for static assets

### Issue: Poor Mobile Performance
**Solution:**
- Prioritize mobile-first CSS
- Reduce JavaScript bundle size
- Optimize touch targets
- Test on real mobile devices

## Advanced SEO Strategies

### 1. Content Marketing Integration
```typescript
// Future blog system integration
// app/blog/[slug]/page.tsx
export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const post = await getBlogPost(params.slug);
  
  return {
    title: `${post.title} - Colorado Trades Jobs Blog`,
    description: post.excerpt,
    keywords: post.tags,
    openGraph: {
      type: 'article',
      publishedTime: post.publishedAt,
      authors: [post.author],
    },
    alternates: {
      canonical: `https://coloradotradesjobs.com/blog/${post.slug}`,
    },
  };
}
```

### 2. FAQ Schema Implementation
```typescript
// lib/faq-schema.ts
export function generateFAQSchema(faqs: Array<{ question: string; answer: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}
```

### 3. Review Schema for Companies
```typescript
// lib/review-schema.ts
export function generateReviewSchema(company: Company, reviews: Review[]) {
  const aggregateRating = {
    '@type': 'AggregateRating',
    ratingValue: reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length,
    reviewCount: reviews.length,
    bestRating: 5,
    worstRating: 1,
  };

  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: company.name,
    aggregateRating,
    review: reviews.map(review => ({
      '@type': 'Review',
      author: {
        '@type': 'Person',
        name: review.authorName,
      },
      reviewRating: {
        '@type': 'Rating',
        ratingValue: review.rating,
        bestRating: 5,
        worstRating: 1,
      },
      reviewBody: review.text,
      datePublished: review.createdAt,
    })),
  };
}
```

### 4. Video Schema for Job Descriptions
```typescript
// lib/video-schema.ts
export function generateVideoSchema(videoUrl: string, job: Job) {
  return {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    name: `${job.title} at ${job.company.name} - Job Overview`,
    description: `Learn about the ${job.title} position at ${job.company.name}`,
    uploadDate: job.publishedAt,
    contentUrl: videoUrl,
    thumbnailUrl: `${videoUrl}?thumbnail`,
    duration: 'PT2M30S', // 2 minutes 30 seconds example
    embedUrl: `${videoUrl}?embed=true`,
  };
}
```

## Performance Monitoring Dashboard

### 1. Performance Metrics API
```typescript
// app/api/performance/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Collect performance metrics from your monitoring service
    const metrics = {
      coreWebVitals: {
        lcp: await getAverageLCP(),
        fid: await getAverageFID(),
        cls: await getAverageCLS(),
      },
      pageViews: await getPageViews(),
      searchPerformance: await getSearchMetrics(),
      conversionRates: await getConversionRates(),
    };

    return NextResponse.json(metrics);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch performance metrics' },
      { status: 500 }
    );
  }
}

async function getAverageLCP() {
  // Implement based on your analytics provider
  return 2.1; // seconds
}

async function getAverageFID() {
  return 85; // milliseconds
}

async function getAverageCLS() {
  return 0.05; // score
}

async function getPageViews() {
  // Return page view data
  return {
    total: 150000,
    jobPages: 95000,
    companyPages: 25000,
    landingPages: 30000,
  };
}

async function getSearchMetrics() {
  // Return search performance data
  return {
    impressions: 50000,
    clicks: 5000,
    averagePosition: 12.3,
    ctr: 0.1,
  };
}

async function getConversionRates() {
  return {
    jobViewToApplication: 0.15,
    searchToJobView: 0.35,
    visitorToJobSeeker: 0.08,
  };
}
```

### 2. SEO Monitoring Component
```typescript
// components/Dashboard/SEOMetrics.tsx
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Eye, MousePointer, Search } from 'lucide-react';

interface SEOMetrics {
  impressions: number;
  clicks: number;
  averagePosition: number;
  ctr: number;
}

export default function SEOMetrics() {
  const [metrics, setMetrics] = useState<SEOMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/performance')
      .then(res => res.json())
      .then(data => {
        setMetrics(data.searchPerformance);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load SEO metrics:', err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-16 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!metrics) return null;

  const metricCards = [
    {
      title: 'Search Impressions',
      value: metrics.impressions.toLocaleString(),
      icon: Eye,
      trend: '+12%',
      description: 'Times your jobs appeared in search',
    },
    {
      title: 'Search Clicks',
      value: metrics.clicks.toLocaleString(),
      icon: MousePointer,
      trend: '+8%',
      description: 'Clicks from search results',
    },
    {
      title: 'Average Position',
      value: metrics.averagePosition.toFixed(1),
      icon: Search,
      trend: '-2.1',
      description: 'Average ranking position',
    },
    {
      title: 'Click-Through Rate',
      value: `${(metrics.ctr * 100).toFixed(1)}%`,
      icon: TrendingUp,
      trend: '+0.3%',
      description: 'Percentage of impressions that clicked',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {metricCards.map((metric, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {metric.title}
            </CardTitle>
            <metric.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metric.value}</div>
            <p className="text-xs text-muted-foreground">
              <span className={metric.trend.startsWith('+') ? 'text-green-600' : 'text-red-600'}>
                {metric.trend}
              </span>
              {' '}from last month
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {metric.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
```

## Production Deployment Checklist

### 1. Pre-Deployment SEO Checklist
- [ ] All meta tags implemented and tested
- [ ] Structured data validated with Google tools
- [ ] Sitemap generated and accessible
- [ ] Robots.txt configured correctly
- [ ] Google Analytics and Search Console set up
- [ ] Core Web Vitals passing thresholds
- [ ] All images optimized with next/image
- [ ] Critical CSS inlined
- [ ] Bundle size optimized

### 2. Performance Checklist
- [ ] Lighthouse Performance score > 90
- [ ] Lighthouse SEO score > 95
- [ ] Lighthouse Accessibility score > 90
- [ ] All routes have proper caching headers
- [ ] Database queries optimized
- [ ] Images compressed and properly sized
- [ ] Fonts optimized and preloaded

### 3. SEO Monitoring Setup
- [ ] Google Search Console verification
- [ ] Google Analytics tracking code
- [ ] Performance monitoring alerts
- [ ] Broken link monitoring
- [ ] SERP position tracking
- [ ] Competitor monitoring setup

## Long-term SEO Strategy

### 1. Content Calendar
- Weekly job market insights blog posts
- Monthly Colorado employment reports  
- Seasonal job trend analysis
- Company spotlight features
- Career advice and skill development content

### 2. Link Building Strategy
- Partner with Colorado trade schools
- Guest posting on industry blogs
- Local business directory submissions
- Industry association partnerships
- Press releases for major company partnerships

### 3. Technical SEO Roadmap
- Implement faceted search optimization
- Add geographic microdata
- Create job alert landing pages
- Build industry-specific landing pages
- Implement job application tracking events

### 4. Mobile-First Optimization
- Accelerated Mobile Pages (AMP) for job listings
- Progressive Web App enhancements
- Voice search optimization
- Mobile-specific call-to-action buttons
- Touch-friendly interface improvements

## Next Steps

This completes the comprehensive documentation for the Colorado Job Board project. The application now has:

✅ **Complete Core Features** (DOC-001 to DOC-010)
✅ **Advanced Applications System** (DOC-011)
✅ **Full Dashboard Suite** (DOC-012 to DOC-016)
✅ **Map Integration** (DOC-017)
✅ **Email Notifications** (DOC-018)
✅ **PWA Capabilities** (DOC-019)
✅ **SEO & Performance Optimization** (DOC-020)

### Implementation Priority
1. **Phase 1**: Complete any remaining basic features (DOC-011 to DOC-017)
2. **Phase 2**: Implement email system and PWA features (DOC-018 to DOC-019)
3. **Phase 3**: Add SEO optimization and performance monitoring (DOC-020)

### Maintenance and Growth
- Regular performance monitoring and optimization
- SEO content creation and link building
- User feedback collection and feature improvements
- Analytics review and conversion optimization
- Security updates and dependency management

## Notes for Claude Code

When implementing SEO and performance optimizations:

1. **Incremental Implementation**: Start with basic meta tags and structured data
2. **Measure Everything**: Set up monitoring before making changes
3. **Mobile First**: Always test mobile performance first
4. **Content Quality**: Focus on valuable, unique content for users
5. **Technical Excellence**: Ensure all technical SEO basics are perfect
6. **User Experience**: SEO should enhance, not hinder, user experience
7. **Regular Audits**: Schedule monthly SEO and performance reviews
8. **Competitor Analysis**: Monitor competitors' SEO strategies
9. **Local Focus**: Emphasize Colorado-specific optimization
10. **Conversion Tracking**: Track job applications as primary conversion goal

The documentation is now complete and ready for full implementation!