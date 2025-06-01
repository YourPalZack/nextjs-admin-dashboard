# Claude Code Implementation Guide - Colorado Job Board

## 🚀 Complete Step-by-Step Implementation Guide

This guide will help Claude Code build a fully functional Colorado Job Board from start to finish using the provided documentation.

---

## 📋 Pre-Implementation Checklist

Before starting, ensure you have:
- [ ] Node.js 18+ installed
- [ ] Git installed
- [ ] VS Code with Claude Code extension
- [ ] Google account for OAuth setup
- [ ] Sanity account (free)
- [ ] Resend account (free)
- [ ] Vercel account (free)

---

## Phase 1: Foundation Setup (Week 1)

### Step 1: Initial Project Setup
**Prompt for Claude Code:**
```
Using DOC-001 from the documentation, set up the Colorado job board project with NextAdmin theme.

This is a fresh project start. 

Key requirements:
- Clone NextAdmin dashboard from GitHub
- Install all dependencies including Sanity, NextAuth, React Hook Form, Leaflet
- Create proper directory structure for public and dashboard sections
- Configure TypeScript with proper paths
- Set up the base type definitions

Follow DOC-001 exactly, including the directory structure and all npm install commands.
```

**Expected Outcome:**
- ✅ NextAdmin theme cloned and customized
- ✅ All dependencies installed
- ✅ Directory structure created
- ✅ TypeScript configured
- ✅ Base types defined

### Step 2: Sanity CMS Setup
**Prompt for Claude Code:**
```
Using DOC-002 from the documentation, create all Sanity schemas for the job board.

Previous context: Basic project structure is complete.

Key requirements:
- Create jobPosting schema with all fields (title, company, location, salary, etc.)
- Create company schema with verification system
- Create jobApplication schema for applicant tracking
- Create jobCategory and user schemas
- Include all field validations and preview configurations
- Set up proper references between schemas

Implement all schemas exactly as specified in DOC-002.
```

**Expected Outcome:**
- ✅ All Sanity schemas created
- ✅ Field validations in place
- ✅ Schema relationships configured
- ✅ Sanity studio accessible

### Step 3: Environment Configuration
**Prompt for Claude Code:**
```
Using DOC-003 from the documentation, set up all environment configurations.

Previous context: Project and Sanity schemas are complete.

Key requirements:
- Create .env.local with all required variables
- Set up Sanity project ID and dataset
- Configure placeholder values for all services
- Add environment validation
- Create .env.example file
- Add proper .gitignore entries

Include all environment variables from DOC-003.
```

**Expected Outcome:**
- ✅ Environment files created
- ✅ Sanity connection configured
- ✅ Environment validation added
- ✅ Security configurations in place

### Step 4: Authentication System
**Prompt for Claude Code:**
```
Using DOC-004 from the documentation, implement NextAuth.js authentication with Google OAuth.

Previous context: Environment is configured, Sanity is connected.

Key requirements:
- Set up NextAuth with Google OAuth provider
- Create authentication API routes
- Build sign-in and sign-up pages using NextAdmin components
- Implement useAuth hook for client-side auth
- Add middleware for protected routes
- Create role-based access control

Follow DOC-004 implementation exactly.
```

**Expected Outcome:**
- ✅ Google OAuth working
- ✅ Authentication pages created
- ✅ Protected routes configured
- ✅ Role-based access implemented

### Step 5: Sanity Client and Queries
**Prompt for Claude Code:**
```
Using DOC-005 from the documentation, create the Sanity client and all data fetching utilities.

Previous context: Authentication is working, environment is set up.

Key requirements:
- Set up Sanity client with proper configuration
- Create all GROQ queries for jobs, companies, applications
- Implement data fetching utilities with error handling
- Add TypeScript types for all queries
- Create image URL helper functions
- Set up caching and revalidation

Implement all queries and utilities from DOC-005.
```

**Expected Outcome:**
- ✅ Sanity client configured
- ✅ All GROQ queries created
- ✅ Data fetching utilities ready
- ✅ TypeScript types in place

### Step 6: Layout Structure
**Prompt for Claude Code:**
```
Using DOC-006 from the documentation, create the layout structure for both public and dashboard sections.

Previous context: Data layer is complete, authentication working.

Key requirements:
- Create public layout with navigation and footer
- Set up dashboard layout using NextAdmin sidebar
- Implement responsive navigation
- Add authentication state to navigation
- Create shared components (header, footer, navigation)
- Ensure mobile-first responsive design

Use only NextAdmin components for UI elements.
```

**Expected Outcome:**
- ✅ Public layout created
- ✅ Dashboard layout configured
- ✅ Navigation components working
- ✅ Responsive design implemented

---

## Phase 2: Public Features (Week 2)

### Step 7: Job Listing Page
**Prompt for Claude Code:**
```
Using DOC-007 from the documentation, create the job listing page with search and filtering.

Previous context: Layouts are complete, data fetching is ready.

Key requirements:
- Build job listing page with server-side rendering
- Create JobCard component using NextAdmin Card components
- Implement search and filter functionality
- Add pagination with proper URL state
- Create map/list view toggle
- Ensure mobile-responsive grid layout
- Add loading and empty states

Follow DOC-007 implementation completely.
```

**Expected Outcome:**
- ✅ Job listing page working
- ✅ Search and filters functional
- ✅ Pagination implemented
- ✅ Mobile responsive design

### Step 8: Job Detail Pages
**Prompt for Claude Code:**
```
Using DOC-008 from the documentation, create individual job detail pages with application functionality.

Previous context: Job listings are working, users can browse jobs.

Key requirements:
- Create job detail page with static generation
- Build job information display using NextAdmin components
- Create application form modal
- Add related jobs section
- Implement social sharing
- Add proper SEO meta tags
- Handle 404 states for invalid jobs

Use NextAdmin Card and Modal components for UI.
```

**Expected Outcome:**
- ✅ Job detail pages working
- ✅ Application form functional
- ✅ Static generation configured
- ✅ SEO optimization added

### Step 9: Advanced Search and Filters
**Prompt for Claude Code:**
```
Using DOC-009 from the documentation, implement advanced search functionality with Fuse.js.

Previous context: Basic job listing and detail pages are working.

Key requirements:
- Integrate Fuse.js for fuzzy search
- Create advanced search component with multiple filters
- Add search suggestions and autocomplete
- Implement saved searches for authenticated users
- Add filter tags and clear functionality
- Ensure debounced search for performance

Follow DOC-009 implementation for all search features.
```

**Expected Outcome:**
- ✅ Advanced search working
- ✅ Fuzzy search implemented
- ✅ Search suggestions active
- ✅ Saved searches functional

### Step 10: Company Pages
**Prompt for Claude Code:**
```
Using DOC-010 from the documentation, create company directory and individual company profile pages.

Previous context: Job pages are complete, search is working.

Key requirements:
- Build company directory page with search
- Create individual company profile pages
- Show jobs by company
- Add company follow functionality
- Implement company verification badges
- Create company cards using NextAdmin components

Use server-side rendering for company pages.
```

**Expected Outcome:**
- ✅ Company directory working
- ✅ Company profiles complete
- ✅ Company job listings functional
- ✅ Follow system implemented

### Step 11: Application System
**Prompt for Claude Code:**
```
Using DOC-011 documentation (you'll need to create this based on the project context), implement the complete job application system.

Previous context: All public pages are functional, users can browse jobs and companies.

Key requirements:
- Create application form with resume upload to Sanity assets
- Implement application submission API route
- Add application tracking page for job seekers
- Send confirmation emails via Resend
- Create success/error handling with proper UX
- Add application status tracking

Implement complete application workflow from form to confirmation.
```

**Expected Outcome:**
- ✅ Application form working
- ✅ Resume upload functional
- ✅ Email confirmations sent
- ✅ Application tracking available

---

## Phase 3: Dashboard Features (Week 3)

### Step 12: Dashboard Overview
**Prompt for Claude Code:**
```
Create the employer dashboard homepage using NextAdmin components.

Previous context: Public site is complete, authentication working, applications can be submitted.

Key requirements:
- Use NextAdmin dashboard layout and components
- Create stats cards showing total jobs, applications, views
- Add recent activity feed
- Include quick action buttons (post job, view applications)
- Ensure mobile responsive design
- Add loading states for all data

Build a professional dashboard using only NextAdmin UI components.
```

**Expected Outcome:**
- ✅ Dashboard home page complete
- ✅ Statistics cards working
- ✅ Activity feed functional
- ✅ Quick actions available

### Step 13: Job Management System
**Prompt for Claude Code:**
```
Create the complete job management system for employers.

Previous context: Dashboard layout is ready, employers can see overview.

Key requirements:
- Build job posting form using NextAdmin form components
- Implement job editing functionality
- Create job status management (draft/published/expired/filled)
- Add DataTable for job listings with sorting and filtering
- Include bulk operations (delete multiple, change status)
- Add job duplication feature
- Implement proper form validation with React Hook Form

Use NextAdmin DataTable and Form components exclusively.
```

**Expected Outcome:**
- ✅ Job posting form complete
- ✅ Job editing working
- ✅ Status management functional
- ✅ Bulk operations available

### Step 14: Application Management
**Prompt for Claude Code:**
```
Create the application review and management system for employers.

Previous context: Jobs can be posted and managed, applications are being received.

Key requirements:
- Build applications inbox with filtering and search
- Create detailed application view with resume display
- Implement status workflow (new → reviewed → interview → hired/rejected)
- Add employer notes system
- Create email communication templates
- Include export to CSV functionality
- Add application analytics

Use NextAdmin Table and Modal components for the interface.
```

**Expected Outcome:**
- ✅ Applications inbox working
- ✅ Application review system complete
- ✅ Status workflow functional
- ✅ Communication tools available

### Step 15: Analytics Dashboard
**Prompt for Claude Code:**
```
Implement comprehensive analytics dashboard for employers.

Previous context: Job and application management are complete.

Key requirements:
- Use NextAdmin chart components for visualizations
- Show job performance metrics (views, applications, conversion rates)
- Display time-to-hire analytics
- Add date range filtering
- Include downloadable reports (PDF/CSV)
- Create mobile-responsive charts
- Add real-time data updates

Focus on actionable metrics that help employers optimize their hiring.
```

**Expected Outcome:**
- ✅ Analytics charts working
- ✅ Performance metrics displayed
- ✅ Reports downloadable
- ✅ Mobile responsive charts

### Step 16: Company Profile Management
**Prompt for Claude Code:**
```
Create comprehensive company profile management for employers.

Previous context: Dashboard features are complete, analytics working.

Key requirements:
- Build company profile edit form
- Implement logo upload with Sanity assets
- Create benefits management (add/remove/edit)
- Add multiple location management
- Create verification request system
- Include company branding customization
- Add social media links management

Use NextAdmin Form components and ensure mobile responsiveness.
```

**Expected Outcome:**
- ✅ Company profile editing complete
- ✅ Logo upload working
- ✅ Benefits management functional
- ✅ Verification system ready

---

## Phase 4: Advanced Features (Week 4)

### Step 17: Map Integration
**Prompt for Claude Code:**
```
Implement interactive map functionality using Leaflet and OpenStreetMap.

Previous context: All core features are complete, need to add location-based job discovery.

Key requirements:
- Set up Leaflet with React integration
- Add job markers with popup information
- Implement location-based job filtering
- Create map/list view toggle
- Add marker clustering for areas with many jobs
- Ensure mobile touch controls work properly
- Add geolocation for "jobs near me" feature

Use free OpenStreetMap tiles and ensure good performance.
```

**Expected Outcome:**
- ✅ Interactive map working
- ✅ Job markers functional
- ✅ Location filtering active
- ✅ Mobile controls responsive

### Step 18: Email Notification System
**Prompt for Claude Code:**
```
Implement comprehensive email notification system using Resend.

Previous context: All major features complete, need automated communications.

Key requirements:
- Set up Resend integration with React Email templates
- Create application confirmation emails
- Build job alert subscriptions for job seekers
- Add status update notifications for applicants
- Implement daily digest emails for employers
- Include unsubscribe functionality
- Stay within free tier limits (100 emails/day)

Create professional, mobile-friendly email templates.
```

**Expected Outcome:**
- ✅ Email templates created
- ✅ Automated notifications working
- ✅ Subscription management functional
- ✅ Unsubscribe system active

### Step 19: Progressive Web App (PWA) Setup
**Prompt for Claude Code:**
```
Configure the application as a Progressive Web App for mobile users.

Previous context: All features complete, need offline capabilities and mobile app experience.

Key requirements:
- Create service worker for offline support
- Build app manifest.json with proper icons
- Implement install prompts for mobile users
- Add offline page with cached content
- Set up push notification infrastructure (preparation)
- Ensure app works when offline
- Add "Add to Home Screen" functionality

Focus on the mobile experience for blue-collar workers.
```

**Expected Outcome:**
- ✅ PWA functionality working
- ✅ Offline support available
- ✅ Install prompts functional
- ✅ Mobile app experience ready

### Step 20: SEO and Performance Optimization
**Prompt for Claude Code:**
```
Implement comprehensive SEO and performance optimizations.

Previous context: Full application is functional, need optimization for search engines and performance.

Key requirements:
- Generate dynamic sitemap.xml for all jobs and companies
- Add structured data (JSON-LD) for job postings
- Optimize all meta tags for social sharing
- Implement next/image for all images with proper optimization
- Ensure static generation for all possible pages
- Add robots.txt and security headers
- Optimize Core Web Vitals scores

Focus on making the site discoverable and fast.
```

**Expected Outcome:**
- ✅ SEO optimization complete
- ✅ Performance optimized
- ✅ Search engine ready
- ✅ Social sharing optimized

---

## 🧪 Testing and Validation

### After Each Phase, Test:

#### Phase 1 Testing:
```bash
# Test authentication
npm run dev
# Visit /auth/signin and test Google OAuth
# Verify protected routes redirect properly
# Test Sanity connection in browser network tab
```

#### Phase 2 Testing:
```bash
# Test public features
# Browse jobs without authentication
# Test search and filters
# Submit job application
# View company pages
```

#### Phase 3 Testing:
```bash
# Test dashboard features
# Create employer account
# Post a job
# Review applications
# Check analytics
```

#### Phase 4 Testing:
```bash
# Test advanced features
# Use map to find jobs
# Check email notifications
# Test PWA install
# Verify SEO with Lighthouse
```

---

## 🚀 Deployment Guide

### Final Deployment Steps:
```
Deploy the completed application to Vercel.

Previous context: All features implemented and tested locally.

Requirements:
- Configure Vercel environment variables
- Set up custom domain (optional)
- Configure Sanity CORS for production
- Test all functionality in production
- Set up monitoring and analytics
- Create backup procedures

Ensure all free tier limits are properly configured.
```

---

## 📊 Success Metrics

### Application should achieve:
- ✅ Mobile-first responsive design (works on 375px+)
- ✅ Fast loading times (< 3s on mobile)
- ✅ Lighthouse score > 90 for Performance, Accessibility, SEO
- ✅ All CRUD operations working (Create, Read, Update, Delete)
- ✅ Authentication flow complete
- ✅ Email notifications functional
- ✅ Search and filtering working
- ✅ Map integration active
- ✅ PWA capabilities enabled
- ✅ SEO optimized

---

## 🔧 Troubleshooting Common Issues

### If authentication fails:
- Check Google OAuth credentials in .env.local
- Verify NEXTAUTH_URL matches current domain
- Confirm callback URLs in Google Console

### If Sanity connection fails:
- Verify project ID and dataset in environment
- Check API token permissions
- Confirm CORS settings in Sanity

### If builds fail:
- Check all TypeScript types are properly defined
- Verify all imports are correct
- Ensure all environment variables are set

### If emails don't send:
- Check Resend API key
- Verify sender domain
- Confirm within free tier limits

---

## 📝 Final Notes

1. **Cost Management**: All services used are free tier - monitor usage
2. **Mobile Focus**: 70% of users will be mobile - test thoroughly
3. **Performance**: Blue-collar workers often have slower connections
4. **Accessibility**: Ensure WCAG 2.1 AA compliance
5. **Security**: All user data is properly protected
6. **Scalability**: Architecture supports growth within free tiers

---

## 🎯 Ready to Start?

Begin with **Step 1: Initial Project Setup** and work through each phase systematically. Each step builds on the previous one, so complete them in order.

The documentation provides all the code and instructions needed - Claude Code just needs to implement each step carefully and test thoroughly.

**Estimated Timeline**: 4 weeks working part-time, 2 weeks full-time.

**Final Result**: A production-ready job board serving Colorado's blue-collar workforce with modern features and mobile-first design.