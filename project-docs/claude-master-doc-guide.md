# Claude Code Master Documentation - Colorado Job Board (Enhanced)

## 🎯 Project Mission
Building a Next.js job board for blue-collar workers in Colorado using NextAdmin theme, Sanity CMS, and free/low-cost services.

## 📋 Implementation Tracking System

### Phase Status Overview
- ✅ **Phase 1 Complete**: Setup & Infrastructure (DOC-001 to DOC-006)
- ✅ **Phase 2 Complete**: Public Features (DOC-007 to DOC-011)  
- ✅ **Phase 3 Complete**: Dashboard Features (DOC-012 to DOC-016)
- ✅ **Phase 4 Complete**: Advanced Features (DOC-017)
- 🔄 **Phase 5 In Progress**: Email & PWA (DOC-018 to DOC-019)
- ❌ **Phase 6 Pending**: SEO & Performance (DOC-020)

---

## 🗒️ SCRATCH PAD - Current Session Context

### **Current Working Session**: _[Update this each time you start]_
**Date**: ___________  
**Starting Phase**: ___________  
**Goal for Session**: ___________  

### **Last Completed**:
- **Feature**: ___________
- **Files Modified**: ___________
- **Tests Passed**: ___________
- **Issues Found**: ___________

### **Current Implementation Status**:
- **Working On**: ___________
- **Next Step**: ___________
- **Blockers**: ___________
- **Notes**: ___________

### **Quick Decisions Made This Session**:
1. ___________
2. ___________
3. ___________

---

## ✅ IMPLEMENTATION CHECKLIST

### **Phase 1: Project Foundation**
- [ ] **DOC-001**: Project Setup & Configuration
  - [ ] NextAdmin theme cloned and configured
  - [ ] All dependencies installed
  - [ ] Directory structure created
  - [ ] TypeScript configuration complete
  - [ ] Basic types defined in types/index.ts
  - **Status**: _____ | **Issues**: _____

- [ ] **DOC-002**: Sanity Schema Setup  
  - [ ] Sanity studio project created
  - [ ] All 6 schemas implemented (jobPosting, company, etc.)
  - [ ] Preview configurations added
  - [ ] Studio desk structure configured
  - **Status**: _____ | **Issues**: _____

- [ ] **DOC-003**: Environment Configuration
  - [ ] .env.local created with all variables
  - [ ] Environment validation implemented
  - [ ] TypeScript environment types added
  - **Status**: _____ | **Issues**: _____

- [ ] **DOC-004**: Authentication Setup
  - [ ] NextAuth.js configured with Google OAuth
  - [ ] Auth API routes created
  - [ ] useAuth hook implemented
  - [ ] Sign-in/sign-up pages created
  - [ ] Authentication middleware working
  - **Status**: _____ | **Issues**: _____

- [ ] **DOC-005**: Sanity Client & Queries
  - [ ] Sanity client configured
  - [ ] All GROQ queries implemented
  - [ ] Image URL builder setup
  - [ ] Data fetching utilities created
  - **Status**: _____ | **Issues**: _____

- [ ] **DOC-006**: Layout Structure
  - [ ] Public layout implemented
  - [ ] Dashboard layout configured
  - [ ] Navigation components created
  - [ ] Mobile responsiveness tested
  - **Status**: _____ | **Issues**: _____

### **Phase 2: Public Features**
- [ ] **DOC-007**: Job Listing Page
  - [ ] Server-side job listing page
  - [ ] JobCard component with NextAdmin styling
  - [ ] Search functionality
  - [ ] Responsive grid layout
  - [ ] Loading states implemented
  - **Status**: _____ | **Issues**: _____

- [ ] **DOC-008**: Job Detail Page
  - [ ] Static generation for job pages
  - [ ] Job detail display component
  - [ ] Application modal
  - [ ] Company information section
  - [ ] Related jobs feature
  - **Status**: _____ | **Issues**: _____

- [ ] **DOC-009**: Search & Filters
  - [ ] Fuse.js integration for search
  - [ ] Filter components (location, salary, category)
  - [ ] URL-based filter state
  - [ ] Filter persistence
  - [ ] Mobile-responsive filters
  - **Status**: _____ | **Issues**: _____

- [ ] **DOC-010**: Company Pages
  - [ ] Company listing page
  - [ ] Company detail pages
  - [ ] Company verification badges
  - [ ] Jobs by company feature
  - **Status**: _____ | **Issues**: _____

- [ ] **DOC-011**: Application System
  - [ ] Application form with validation
  - [ ] Resume upload to Sanity assets
  - [ ] Application API endpoints
  - [ ] Email confirmations
  - [ ] Success/error handling
  - **Status**: _____ | **Issues**: _____

### **Phase 3: Dashboard Features**
- [ ] **DOC-012**: Dashboard Overview
  - [ ] Stats cards with metrics
  - [ ] Recent activity feed
  - [ ] Quick action buttons
  - [ ] Charts using NextAdmin components
  - **Status**: _____ | **Issues**: _____

- [ ] **DOC-013**: Job Management
  - [ ] Job listing table (NextAdmin DataTable)
  - [ ] Create/edit job forms
  - [ ] Job status management
  - [ ] Bulk operations
  - [ ] Job duplication feature
  - **Status**: _____ | **Issues**: _____

- [ ] **DOC-014**: Application Management
  - [ ] Applications table with filters
  - [ ] Application detail view
  - [ ] Status workflow management
  - [ ] Applicant notes system
  - [ ] Email communication features
  - **Status**: _____ | **Issues**: _____

- [ ] **DOC-015**: Analytics Dashboard
  - [ ] Performance charts
  - [ ] Conversion metrics
  - [ ] Date range filters
  - [ ] Export functionality
  - [ ] Printable reports
  - **Status**: _____ | **Issues**: _____

- [ ] **DOC-016**: Company Profile Management
  - [ ] Company profile edit form
  - [ ] Logo upload functionality
  - [ ] Benefits management
  - [ ] Location management
  - [ ] Verification request system
  - **Status**: _____ | **Issues**: _____

### **Phase 4: Advanced Features**
- [ ] **DOC-017**: Map Integration
  - [ ] Leaflet + OpenStreetMap setup
  - [ ] Job location markers
  - [ ] Location-based search
  - [ ] Map/list view toggle
  - [ ] Mobile touch controls
  - **Status**: _____ | **Issues**: _____

- [ ] **DOC-018**: Email Notifications
  - [ ] Resend email client setup
  - [ ] Email templates (confirmation, alerts, status updates)
  - [ ] Email queue system
  - [ ] Subscription management
  - [ ] Job alert processing
  - [ ] Unsubscribe functionality
  - **Status**: _____ | **Issues**: _____

- [ ] **DOC-019**: PWA Setup
  - [ ] Web app manifest
  - [ ] Service worker configuration
  - [ ] Offline functionality
  - [ ] Install prompt component
  - [ ] Background sync for forms
  - [ ] Update notifications
  - **Status**: _____ | **Issues**: _____

### **Phase 5: Optimization**
- [ ] **DOC-020**: SEO & Performance
  - [ ] Dynamic sitemap generation
  - [ ] Structured data implementation
  - [ ] Meta tag optimization
  - [ ] Core Web Vitals optimization
  - [ ] Performance monitoring
  - [ ] Local SEO setup
  - **Status**: _____ | **Issues**: _____

---

## 🚀 CLAUDE CODE PROMPTS - COPY & PASTE READY

### **PROMPT TEMPLATE**
```
Using [DOC-XXX], implement [SPECIFIC FEATURE].

Current context: [WHAT'S ALREADY BUILT]

Key requirements:
- [REQUIREMENT 1]
- [REQUIREMENT 2] 
- [REQUIREMENT 3]

Focus on: [SPECIFIC AREA OF IMPLEMENTATION]
```

### **Phase 1: Foundation Setup**

#### 1.1 Initial Project Setup
```
Using DOC-001, set up the Colorado job board project with NextAdmin theme.

Current context: Starting fresh - no existing code.

Key requirements:
- Clone NextAdmin from GitHub (NextAdminHQ/nextjs-admin-dashboard)
- Install all dependencies listed in section 2 of DOC-001
- Create complete directory structure from section 3
- Configure TypeScript with proper paths
- Create initial type definitions

Focus on: Getting a working Next.js project with NextAdmin theme ready for development.
```

#### 1.2 Sanity Schema Creation
```
Using DOC-002, create all Sanity schemas for the job board.

Current context: Next.js project with NextAdmin theme is set up and running.

Key requirements:
- Create new Sanity studio project (separate from main app)
- Implement all 6 document schemas: blockContent, location, jobCategory, company, jobPosting, jobApplication
- Add preview configurations for each schema
- Configure custom desk structure
- Ensure proper field validations

Focus on: Setting up Sanity CMS with all required content types for the job board.
```

#### 1.3 Environment Configuration
```
Using DOC-003, configure environment variables and validation.

Current context: Next.js app and Sanity studio are created.

Key requirements:
- Create .env.local with all required variables (use placeholder values)
- Set up environment variable validation in lib/env.ts
- Add TypeScript support for environment variables
- Ensure .env.local is in .gitignore

Focus on: Proper environment configuration for development and production.
```

### **Phase 2: Core Infrastructure** 

#### 2.1 Authentication System
```
Using DOC-004, implement NextAuth.js authentication with Google OAuth.

Current context: Environment variables configured.

Key requirements:
- Set up NextAuth with Google provider
- Create API route in app/api/auth/[...nextauth]/route.ts
- Implement AuthProvider context component
- Create useAuth hook for client components
- Add sign-in page using NextAdmin components
- Configure middleware for protected routes

Focus on: Working authentication system that allows Google sign-in.
```

#### 2.2 Sanity Client Setup
```
Using DOC-005, create Sanity client and implement data queries.

Current context: Authentication is working, Sanity schemas are defined.

Key requirements:
- Configure Sanity client in lib/sanity.ts
- Implement all GROQ queries for jobs, companies, applications
- Set up image URL builder for Sanity assets
- Create typed data fetching utilities
- Add error handling for Sanity operations

Focus on: Connecting the Next.js app to Sanity CMS with proper data fetching.
```

#### 2.3 Layout Implementation
```
Using DOC-006, implement layout structure for public and dashboard areas.

Current context: Auth and Sanity client are working.

Key requirements:
- Create public layout in app/(public)/layout.tsx
- Configure dashboard layout using NextAdmin sidebar
- Implement responsive navigation components
- Add header and footer for public pages
- Set up protected route layout for dashboard

Focus on: Complete navigation structure that works on mobile and desktop.
```

### **Phase 3: Public Site Features**

#### 3.1 Job Listings Page
```
Using DOC-007, create the main job listing page with search functionality.

Current context: Layouts are complete, auth and Sanity are working.

Key requirements:
- Implement app/(public)/jobs/page.tsx with server-side data fetching
- Create JobCard component using NextAdmin Card components
- Add search bar and basic filters
- Implement responsive grid layout
- Add loading states and error handling

Focus on: Users can browse and search for jobs with a clean, mobile-first interface.
```

#### 3.2 Job Detail Pages
```
Using DOC-008, create individual job detail pages with application functionality.

Current context: Job listings page is working and displaying jobs.

Key requirements:
- Create app/(public)/jobs/[slug]/page.tsx with static generation
- Implement job detail display with company information
- Add "Apply Now" button that opens application modal
- Show job requirements, benefits, and description
- Include related jobs section

Focus on: Complete job viewing experience that encourages applications.
```

#### 3.3 Advanced Search and Filters
```
Using DOC-009, enhance search with filters and advanced functionality.

Current context: Basic job listing and detail pages are working.

Key requirements:
- Integrate Fuse.js for client-side search
- Create filter components for category, location, salary
- Implement URL-based filter state management
- Add search suggestions and saved searches
- Ensure mobile-responsive filter interface

Focus on: Powerful search experience that helps users find relevant jobs quickly.
```

#### 3.4 Company Pages
```
Using DOC-010, create company directory and individual company pages.

Current context: Job pages are complete with search and filters.

Key requirements:
- Create company listing page at app/(public)/companies/page.tsx
- Implement individual company detail pages
- Show company verification badges and basic info
- List all jobs from each company
- Add company follow functionality

Focus on: Company discovery and branding for employers.
```

### **Phase 4: Application System**

#### 4.1 Job Application System
```
Using DOC-011, implement the complete job application workflow.

Current context: All public browsing features are complete.

Key requirements:
- Create application form using NextAdmin form components
- Implement resume upload to Sanity assets
- Add application submission API route
- Send confirmation emails using Resend
- Create application tracking for users

Focus on: Complete application process from form submission to confirmation.
```

### **Phase 5: Dashboard Features**

#### 5.1 Dashboard Overview
```
Using DOC-012, create the employer dashboard homepage.

Current context: Public site is complete, applications are working.

Key requirements:
- Implement dashboard home with key metrics
- Use NextAdmin chart components for visualizations
- Show recent applications and activity
- Add quick action buttons for common tasks
- Ensure proper authentication and role checking

Focus on: Dashboard that gives employers quick insights into their hiring activity.
```

#### 5.2 Job Management
```
Using DOC-013, build comprehensive job management for employers.

Current context: Dashboard overview is complete.

Key requirements:
- Create job listing table using NextAdmin DataTable
- Implement create and edit job forms
- Add job status management (draft, published, expired)
- Include bulk operations for multiple jobs
- Add job duplication and templating features

Focus on: Complete job posting and management workflow for employers.
```

#### 5.3 Application Management
```
Using DOC-014, create the application review and management system.

Current context: Employers can create and manage job postings.

Key requirements:
- Build applications table with filtering and sorting
- Create detailed application view with applicant information
- Implement status workflow (new, reviewed, interviewing, hired, rejected)
- Add rating and notes system for applicants
- Include email communication features

Focus on: Complete hiring workflow from application review to hiring decisions.
```

#### 5.4 Analytics Dashboard
```
Using DOC-015, implement analytics and reporting for employers.

Current context: Core dashboard functionality is complete.

Key requirements:
- Create charts showing job performance metrics
- Add conversion tracking (views to applications)
- Implement date range filtering
- Add export functionality for reports
- Show trend analysis over time

Focus on: Data-driven insights that help employers optimize their job postings.
```

#### 5.5 Company Profile Management
```
Using DOC-016, create company profile management interface.

Current context: All core dashboard features are working.

Key requirements:
- Build company profile edit form
- Implement logo upload to Sanity assets
- Add benefits and perks management
- Create multiple location management
- Include company verification request system

Focus on: Complete company branding and profile management for employers.
```

### **Phase 6: Advanced Features**

#### 6.1 Map Integration
```
Using DOC-017, add interactive maps for job locations.

Current context: All core functionality is complete.

Key requirements:
- Integrate Leaflet with OpenStreetMap (free maps)
- Add job location markers with popups
- Implement location-based job search
- Create map/list view toggle
- Ensure proper mobile touch controls

Focus on: Visual job discovery through interactive maps.
```

#### 6.2 Email Notification System
```
Using DOC-018, implement comprehensive email notifications.

Current context: All features except email notifications are working.

Key requirements:
- Set up Resend email client and templates
- Create job application confirmation emails
- Implement job alert subscription system
- Add email queue and rate limiting (100 emails/day limit)
- Build unsubscribe and preference management

Focus on: Professional email communication that keeps users engaged.
```

#### 6.3 Progressive Web App
```
Using DOC-019, convert the application to a Progressive Web App.

Current context: All functionality is complete, email system is working.

Key requirements:
- Add web app manifest for installability
- Implement service worker with offline support
- Create offline page and background sync
- Add install prompt component
- Configure push notification preparation

Focus on: Native app-like experience that works offline for mobile users.
```

### **Phase 7: Optimization**

#### 7.1 SEO and Performance
```
Using DOC-020, implement comprehensive SEO and performance optimization.

Current context: Complete application with PWA features.

Key requirements:
- Generate dynamic sitemaps for jobs and companies
- Implement structured data (JSON-LD) for job postings
- Optimize all images with next/image
- Add comprehensive meta tags and Open Graph
- Monitor and optimize Core Web Vitals

Focus on: Maximum search engine visibility and fast loading performance.
```

---

## 🔄 SESSION WORKFLOW

### **Before Starting Each Session**
1. **Update Scratch Pad** with current session info
2. **Review Last Completed** section to understand context
3. **Check Implementation Checklist** to see what's done
4. **Choose Next Phase** based on dependencies

### **During Implementation**
1. **Copy the appropriate prompt** from the sections above
2. **Paste into Claude Code** and let it implement
3. **Test the implementation** thoroughly
4. **Update the checklist** with completion status
5. **Note any issues** in the scratch pad

### **After Each Feature**
1. **Mark completed items** with ✅ in checklist
2. **Update scratch pad** with what was accomplished
3. **Note any deviations** or custom solutions
4. **Prepare context** for next session

### **End of Session**
1. **Update Phase Status Overview** at the top
2. **Document any blockers** for next session
3. **Note current working state** in scratch pad

---

## 🎯 STAYING ON TASK - CLAUDE REMINDERS

### **Context Retention Strategy**
- Always reference the **Scratch Pad** for current session context
- Check **Implementation Checklist** before starting new features
- Use **Phase Status Overview** to understand overall progress
- Review **Last Completed** section to avoid duplicate work

### **Quality Assurance**
- Test each feature before marking complete
- Ensure mobile responsiveness for all components
- Verify NextAdmin components are used correctly
- Check that free tier limits are respected

### **Common Pitfalls to Avoid**
- ❌ Don't skip testing after implementation
- ❌ Don't create custom UI components (use NextAdmin)
- ❌ Don't exceed free tier limits for services
- ❌ Don't implement features out of dependency order
- ❌ Don't forget to update the tracking documents

### **Success Indicators**
- ✅ Each phase builds on the previous successfully
- ✅ Mobile-first design is maintained throughout
- ✅ All authentication and permissions work correctly
- ✅ Error handling is implemented for all user flows
- ✅ Performance remains fast as features are added

---

## 📁 QUICK REFERENCE

### **Essential Files Created**
- `app/(public)/layout.tsx` - Public site layout
- `app/dashboard/layout.tsx` - Dashboard layout (NextAdmin)
- `lib/sanity.ts` - Sanity client and queries
- `lib/auth.ts` - Authentication configuration
- `types/index.ts` - TypeScript type definitions
- `components/Public/` - Public site components
- `components/Dashboard/` - Dashboard components

### **Key Integrations**
- **NextAdmin**: UI components and dashboard theme
- **Sanity**: Content management and data storage
- **NextAuth**: Authentication with Google OAuth
- **Resend**: Email notifications (100/day free)
- **Leaflet**: Maps with OpenStreetMap (free)
- **Vercel**: Hosting and deployment (free tier)

### **Testing Checklist**
- [ ] Mobile responsiveness on actual devices
- [ ] Authentication flow (sign in/out)
- [ ] Job application submission
- [ ] Email notifications
- [ ] Dashboard functionality
- [ ] Map interactions
- [ ] Offline functionality (PWA)
- [ ] Performance metrics

---

**Remember**: This document is your navigation system. Update it frequently and use it to maintain context across sessions. The success of the implementation depends on following the phases in order and maintaining quality at each step.