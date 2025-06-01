import { Job } from '@/types';

interface JobStructuredDataProps {
  job: Job;
}

export default function JobStructuredData({ job }: JobStructuredDataProps) {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'JobPosting',
    title: job.title,
    description: job.description?.[0]?.children?.[0]?.text || job.requirements || 'Job opening at ' + job.company.name,
    datePosted: job.publishedAt,
    validThrough: job.expiresAt || job.applicationDeadline,
    employmentType: job.jobType.toUpperCase().replace('-', '_'),
    hiringOrganization: {
      '@type': 'Organization',
      name: job.company.name,
      sameAs: job.company.website,
    },
    jobLocation: {
      '@type': 'Place',
      address: {
        '@type': 'PostalAddress',
        addressLocality: job.location.city,
        addressRegion: 'CO',
        addressCountry: 'US',
        postalCode: job.location.zipCode,
      },
    },
    baseSalary: job.showSalary && job.salaryMin ? {
      '@type': 'MonetaryAmount',
      currency: 'USD',
      value: {
        '@type': 'QuantitativeValue',
        minValue: job.salaryMin,
        maxValue: job.salaryMax || job.salaryMin,
        unitText: job.salaryType === 'hourly' ? 'HOUR' : 'YEAR',
      },
    } : undefined,
    workHours: job.jobType === 'full-time' ? '40 hours per week' : undefined,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}