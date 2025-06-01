# DOC-018: Email Notifications System

## Overview

This document implements a comprehensive email notification system for the Colorado Job Board using Resend (free tier - 100 emails/day). The system includes application confirmations, job alerts, status updates, and employer notifications while staying within free tier limits.

## Prerequisites

- **DOC-003**: Environment configuration with Resend API key
- **DOC-004**: Authentication system working
- **DOC-011**: Application system implemented
- **DOC-013**: Job management system working

## Email System Architecture

### Email Types Supported
1. **Application Confirmations** - Instant when user applies
2. **Job Alerts** - Daily digest for saved searches
3. **Status Updates** - When application status changes
4. **New Job Notifications** - For companies user follows
5. **Employer Notifications** - New applications received

### Rate Limiting Strategy
- **Priority Queue**: Critical emails first (confirmations, status changes)
- **Batching**: Job alerts sent in daily batches
- **Throttling**: Maximum 90 emails/day (leaving buffer for free tier)

## Steps

### 1. Email Configuration Setup

#### Email Environment Variables
```typescript
// lib/env.ts - Add to existing environment validation
export const emailConfig = {
  apiKey: process.env.RESEND_API_KEY!,
  fromEmail: process.env.EMAIL_FROM || 'noreply@coloradotradesjobs.com',
  fromName: 'Colorado Trades Jobs',
  maxDailyEmails: 90, // Buffer for 100/day limit
  batchSize: 10, // Process emails in batches
};

// Validate email environment
if (!process.env.RESEND_API_KEY) {
  throw new Error('RESEND_API_KEY is required');
}
```

#### Email Client Setup
```typescript
// lib/email/client.ts
import { Resend } from 'resend';
import { emailConfig } from '@/lib/env';

export const resend = new Resend(emailConfig.apiKey);

export interface EmailData {
  to: string;
  subject: string;
  react: React.ReactElement;
  text?: string;
}

export async function sendEmail(data: EmailData) {
  try {
    const result = await resend.emails.send({
      from: `${emailConfig.fromName} <${emailConfig.fromEmail}>`,
      to: data.to,
      subject: data.subject,
      react: data.react,
      text: data.text,
    });
    
    return { success: true, id: result.data?.id };
  } catch (error) {
    console.error('Email send error:', error);
    return { success: false, error: error.message };
  }
}
```

### 2. Email Queue System

#### Queue Implementation
```typescript
// lib/email/queue.ts
import { client } from '@/lib/sanity';

export interface QueuedEmail {
  _type: 'emailQueue';
  to: string;
  subject: string;
  template: string;
  data: Record<string, any>;
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'sent' | 'failed';
  scheduledFor?: string;
  attempts: number;
  createdAt: string;
}

export async function queueEmail(
  to: string,
  subject: string,
  template: string,
  data: Record<string, any>,
  priority: 'high' | 'medium' | 'low' = 'medium',
  scheduledFor?: Date
) {
  try {
    const emailDoc: Omit<QueuedEmail, '_type'> = {
      to,
      subject,
      template,
      data,
      priority,
      status: 'pending',
      scheduledFor: scheduledFor?.toISOString(),
      attempts: 0,
      createdAt: new Date().toISOString(),
    };

    const result = await client.create({
      _type: 'emailQueue',
      ...emailDoc,
    });

    return { success: true, id: result._id };
  } catch (error) {
    console.error('Error queueing email:', error);
    return { success: false, error: error.message };
  }
}

export async function processEmailQueue() {
  try {
    // Get pending emails ordered by priority and creation time
    const pendingEmails = await client.fetch(`
      *[_type == "emailQueue" && status == "pending" && 
        (scheduledFor == null || scheduledFor <= now())] 
      | order(priority == "high" desc, priority == "medium" desc, createdAt asc) [0...${emailConfig.batchSize}]
    `);

    const results = [];

    for (const email of pendingEmails) {
      try {
        const emailComponent = await renderEmailTemplate(email.template, email.data);
        
        const result = await sendEmail({
          to: email.to,
          subject: email.subject,
          react: emailComponent,
        });

        // Update email status
        await client.patch(email._id).set({
          status: result.success ? 'sent' : 'failed',
          attempts: email.attempts + 1,
          sentAt: result.success ? new Date().toISOString() : undefined,
        }).commit();

        results.push({ id: email._id, success: result.success });
      } catch (error) {
        console.error(`Failed to send email ${email._id}:`, error);
        
        // Update failed attempt
        await client.patch(email._id).set({
          status: email.attempts >= 2 ? 'failed' : 'pending',
          attempts: email.attempts + 1,
        }).commit();
      }
    }

    return results;
  } catch (error) {
    console.error('Error processing email queue:', error);
    return [];
  }
}
```

### 3. Email Templates

#### Base Layout Template
```typescript
// components/emails/BaseLayout.tsx
import { Html, Head, Body, Container, Text, Link } from '@react-email/components';

interface BaseLayoutProps {
  children: React.ReactNode;
  previewText?: string;
}

export function BaseLayout({ children, previewText }: BaseLayoutProps) {
  return (
    <Html>
      <Head>
        <title>Colorado Trades Jobs</title>
      </Head>
      <Body style={bodyStyle}>
        {previewText && (
          <Text style={{ display: 'none', fontSize: '1px', color: '#fff' }}>
            {previewText}
          </Text>
        )}
        <Container style={containerStyle}>
          {/* Header */}
          <div style={headerStyle}>
            <Text style={logoStyle}>Colorado Trades Jobs</Text>
            <Text style={taglineStyle}>Connecting Colorado Workers with Great Jobs</Text>
          </div>
          
          {/* Content */}
          <div style={contentStyle}>
            {children}
          </div>
          
          {/* Footer */}
          <div style={footerStyle}>
            <Text style={footerTextStyle}>
              © 2024 Colorado Trades Jobs. All rights reserved.
            </Text>
            <Text style={footerTextStyle}>
              <Link href="{{unsubscribeUrl}}" style={linkStyle}>
                Unsubscribe
              </Link>
              {' | '}
              <Link href="https://coloradotradesjobs.com" style={linkStyle}>
                Visit Website
              </Link>
            </Text>
          </div>
        </Container>
      </Body>
    </Html>
  );
}

// Styles
const bodyStyle = {
  backgroundColor: '#f6f6f6',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  margin: 0,
  padding: 0,
};

const containerStyle = {
  backgroundColor: '#ffffff',
  maxWidth: '600px',
  margin: '0 auto',
  borderRadius: '8px',
  overflow: 'hidden',
};

const headerStyle = {
  backgroundColor: '#1e40af',
  color: '#ffffff',
  padding: '24px',
  textAlign: 'center' as const,
};

const logoStyle = {
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '0 0 8px 0',
};

const taglineStyle = {
  fontSize: '14px',
  margin: 0,
  opacity: 0.9,
};

const contentStyle = {
  padding: '32px 24px',
};

const footerStyle = {
  backgroundColor: '#f8f9fa',
  padding: '24px',
  textAlign: 'center' as const,
  borderTop: '1px solid #e5e7eb',
};

const footerTextStyle = {
  fontSize: '12px',
  color: '#6b7280',
  margin: '4px 0',
};

const linkStyle = {
  color: '#1e40af',
  textDecoration: 'none',
};
```

#### Application Confirmation Email
```typescript
// components/emails/ApplicationConfirmation.tsx
import { BaseLayout } from './BaseLayout';
import { Text, Button, Section, Hr } from '@react-email/components';

interface ApplicationConfirmationProps {
  applicantName: string;
  jobTitle: string;
  companyName: string;
  jobUrl: string;
  applicationId: string;
}

export function ApplicationConfirmation({
  applicantName,
  jobTitle,
  companyName,
  jobUrl,
  applicationId,
}: ApplicationConfirmationProps) {
  return (
    <BaseLayout previewText={`Your application for ${jobTitle} at ${companyName} has been received`}>
      <Text style={headingStyle}>Application Received!</Text>
      
      <Text style={textStyle}>
        Hi {applicantName},
      </Text>
      
      <Text style={textStyle}>
        Thank you for applying for the <strong>{jobTitle}</strong> position at <strong>{companyName}</strong>. 
        We've successfully received your application and it's now being reviewed.
      </Text>

      <Section style={boxStyle}>
        <Text style={boxTitleStyle}>Application Details</Text>
        <Text style={boxTextStyle}><strong>Job:</strong> {jobTitle}</Text>
        <Text style={boxTextStyle}><strong>Company:</strong> {companyName}</Text>
        <Text style={boxTextStyle}><strong>Application ID:</strong> {applicationId}</Text>
        <Text style={boxTextStyle}><strong>Status:</strong> Under Review</Text>
      </Section>

      <Section style={{ textAlign: 'center', margin: '32px 0' }}>
        <Button style={buttonStyle} href={jobUrl}>
          View Job Posting
        </Button>
      </Section>

      <Hr style={hrStyle} />

      <Text style={textStyle}>
        <strong>What happens next?</strong>
      </Text>
      
      <Text style={textStyle}>
        The employer will review your application and contact you directly if they'd like to move forward. 
        This typically happens within 1-2 weeks. You can track your application status in your dashboard.
      </Text>

      <Text style={textStyle}>
        Good luck with your application!
      </Text>
    </BaseLayout>
  );
}

// Email styles
const headingStyle = {
  fontSize: '24px',
  fontWeight: 'bold',
  color: '#1f2937',
  margin: '0 0 16px 0',
};

const textStyle = {
  fontSize: '16px',
  lineHeight: '24px',
  color: '#374151',
  margin: '0 0 16px 0',
};

const boxStyle = {
  backgroundColor: '#f8f9fa',
  border: '1px solid #e5e7eb',
  borderRadius: '8px',
  padding: '20px',
  margin: '24px 0',
};

const boxTitleStyle = {
  fontSize: '18px',
  fontWeight: 'bold',
  color: '#1f2937',
  margin: '0 0 12px 0',
};

const boxTextStyle = {
  fontSize: '14px',
  color: '#374151',
  margin: '4px 0',
};

const buttonStyle = {
  backgroundColor: '#1e40af',
  color: '#ffffff',
  padding: '12px 24px',
  textDecoration: 'none',
  borderRadius: '6px',
  fontWeight: 'bold',
  display: 'inline-block',
};

const hrStyle = {
  border: 'none',
  borderTop: '1px solid #e5e7eb',
  margin: '32px 0',
};
```

#### Job Alert Email
```typescript
// components/emails/JobAlert.tsx
import { BaseLayout } from './BaseLayout';
import { Text, Section, Button, Hr } from '@react-email/components';

interface JobAlertJob {
  title: string;
  company: string;
  location: string;
  salary?: string;
  url: string;
  postedDate: string;
}

interface JobAlertProps {
  recipientName: string;
  searchName: string;
  jobs: JobAlertJob[];
  searchUrl: string;
  unsubscribeUrl: string;
}

export function JobAlert({
  recipientName,
  searchName,
  jobs,
  searchUrl,
  unsubscribeUrl,
}: JobAlertProps) {
  return (
    <BaseLayout previewText={`${jobs.length} new jobs match your "${searchName}" search`}>
      <Text style={headingStyle}>New Jobs Match Your Search!</Text>
      
      <Text style={textStyle}>
        Hi {recipientName},
      </Text>
      
      <Text style={textStyle}>
        We found <strong>{jobs.length} new job{jobs.length !== 1 ? 's' : ''}</strong> that match 
        your saved search "<strong>{searchName}</strong>".
      </Text>

      {jobs.map((job, index) => (
        <Section key={index} style={jobCardStyle}>
          <Text style={jobTitleStyle}>{job.title}</Text>
          <Text style={jobMetaStyle}>
            <strong>{job.company}</strong> • {job.location}
            {job.salary && ` • ${job.salary}`}
          </Text>
          <Text style={jobDateStyle}>Posted {job.postedDate}</Text>
          <Button style={jobButtonStyle} href={job.url}>
            View Job
          </Button>
        </Section>
      ))}

      <Hr style={hrStyle} />

      <Section style={{ textAlign: 'center', margin: '32px 0' }}>
        <Button style={primaryButtonStyle} href={searchUrl}>
          View All Results
        </Button>
      </Section>

      <Text style={smallTextStyle}>
        This email was sent because you have a job alert set up for "{searchName}". 
        You can <a href={unsubscribeUrl} style={linkStyle}>unsubscribe</a> or 
        manage your alerts in your dashboard.
      </Text>
    </BaseLayout>
  );
}

const headingStyle = {
  fontSize: '24px',
  fontWeight: 'bold',
  color: '#1f2937',
  margin: '0 0 16px 0',
};

const textStyle = {
  fontSize: '16px',
  lineHeight: '24px',
  color: '#374151',
  margin: '0 0 16px 0',
};

const jobCardStyle = {
  border: '1px solid #e5e7eb',
  borderRadius: '8px',
  padding: '20px',
  margin: '16px 0',
  backgroundColor: '#ffffff',
};

const jobTitleStyle = {
  fontSize: '18px',
  fontWeight: 'bold',
  color: '#1e40af',
  margin: '0 0 8px 0',
};

const jobMetaStyle = {
  fontSize: '14px',
  color: '#6b7280',
  margin: '0 0 4px 0',
};

const jobDateStyle = {
  fontSize: '12px',
  color: '#9ca3af',
  margin: '0 0 16px 0',
};

const jobButtonStyle = {
  backgroundColor: '#ffffff',
  color: '#1e40af',
  border: '1px solid #1e40af',
  padding: '8px 16px',
  textDecoration: 'none',
  borderRadius: '4px',
  fontSize: '14px',
  display: 'inline-block',
};

const primaryButtonStyle = {
  backgroundColor: '#1e40af',
  color: '#ffffff',
  padding: '12px 24px',
  textDecoration: 'none',
  borderRadius: '6px',
  fontWeight: 'bold',
  display: 'inline-block',
};

const hrStyle = {
  border: 'none',
  borderTop: '1px solid #e5e7eb',
  margin: '32px 0',
};

const smallTextStyle = {
  fontSize: '12px',
  color: '#6b7280',
  lineHeight: '18px',
};

const linkStyle = {
  color: '#1e40af',
  textDecoration: 'none',
};
```

#### Status Update Email
```typescript
// components/emails/StatusUpdate.tsx
import { BaseLayout } from './BaseLayout';
import { Text, Button, Section, Hr } from '@react-email/components';

interface StatusUpdateProps {
  applicantName: string;
  jobTitle: string;
  companyName: string;
  oldStatus: string;
  newStatus: string;
  message?: string;
  jobUrl: string;
  dashboardUrl: string;
}

export function StatusUpdate({
  applicantName,
  jobTitle,
  companyName,
  oldStatus,
  newStatus,
  message,
  jobUrl,
  dashboardUrl,
}: StatusUpdateProps) {
  const statusMessages = {
    reviewed: 'Your application is being reviewed by the hiring team.',
    interviewing: 'Congratulations! You\'ve been selected for an interview.',
    hired: 'Congratulations! You\'ve been selected for this position.',
    rejected: 'While you weren\'t selected for this role, we encourage you to apply for other positions.',
  };

  const statusColors = {
    reviewed: '#f59e0b',
    interviewing: '#3b82f6',
    hired: '#10b981',
    rejected: '#ef4444',
  };

  return (
    <BaseLayout previewText={`Application status update for ${jobTitle} at ${companyName}`}>
      <Text style={headingStyle}>Application Status Update</Text>
      
      <Text style={textStyle}>
        Hi {applicantName},
      </Text>
      
      <Text style={textStyle}>
        There's an update on your application for <strong>{jobTitle}</strong> at <strong>{companyName}</strong>.
      </Text>

      <Section style={statusBoxStyle}>
        <Text style={statusTitleStyle}>Status Changed</Text>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span style={{ ...statusBadgeStyle, backgroundColor: '#e5e7eb' }}>
            {oldStatus.charAt(0).toUpperCase() + oldStatus.slice(1)}
          </span>
          <span style={{ fontSize: '20px', color: '#6b7280' }}>→</span>
          <span style={{ 
            ...statusBadgeStyle, 
            backgroundColor: statusColors[newStatus] || '#6b7280',
            color: '#ffffff'
          }}>
            {newStatus.charAt(0).toUpperCase() + newStatus.slice(1)}
          </span>
        </div>
      </Section>

      <Text style={textStyle}>
        {statusMessages[newStatus] || 'Your application status has been updated.'}
      </Text>

      {message && (
        <Section style={messageBoxStyle}>
          <Text style={messageHeaderStyle}>Message from {companyName}:</Text>
          <Text style={messageTextStyle}>{message}</Text>
        </Section>
      )}

      <Section style={{ textAlign: 'center', margin: '32px 0' }}>
        <Button style={buttonStyle} href={dashboardUrl}>
          View Application
        </Button>
        <Text style={{ margin: '16px 0' }}>or</Text>
        <Button style={secondaryButtonStyle} href={jobUrl}>
          View Job Posting
        </Button>
      </Section>

      <Hr style={hrStyle} />

      <Text style={textStyle}>
        Keep applying to more positions to increase your chances of finding the perfect job!
      </Text>
    </BaseLayout>
  );
}

const headingStyle = {
  fontSize: '24px',
  fontWeight: 'bold',
  color: '#1f2937',
  margin: '0 0 16px 0',
};

const textStyle = {
  fontSize: '16px',
  lineHeight: '24px',
  color: '#374151',
  margin: '0 0 16px 0',
};

const statusBoxStyle = {
  backgroundColor: '#f8f9fa',
  border: '1px solid #e5e7eb',
  borderRadius: '8px',
  padding: '20px',
  margin: '24px 0',
  textAlign: 'center' as const,
};

const statusTitleStyle = {
  fontSize: '16px',
  fontWeight: 'bold',
  color: '#1f2937',
  margin: '0 0 16px 0',
};

const statusBadgeStyle = {
  padding: '8px 16px',
  borderRadius: '20px',
  fontSize: '14px',
  fontWeight: 'bold',
  display: 'inline-block',
};

const messageBoxStyle = {
  backgroundColor: '#eff6ff',
  border: '1px solid #bfdbfe',
  borderRadius: '8px',
  padding: '20px',
  margin: '24px 0',
};

const messageHeaderStyle = {
  fontSize: '14px',
  fontWeight: 'bold',
  color: '#1e40af',
  margin: '0 0 8px 0',
};

const messageTextStyle = {
  fontSize: '14px',
  color: '#374151',
  margin: 0,
  fontStyle: 'italic',
};

const buttonStyle = {
  backgroundColor: '#1e40af',
  color: '#ffffff',
  padding: '12px 24px',
  textDecoration: 'none',
  borderRadius: '6px',
  fontWeight: 'bold',
  display: 'inline-block',
  margin: '0 8px',
};

const secondaryButtonStyle = {
  backgroundColor: '#ffffff',
  color: '#1e40af',
  border: '1px solid #1e40af',
  padding: '12px 24px',
  textDecoration: 'none',
  borderRadius: '6px',
  fontWeight: 'bold',
  display: 'inline-block',
  margin: '0 8px',
};

const hrStyle = {
  border: 'none',
  borderTop: '1px solid #e5e7eb',
  margin: '32px 0',
};
```

### 4. Email Service Functions

#### Template Renderer
```typescript
// lib/email/templates.ts
import { ApplicationConfirmation } from '@/components/emails/ApplicationConfirmation';
import { JobAlert } from '@/components/emails/JobAlert';
import { StatusUpdate } from '@/components/emails/StatusUpdate';

export async function renderEmailTemplate(template: string, data: any) {
  switch (template) {
    case 'application-confirmation':
      return ApplicationConfirmation(data);
    
    case 'job-alert':
      return JobAlert(data);
    
    case 'status-update':
      return StatusUpdate(data);
    
    default:
      throw new Error(`Unknown email template: ${template}`);
  }
}

// Email service functions
export async function sendApplicationConfirmation(
  applicantEmail: string,
  applicantName: string,
  jobTitle: string,
  companyName: string,
  jobSlug: string,
  applicationId: string
) {
  const jobUrl = `${process.env.NEXTAUTH_URL}/jobs/${jobSlug}`;
  
  return queueEmail(
    applicantEmail,
    `Application Received: ${jobTitle} at ${companyName}`,
    'application-confirmation',
    {
      applicantName,
      jobTitle,
      companyName,
      jobUrl,
      applicationId,
    },
    'high' // High priority for confirmations
  );
}

export async function sendStatusUpdate(
  applicantEmail: string,
  applicantName: string,
  jobTitle: string,
  companyName: string,
  jobSlug: string,
  oldStatus: string,
  newStatus: string,
  message?: string
) {
  const jobUrl = `${process.env.NEXTAUTH_URL}/jobs/${jobSlug}`;
  const dashboardUrl = `${process.env.NEXTAUTH_URL}/dashboard/applications`;
  
  return queueEmail(
    applicantEmail,
    `Application Update: ${jobTitle} at ${companyName}`,
    'status-update',
    {
      applicantName,
      jobTitle,
      companyName,
      oldStatus,
      newStatus,
      message,
      jobUrl,
      dashboardUrl,
    },
    'high'
  );
}
```

### 5. Subscription Management

#### Subscription Schema (Add to Sanity)
```javascript
// schemas/documents/emailSubscription.ts
export default {
  name: 'emailSubscription',
  title: 'Email Subscription',
  type: 'document',
  fields: [
    {
      name: 'email',
      title: 'Email Address',
      type: 'string',
      validation: Rule => Rule.required().email(),
    },
    {
      name: 'userId',
      title: 'User ID',
      type: 'string',
    },
    {
      name: 'type',
      title: 'Subscription Type',
      type: 'string',
      options: {
        list: [
          { title: 'Job Alerts', value: 'job-alerts' },
          { title: 'Application Updates', value: 'application-updates' },
          { title: 'Company News', value: 'company-news' },
          { title: 'Weekly Digest', value: 'weekly-digest' },
        ],
      },
    },
    {
      name: 'active',
      title: 'Active',
      type: 'boolean',
      initialValue: true,
    },
    {
      name: 'unsubscribeToken',
      title: 'Unsubscribe Token',
      type: 'string',
    },
    {
      name: 'preferences',
      title: 'Preferences',
      type: 'object',
      fields: [
        { name: 'frequency', type: 'string', title: 'Frequency' },
        { name: 'keywords', type: 'array', of: [{ type: 'string' }], title: 'Keywords' },
        { name: 'locations', type: 'array', of: [{ type: 'string' }], title: 'Locations' },
        { name: 'salaryMin', type: 'number', title: 'Minimum Salary' },
      ],
    },
  ],
};
```

#### Subscription Management
```typescript
// lib/email/subscriptions.ts
import { client } from '@/lib/sanity';
import crypto from 'crypto';

export async function createSubscription(
  email: string,
  type: string,
  preferences: any = {},
  userId?: string
) {
  const unsubscribeToken = crypto.randomUUID();
  
  try {
    const subscription = await client.create({
      _type: 'emailSubscription',
      email,
      userId,
      type,
      active: true,
      unsubscribeToken,
      preferences,
      createdAt: new Date().toISOString(),
    });

    return { success: true, subscription };
  } catch (error) {
    console.error('Error creating subscription:', error);
    return { success: false, error: error.message };
  }
}

export async function unsubscribe(token: string) {
  try {
    const subscription = await client.fetch(
      `*[_type == "emailSubscription" && unsubscribeToken == $token][0]`,
      { token }
    );

    if (!subscription) {
      return { success: false, error: 'Invalid unsubscribe token' };
    }

    await client.patch(subscription._id).set({ active: false }).commit();
    
    return { success: true };
  } catch (error) {
    console.error('Error unsubscribing:', error);
    return { success: false, error: error.message };
  }
}

export async function getActiveSubscriptions(type?: string) {
  const typeFilter = type ? `&& type == "${type}"` : '';
  
  return client.fetch(`
    *[_type == "emailSubscription" && active == true ${typeFilter}] {
      _id,
      email,
      userId,
      type,
      preferences,
      unsubscribeToken
    }
  `);
}
```

### 6. Job Alert System

#### Daily Job Alert Processor
```typescript
// lib/email/job-alerts.ts
import { client } from '@/lib/sanity';
import { queueEmail } from './queue';

export async function processJobAlerts() {
  try {
    // Get all active job alert subscriptions
    const subscriptions = await getActiveSubscriptions('job-alerts');
    
    for (const subscription of subscriptions) {
      const jobs = await findMatchingJobs(subscription.preferences);
      
      if (jobs.length > 0) {
        const unsubscribeUrl = `${process.env.NEXTAUTH_URL}/unsubscribe?token=${subscription.unsubscribeToken}`;
        const searchUrl = buildSearchUrl(subscription.preferences);
        
        await queueEmail(
          subscription.email,
          `${jobs.length} New Jobs Match Your Alert`,
          'job-alert',
          {
            recipientName: subscription.email.split('@')[0], // Fallback name
            searchName: buildSearchName(subscription.preferences),
            jobs: jobs.map(job => ({
              title: job.title,
              company: job.company.name,
              location: `${job.location.city}, CO`,
              salary: job.salaryMin ? `$${job.salaryMin}/hr` : undefined,
              url: `${process.env.NEXTAUTH_URL}/jobs/${job.slug.current}`,
              postedDate: formatDate(job.publishedAt),
            })),
            searchUrl,
            unsubscribeUrl,
          },
          'medium',
          new Date() // Send immediately during processing
        );
      }
    }

    return { success: true, processed: subscriptions.length };
  } catch (error) {
    console.error('Error processing job alerts:', error);
    return { success: false, error: error.message };
  }
}

async function findMatchingJobs(preferences: any) {
  const {
    keywords = [],
    locations = [],
    salaryMin = 0,
  } = preferences;

  // Build dynamic query based on preferences
  let query = `*[_type == "jobPosting" && status == "published" && publishedAt >= $since]`;
  const params: any = {
    since: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // Last 24 hours
  };

  // Add keyword filters
  if (keywords.length > 0) {
    const keywordFilter = keywords.map((_, i) => `title match $keyword${i}`).join(' || ');
    query += ` && (${keywordFilter})`;
    keywords.forEach((keyword, i) => {
      params[`keyword${i}`] = `*${keyword}*`;
    });
  }

  // Add location filters
  if (locations.length > 0) {
    const locationFilter = locations.map((_, i) => `location.city == $location${i}`).join(' || ');
    query += ` && (${locationFilter})`;
    locations.forEach((location, i) => {
      params[`location${i}`] = location;
    });
  }

  // Add salary filter
  if (salaryMin > 0) {
    query += ` && salaryMin >= $salaryMin`;
    params.salaryMin = salaryMin;
  }

  query += ` {
    title,
    slug,
    "company": company->{name},
    location,
    salaryMin,
    publishedAt
  } | order(publishedAt desc) [0...10]`; // Limit to 10 jobs per alert

  return client.fetch(query, params);
}

function buildSearchName(preferences: any): string {
  const parts = [];
  
  if (preferences.keywords?.length > 0) {
    parts.push(preferences.keywords.join(', '));
  }
  
  if (preferences.locations?.length > 0) {
    parts.push(`in ${preferences.locations.join(', ')}`);
  }
  
  if (preferences.salaryMin > 0) {
    parts.push(`$${preferences.salaryMin}+ /hr`);
  }
  
  return parts.length > 0 ? parts.join(' ') : 'All Jobs';
}

function buildSearchUrl(preferences: any): string {
  const searchParams = new URLSearchParams();
  
  if (preferences.keywords?.length > 0) {
    searchParams.set('q', preferences.keywords.join(' '));
  }
  
  if (preferences.locations?.length > 0) {
    searchParams.set('location', preferences.locations[0]);
  }
  
  if (preferences.salaryMin > 0) {
    searchParams.set('salary', preferences.salaryMin.toString());
  }
  
  return `${process.env.NEXTAUTH_URL}/jobs?${searchParams.toString()}`;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
  
  if (diffInHours < 24) {
    return `${diffInHours} hours ago`;
  } else {
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} day${diffInDays !== 1 ? 's' : ''} ago`;
  }
}
```

### 7. API Routes

#### Email Queue Processor API
```typescript
// app/api/emails/process/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { processEmailQueue } from '@/lib/email/queue';
import { processJobAlerts } from '@/lib/email/job-alerts';

export async function POST(request: NextRequest) {
  try {
    // Verify this is called from a cron job or authenticated source
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Process regular email queue
    const queueResults = await processEmailQueue();
    
    // Process job alerts if it's the daily run
    const hour = new Date().getHours();
    let alertResults = null;
    
    if (hour === 9) { // Send job alerts at 9 AM
      alertResults = await processJobAlerts();
    }

    return NextResponse.json({
      success: true,
      queue: queueResults,
      alerts: alertResults,
    });
  } catch (error) {
    console.error('Error processing emails:', error);
    return NextResponse.json(
      { error: 'Failed to process emails' },
      { status: 500 }
    );
  }
}
```

#### Unsubscribe API
```typescript
// app/api/unsubscribe/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { unsubscribe } from '@/lib/email/subscriptions';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const token = searchParams.get('token');

  if (!token) {
    return NextResponse.redirect('/unsubscribe?error=invalid');
  }

  const result = await unsubscribe(token);

  if (result.success) {
    return NextResponse.redirect('/unsubscribe?success=true');
  } else {
    return NextResponse.redirect('/unsubscribe?error=invalid');
  }
}
```

### 8. Integration with Application System

#### Update Application Submission
```typescript
// In your existing application submission code
// app/api/applications/route.ts (add to existing POST handler)

import { sendApplicationConfirmation } from '@/lib/email/templates';

// Add after successful application creation
if (result.success) {
  // Send confirmation email
  await sendApplicationConfirmation(
    formData.email,
    formData.name,
    job.title,
    job.company.name,
    job.slug.current,
    application._id
  );
  
  return NextResponse.json({ success: true, application });
}
```

#### Update Status Change Handler
```typescript
// In your application status update code
// app/api/applications/[id]/status/route.ts

import { sendStatusUpdate } from '@/lib/email/templates';

// Add after successful status update
if (oldStatus !== newStatus) {
  await sendStatusUpdate(
    application.applicantInfo.email,
    application.applicantInfo.name,
    application.job.title,
    application.job.company.name,
    application.job.slug.current,
    oldStatus,
    newStatus,
    employerMessage
  );
}
```

### 9. Cron Job Setup (Vercel)

#### Vercel Cron Configuration
```json
// vercel.json
{
  "crons": [
    {
      "path": "/api/emails/process",
      "schedule": "0 */4 * * *"
    }
  ]
}
```

Add to your environment variables:
```env
CRON_SECRET=generate_random_secret_here
```

## Verification Steps

### 1. Test Email Templates
```bash
# Start development server
npm run dev

# Test application confirmation
curl -X POST http://localhost:3000/api/test-emails/confirmation \
  -H "Content-Type: application/json" \
  -d '{"type": "confirmation", "email": "test@example.com"}'
```

### 2. Test Queue System
1. **Submit Application**: Apply to a job
2. **Check Queue**: Verify email appears in Sanity
3. **Process Queue**: Run the email processor
4. **Verify Delivery**: Check email was sent and status updated

### 3. Test Job Alerts
1. **Create Subscription**: Set up job alert preferences
2. **Add Matching Job**: Create job that matches criteria
3. **Run Processor**: Execute job alert processor
4. **Verify Email**: Check alert email was queued

### 4. Test Unsubscribe
1. **Get Token**: Copy unsubscribe token from email
2. **Visit URL**: Go to unsubscribe URL
3. **Verify Status**: Check subscription is inactive in Sanity

## Common Issues & Solutions

### Issue: Emails Not Sending
**Solution:** 
- Check Resend API key is valid
- Verify daily email limit not exceeded
- Check email queue processing is running

### Issue: Job Alerts Not Working
**Solution:**
- Verify subscription preferences are saved correctly
- Check job query logic with test data
- Ensure cron job is configured on Vercel

### Issue: Unsubscribe Links Not Working
**Solution:**
- Check token generation is unique
- Verify unsubscribe API route is working
- Test with real unsubscribe token

### Issue: Email Templates Not Rendering
**Solution:**
- Install React Email dependencies: `npm install @react-email/components`
- Check template imports are correct
- Verify props match interface definitions

## Next Steps

Proceed to [DOC-019: PWA Setup](doc-019-pwa.md) to add Progressive Web App features including offline support and installability.

## Notes for Claude Code

When implementing email notifications:

1. **Start with Templates**: Implement email templates first to test rendering
2. **Queue System**: Set up queue before integrating with existing features
3. **Rate Limiting**: Always respect Resend's 100 emails/day limit
4. **Testing**: Use a test email address for development
5. **Gradual Rollout**: Start with confirmation emails, then add alerts
6. **Monitor Usage**: Track daily email count to stay within limits
7. **Error Handling**: Always handle email failures gracefully
8. **Unsubscribe**: Include unsubscribe links in all marketing emails