# Claude Code Implementation Prompts

## How to Use This Document

This document provides copy-paste ready prompts for Claude Code to build your Colorado Job Board. Follow these in order for best results.

### Prompt Structure
Each prompt follows this format:
- **Context**: What should already be complete
- **Reference**: Which DOC to use
- **Prompt**: Exact text to paste into Claude Code

---

## Phase 1: Project Setup

### 1.1 Initial Project Setup

**Context**: Starting fresh  
**Reference**: DOC-001

**Prompt**:
```
Using DOC-001, set up the Colorado job board project with NextAdmin theme.
This is a fresh project start.
Key requirements: 
- Clone NextAdmin from GitHub
- Install all dependencies from section 2
- Create the complete directory structure from section 5
- Set up TypeScript configuration
- Create type definitions in types/index.ts
```

### 1.2 Sanity Schema Creation

**Context**: Project structure created  
**Reference**: DOC-002

**Prompt**:
```
Using DOC-002, create all Sanity schemas for the job board.
Current context: Next.js project is set up with NextAdmin.
Key requirements:
- Create a new Sanity studio project in a separate directory
- Implement all 6 schemas: blockContent, location, jobCategory, company, jobPosting, jobApplication
- Configure the Sanity studio with custom desk structure
- Include the preview configurations for each schema
```

### 1.3 Environment Configuration

**Context**: Sanity studio created  
**Reference**: DOC-003

**Prompt**:
```
Using DOC-003, set up environment configuration.
Current context: Next.js and Sanity projects created.
Key requirements:
- Create .env.local with all variables (use placeholders for actual values)
- Create env.d.ts for TypeScript support
- Create lib/env.ts for validation
- Ensure .env.local is in .gitignore
```

---

## Phase 2: Core Infrastructure

### 2.1 Authentication Implementation

**Context**: Environment configured  
**Reference**: DOC-004

**Prompt**:
```
Using DOC-004, implement NextAuth.js authentication.
Current context: Environment variables configured.
Key requirements:
- Set up NextAuth with Google provider
- Create auth API route in app/api/auth/[...nextauth]/route.ts
- Implement auth context provider
- Create useAuth hook
- Add sign-in and sign-up pages using NextAdmin components
```

### 2.2 Sanity Client Setup

**Context**: Authentication implemented  
**Reference**: DOC-005

**Prompt**:
```
Using DOC-005, create Sanity client and queries.
Current context: Auth is working.
Key requirements:
- Create lib/sanity.ts with client configuration
- Implement all GROQ queries for jobs, companies, applications
- Set up image URL builder
- Create data fetching utilities with proper typing
```

### 2.3 Layout Implementation

**Context**: Sanity client ready  
**Reference**: DOC-006

**Prompt**:
```
Using DOC-006, implement layout structure.
Current context: Auth and Sanity client configured.
Key requirements:
- Create public layout in app/(public)/layout.tsx
- Update dashboard layout using NextAdmin sidebar
- Implement mobile navigation
- Add header and footer components
- Configure navigation menu items
```

---

## Phase 3: Public Site Features

### 3.1 Job Listings Page

**Context**: Layouts complete  
**Reference**: DOC-007

**Prompt**:
```
Using DOC-007, create the job listings page.
Current context: Layouts and navigation working.
Key requirements:
- Implement app/(public)/jobs/page.tsx with server-side data fetching
- Create JobCard component using NextAdmin Card
- Add search bar with NextAdmin Input/Select components
- Implement responsive grid layout
- Add loading states
```

### 3.2 Job Detail Page

**Context**: Job listings working  
**Reference**: DOC-008

**Prompt**:
```
Using DOC-008, create job detail page.
Current context: Job listings page complete.
Key requirements:
- Create app/(public)/jobs/[slug]/page.tsx
- Implement static generation with generateStaticParams
- Add Apply button and application modal
- Show company info and job requirements
- Include similar jobs section
```

### 3.3 Search and Filters

**Context**: Basic job pages working  
**Reference**: DOC-009

**Prompt**:
```
Using DOC-009, implement search and filtering.
Current context: Job listing and detail pages complete.
Key requirements:
- Add Fuse.js for client-side search
- Create JobFilter component with category/location/salary filters
- Implement URL-based filter state
- Add filter persistence in localStorage
- Ensure mobile-responsive filters
```

### 3.4 Company Pages

**Context**: Job features complete  
**Reference**: DOC-010

**Prompt**:
```
Using DOC-010, create company pages.
Current context: All job pages working.
Key requirements:
- Create company listing page at app/(public)/companies/page.tsx
- Implement company detail page with job listings
- Add company verification badges
- Show company size and benefits
```

### 3.5 Application System

**Context**: Public browsing complete  
**Reference**: DOC-011

**Prompt**:
```
Using DOC-011, implement job application system.
Current context: All public viewing pages complete.
Key requirements:
- Create application form using NextAdmin form components
- Add resume upload to Sanity assets
- Implement application API route
- Send email notifications with Resend
- Add success/error states
```

---

## Phase 4: Dashboard Features

### 4.1 Dashboard Overview

**Context**: Public site complete  
**Reference**: DOC-012

**Prompt**:
```
Using DOC-012, create employer dashboard.
Current context: Public site and applications working.
Key requirements:
- Implement dashboard home with stats cards
- Use NextAdmin chart components for metrics
- Show recent applications
- Add quick action buttons
- Ensure proper authentication gates
```

### 4.2 Job Management

**Context**: Dashboard home complete  
**Reference**: DOC-013

**Prompt**:
```
Using DOC-013, create job management pages.
Current context: Dashboard overview working.
Key requirements:
- Create job listing table using NextAdmin DataTable
- Implement create/edit job forms
- Add job status management
- Include bulk actions
- Add job duplication feature
```

### 4.3 Application Management

**Context**: Job management complete  
**Reference**: DOC-014

**Prompt**:
```
Using DOC-014, build application management.
Current context: Employers can manage jobs.
Key requirements:
- Create applications table with filters
- Add application status workflow
- Implement applicant detail view
- Add notes and rating system
- Include email communication features
```

### 4.4 Analytics Dashboard

**Context**: Core dashboard complete  
**Reference**: DOC-015

**Prompt**:
```
Using DOC-015, implement analytics dashboard.
Current context: All CRUD operations working.
Key requirements:
- Use NextAdmin chart components
- Show views, applications, conversion rates
- Add date range filters
- Implement export functionality
- Create printable reports
```

### 4.5 Company Profile

**Context**: Dashboard features complete  
**Reference**: DOC-016

**Prompt**:
```
Using DOC-016, create company profile management.
Current context: Full dashboard functionality.
Key requirements:
- Create company profile edit form
- Add logo upload to Sanity
- Implement benefits management
- Add location management
- Include verification request feature
```

---

## Phase 5: Advanced Features

### 5.1 Map Integration

**Context**: All core features complete  
**Reference**: DOC-017

**Prompt**:
```
Using DOC-017, add map functionality.
Current context: Complete job board working.
Key requirements:
- Integrate Leaflet with OpenStreetMap
- Add job location markers
- Implement location-based search
- Create map view toggle
- Ensure mobile responsiveness
```

### 5.2 Email Notifications

**Context**: Maps integrated  
**Reference**: DOC-018

**Prompt**:
```
Using DOC-018, implement email notifications.
Current context: All features except emails working.
Key requirements:
- Set up Resend email templates
- Add application confirmation emails
- Implement job alert system
- Create email preferences
- Add unsubscribe functionality
```

### 5.3 PWA Setup

**Context**: Emails working  
**Reference**: DOC-019

**Prompt**:
```
Using DOC-019, configure Progressive Web App.
Current context: Full functionality complete.
Key requirements:
- Add PWA manifest
- Implement service worker
- Configure offline functionality
- Add install prompt
- Test on mobile devices
```

### 5.4 SEO and Performance

**Context**: PWA configured  
**Reference**: DOC-020

**Prompt**:
```
Using DOC-020, optimize SEO and performance.
Current context: All features implemented.
Key requirements:
- Add sitemap generation
- Implement structured data
- Optimize images with next/image
- Add meta tags
- Configure caching strategies
```

---

## Testing and Deployment

### Final Testing

**Prompt**:
```
Perform comprehensive testing of the Colorado job board.
Test all user flows:
- Job seeker: browse, search, filter, apply
- Employer: sign up, create company, post job, manage applications
- Admin: access Sanity studio, moderate content
Verify mobile responsiveness and error handling.
```

### Deployment Preparation

**Prompt**:
```
Prepare the Colorado job board for Vercel deployment.
Requirements:
- Add all environment variables to Vercel
- Configure build settings
- Set up domain
- Test production build locally
- Create deployment documentation
```

---

## Troubleshooting Prompts

### Fix TypeScript Errors

**Prompt**:
```
Fix TypeScript errors in the Colorado job board.
Run npm run type-check and resolve all errors.
Ensure all imports have proper types.
Add missing type definitions where needed.
```

### Fix Sanity Connection

**Prompt**:
```
Debug and fix Sanity connection issues.
Verify environment variables are loaded.
Test GROQ queries in Sanity Vision.
Check CORS settings in Sanity.
Ensure dataset name matches.
```

### Fix Authentication

**Prompt**:
```
Debug NextAuth authentication issues.
Check Google OAuth callback URLs.
Verify NEXTAUTH_SECRET is set.
Test session persistence.
Fix any redirect problems.
```

### Fix Build Errors

**Prompt**:
```
Resolve Next.js build errors for production.
Run npm run build and fix all errors.
Check for missing environment variables.
Resolve any dynamic import issues.
Fix server/client component mismatches.
```

---

## Enhancement Prompts

### Add Job Alerts

**Prompt**:
```
Add job alert feature to the Colorado job board.
Create alert preferences in user profile.
Implement daily/weekly email digests.
Add alert management dashboard.
Use Sanity to store alert preferences.
```

### Add Admin Dashboard

**Prompt**:
```
Create admin dashboard for content moderation.
Add admin role to authentication.
Create moderation queue for new companies.
Add ability to feature/unfeature jobs.
Implement user management.
```

### Add Mobile App

**Prompt**:
```
Create a React Native version of the job board.
Share types and API calls with Next.js.
Implement core features: browse, search, apply.
Add push notifications for new jobs.
Use same Sanity backend.
```

### Add Payment Integration

**Prompt**:
```
Add Stripe payment for premium job postings.
Implement pricing tiers.
Add payment form using Stripe Elements.
Create subscription management.
Track payment status in Sanity.
```

---

## Optimization Prompts

### Improve Performance

**Prompt**:
```
Optimize the Colorado job board performance.
Implement lazy loading for job cards.
Add pagination instead of infinite scroll.
Optimize bundle size with dynamic imports.
Implement Redis caching for popular queries.
```

### Improve SEO

**Prompt**:
```
Enhance SEO for the Colorado job board.
Add schema.org structured data for jobs.
Implement dynamic meta tags for all pages.
Create XML sitemap with job listings.
Add canonical URLs.
Optimize for "jobs in [city]" searches.
```

### Improve Accessibility

**Prompt**:
```
Improve accessibility of the job board.
Add proper ARIA labels to all interactive elements.
Ensure keyboard navigation works throughout.
Test with screen readers.
Add skip navigation links.
Ensure color contrast meets WCAG standards.
```

---

## Data Management Prompts

### Import Job Data

**Prompt**:
```
Create job data import functionality.
Add CSV upload for bulk job creation.
Map CSV fields to Sanity schema.
Validate data before import.
Show import progress and errors.
```

### Export Analytics

**Prompt**:
```
Add analytics export functionality.
Create PDF reports for job performance.
Add CSV export for applications.
Include charts in exports.
Schedule automated reports.
```

### Backup Data

**Prompt**:
```
Implement data backup strategy.
Create Sanity export scripts.
Back up user-generated content.
Document restore procedures.
Automate daily backups.
```

---

## Maintenance Prompts

### Update Dependencies

**Prompt**:
```
Update all dependencies to latest versions.
Run npm update and test thoroughly.
Fix any breaking changes.
Update deprecated API usage.
Test all features after update.
```

### Monitor Errors

**Prompt**:
```
Implement error monitoring.
Add Sentry error tracking.
Create error boundary components.
Log errors to Sanity.
Set up error alerts.
```

### Clean Up Code

**Prompt**:
```
Refactor and clean up the codebase.
Remove unused components and imports.
Consolidate duplicate code.
Improve component organization.
Add missing JSDoc comments.
```

---

## Quick Fix Prompts

### Fix Mobile Menu

**Prompt**:
```
Fix mobile navigation menu not working.
Check Sheet component implementation.
Verify menu state management.
Test on actual mobile devices.
Fix any z-index issues.
```

### Fix Form Validation

**Prompt**:
```
Fix form validation in job posting form.
Ensure all Zod schemas match form fields.
Add proper error messages.
Test all validation rules.
Fix submit button states.
```

### Fix Image Uploads

**Prompt**:
```
Fix image upload to Sanity.
Check file size limits.
Implement image compression.
Add upload progress indicator.
Handle upload errors gracefully.
```

### Fix Search Results

**Prompt**:
```
Fix search functionality returning no results.
Debug Fuse.js configuration.
Check search index fields.
Test with various search terms.
Add search suggestions.
```

---

## Custom Feature Prompts

### Add Favorite Jobs

**Prompt**:
```
Add favorite jobs feature.
Store favorites in localStorage.
Add heart icon to job cards.
Create favorites page.
Sync with user account if logged in.
```

### Add Job Comparison

**Prompt**:
```
Add job comparison feature.
Allow selecting up to 3 jobs.
Create comparison table.
Highlight differences.
Add to mobile experience.
```

### Add Application Tracking

**Prompt**:
```
Add application tracking for job seekers.
Create applied jobs list.
Show application status.
Add interview scheduling.
Send reminder notifications.
```

### Add Referral System

**Prompt**:
```
Implement employee referral system.
Add referral code to job applications.
Track referral sources.
Create referral dashboard.
Add referral rewards tracking.
```

---

## Best Practices Reminder

When using these prompts:

1. **Always provide context** - Tell Claude Code what's already built
2. **Reference the DOC** - Point to specific documentation
3. **Be specific** - Include key requirements from the docs
4. **Test incrementally** - Verify each feature before moving on
5. **Save progress** - Commit working code frequently

Remember: Each prompt builds on previous work. Following the order ensures smooth development.