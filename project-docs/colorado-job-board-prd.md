# Product Requirements Document (PRD)
## Colorado Blue-Collar Job Board

### 1. Executive Summary

**Product Name:** ColoradoTradesJobs (working title)

**Vision:** Create the premier online destination for blue-collar workers in Colorado to find employment opportunities and for employers to connect with skilled trade professionals.

**Mission:** Simplify the job search process for Colorado's blue-collar workforce while helping employers fill critical positions in construction, manufacturing, transportation, and other skilled trades.

### 2. Product Overview

#### 2.1 Problem Statement
- Blue-collar workers often rely on word-of-mouth or generic job boards not tailored to their needs
- Employers struggle to reach qualified trade workers through traditional recruitment channels
- Lack of Colorado-specific platforms for skilled trade employment

#### 2.2 Target Users
**Job Seekers:**
- Construction workers (carpenters, electricians, plumbers, HVAC technicians)
- Manufacturing and warehouse workers
- Transportation professionals (truck drivers, equipment operators)
- Maintenance and repair technicians
- Age range: 18-65
- Tech comfort level: Basic to intermediate

**Employers:**
- Construction companies
- Manufacturing facilities
- Transportation and logistics companies
- Property management firms
- Government contractors
- Size: Small local businesses to large corporations

### 3. Core Features

#### 3.1 Job Seeker Features
- **Job Search & Filtering**
  - Search by keyword, location (city/county), job type
  - Filter by salary range, experience level, schedule type
  - Save searches and set up email alerts
  - Map view of job locations

- **Profile Management**
  - Simple profile creation (no complex resumes required)
  - Skills checklist for trades
  - Certifications and licenses section
  - Work availability preferences

- **Application Process**
  - One-click apply with saved profile
  - Track application status
  - Direct messaging with employers
  - Mobile-optimized application flow

#### 3.2 Employer Features
- **Job Posting Management**
  - Easy job posting form with templates
  - Bulk posting options
  - Post expiration and renewal
  - Urgency indicators (e.g., "Hiring Immediately")

- **Candidate Management**
  - Application inbox with filtering
  - Candidate status tracking
  - Direct messaging system
  - Basic analytics (views, applications)

- **Company Profiles**
  - Company description and culture
  - Benefits highlights
  - Photo galleries of work environments
  - Employee testimonials

#### 3.3 Administrative Features
- **Content Moderation**
  - Review and approve job postings
  - Flag inappropriate content
  - User report management

- **Analytics Dashboard**
  - Site traffic and usage metrics
  - Popular job categories
  - Geographic heat maps
  - Employer/job seeker ratio tracking

### 4. Technical Requirements (Cost-Optimized)

#### 4.1 Frontend (Next.js)
- **Framework:** Next.js 14+ with App Router
- **Styling:** Tailwind CSS (free)
- **State Management:** Zustand (free, lightweight)
- **Forms:** React Hook Form with Zod validation (free)
- **Maps:** Leaflet with OpenStreetMap (free)
- **Analytics:** Plausible Analytics Community Edition (self-hosted, free) or Google Analytics 4 (free)
- **Search:** Fuse.js for client-side search (free)

#### 4.2 Backend (Sanity)
- **Plan:** Sanity Free Tier (includes):
  - 100k API requests/month
  - 1GB assets
  - 10GB bandwidth
  - 3 users
  - Unlimited documents
- **Authentication:** NextAuth.js with free providers (Google, GitHub)
- **Email:** Resend (free tier: 100 emails/day) or SMTP with Gmail
- **File Storage:** Sanity's built-in asset management (included in free tier)

#### 4.3 Infrastructure (Free/Low-Cost)
- **Hosting:** 
  - Frontend: Vercel Free Tier (unlimited sites, 100GB bandwidth)
  - Database: Sanity Hosted (included)
- **Domain:** Namecheap (~$10/year)
- **SSL:** Included with Vercel
- **Monitoring:** Vercel Analytics (free tier)

### 5. Content Models (Sanity Schemas)

#### 5.1 Job Posting Schema
```javascript
{
  name: 'jobPosting',
  type: 'document',
  fields: [
    { name: 'title', type: 'string', validation: required },
    { name: 'slug', type: 'slug', source: 'title' },
    { name: 'company', type: 'reference', to: [{type: 'company'}] },
    { name: 'description', type: 'blockContent' },
    { name: 'requirements', type: 'text' },
    { name: 'salaryType', type: 'string', options: ['hourly', 'salary', 'contract'] },
    { name: 'salaryMin', type: 'number' },
    { name: 'salaryMax', type: 'number' },
    { name: 'location', type: 'object', fields: [
      { name: 'city', type: 'string' },
      { name: 'county', type: 'string' },
      { name: 'zipCode', type: 'string' },
      { name: 'coordinates', type: 'geopoint' }
    ]},
    { name: 'jobType', type: 'string', options: ['full-time', 'part-time', 'contract', 'temporary'] },
    { name: 'category', type: 'reference', to: [{type: 'jobCategory'}] },
    { name: 'experienceLevel', type: 'string', options: ['entry', 'intermediate', 'experienced'] },
    { name: 'benefits', type: 'array', of: [{type: 'string'}] },
    { name: 'applicationDeadline', type: 'date' },
    { name: 'isUrgent', type: 'boolean' },
    { name: 'status', type: 'string', options: ['draft', 'published', 'expired', 'filled'] },
    { name: 'featured', type: 'boolean' },
    { name: 'publishedAt', type: 'datetime' }
  ]
}
```

#### 5.2 Company Schema
```javascript
{
  name: 'company',
  type: 'document',
  fields: [
    { name: 'name', type: 'string', validation: required },
    { name: 'slug', type: 'slug', source: 'name' },
    { name: 'logo', type: 'image' },
    { name: 'description', type: 'blockContent' },
    { name: 'website', type: 'url' },
    { name: 'size', type: 'string', options: ['1-10', '11-50', '51-200', '200+'] },
    { name: 'locations', type: 'array', of: [{type: 'object', fields: [...]}] },
    { name: 'benefitsOffered', type: 'array', of: [{type: 'string'}] },
    { name: 'verified', type: 'boolean' },
    { name: 'ownerId', type: 'string' } // Links to NextAuth user
  ]
}
```

#### 5.3 Job Application Schema
```javascript
{
  name: 'jobApplication',
  type: 'document',
  fields: [
    { name: 'job', type: 'reference', to: [{type: 'jobPosting'}] },
    { name: 'applicantInfo', type: 'object', fields: [
      { name: 'name', type: 'string' },
      { name: 'email', type: 'string' },
      { name: 'phone', type: 'string' },
      { name: 'resumeUrl', type: 'string' }
    ]},
    { name: 'coverMessage', type: 'text' },
    { name: 'status', type: 'string', options: ['new', 'reviewed', 'interviewing', 'hired', 'rejected'] },
    { name: 'appliedDate', type: 'datetime' },
    { name: 'employerNotes', type: 'text' }
  ]
}
```

### 6. User Experience Design

#### 6.1 Design Principles
- **Mobile-first:** 70% of users expected on mobile devices
- **Simplicity:** Clear CTAs, minimal form fields
- **Accessibility:** WCAG 2.1 AA compliance
- **Speed:** Static generation where possible, image optimization
- **Trust:** Verified employer badges, secure application process

#### 6.2 Key User Flows
1. **Job Seeker Registration → Profile → Search → Apply**
2. **Employer Registration → Company Profile → Post Job → Review Applications**
3. **Return User → Saved Search → New Results → Quick Apply**

### 7. MVP Scope (Phase 1)

**Duration:** 4-6 weeks (faster with Sanity)

**Core Features:**
- Basic job search and listing pages
- Simple job posting through Sanity Studio
- User authentication with NextAuth.js (Google/Email)
- Basic profile creation
- Application submission system
- Admin panel (Sanity Studio - free)

**Excluded from MVP:**
- Advanced filtering and map view
- Real-time messaging
- Email notifications (basic only)
- Advanced analytics
- Mobile app

### 8. Future Enhancements (Phase 2+)

- **Enhanced Search:** Algolia free tier integration
- **Email Automation:** Upgrade to paid email service
- **Advanced Maps:** Mapbox integration when budget allows
- **Mobile App:** PWA first, then React Native
- **Premium Features:** Paid job promotions
- **SMS Notifications:** Twilio integration
- **API Access:** For partner integrations

### 9. Success Metrics

#### 9.1 Primary KPIs
- Monthly Active Users (MAU)
- Job postings per month
- Applications submitted per month
- Cost per acquisition (keep under $5)
- Monthly hosting costs (target: under $50)

#### 9.2 Secondary KPIs
- Page load speed (under 3s)
- Mobile engagement rate
- Geographic coverage
- User retention (30-day)

### 10. Monetization Strategy (Post-MVP)

#### 10.1 Phase 1 (Months 1-6): Build Traffic
- Completely free for all users
- Focus on SEO and organic growth
- Partner with trade schools (free listings)

#### 10.2 Phase 2 (Months 6-12): Freemium Model
- **Free:** First 3 job posts/month
- **Basic:** $25/month for 10 posts
- **Pro:** $75/month unlimited + featured posts
- **Enterprise:** Custom pricing

#### 10.3 Revenue Streams
- Featured job listings ($10/post)
- Urgent hiring badges ($5/post)
- Company verification ($50/year)
- Resume database access (future)

### 11. Cost Projections

#### 11.1 Initial Costs (Monthly)
- Domain: ~$1/month
- Sanity: $0 (free tier)
- Vercel: $0 (free tier)
- Email (Resend): $0 (100/day free)
- Total: ~$1/month

#### 11.2 Growth Phase (1000+ users)
- Sanity: $0-99/month (depending on usage)
- Vercel Pro: $20/month
- Email service: ~$20/month
- Domain/SSL: ~$1/month
- Total: ~$41-140/month

### 12. Legal and Compliance

- **Privacy Policy:** CCPA compliant template (free)
- **Terms of Service:** Generated with free tools
- **Cookie Consent:** Simple implementation
- **Data Storage:** All in Sanity (GDPR compliant)

### 13. SEO & Marketing Strategy (Low-Cost)

#### 13.1 Organic Growth
- SEO-optimized job pages
- Local business directory submissions (free)
- Google My Business listing
- Content marketing (DIY blog)

#### 13.2 Partnerships
- Colorado trade schools
- Local unions
- Workforce development centers
- Chamber of Commerce

#### 13.3 Social Media
- Facebook groups (free)
- LinkedIn outreach
- Instagram for company culture posts
- TikTok for job seeker tips

### 14. Launch Strategy

#### 14.1 Soft Launch (Week 1)
- 10 hand-picked employers
- Denver metro focus
- Manual QA testing

#### 14.2 Beta Launch (Weeks 2-4)
- 50 employers
- Front Range expansion
- Collect feedback

#### 14.3 Public Launch (Week 5+)
- Statewide coverage
- Press release to local media
- Social media campaign
- SEO content push