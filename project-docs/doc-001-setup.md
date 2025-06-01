# DOC-001: Project Setup & Configuration

## Overview
Initial setup of the Colorado Job Board project using NextAdmin theme with all required dependencies.

## Prerequisites
- Node.js 18+ installed
- Git installed
- npm or yarn package manager
- VS Code with Claude Code

## Steps

### 1. Clone NextAdmin Theme

```bash
# Clone the NextAdmin dashboard
git clone https://github.com/NextAdminHQ/nextjs-admin-dashboard.git colorado-job-board
cd colorado-job-board

# Remove git history to start fresh
rm -rf .git
git init
```

### 2. Install Core Dependencies

```bash
# Install existing dependencies
npm install

# Install job board specific dependencies
npm install @sanity/client@latest @sanity/image-url@latest
npm install next-auth@beta @auth/core
npm install react-hook-form zod @hookform/resolvers/zod
npm install leaflet react-leaflet @types/leaflet
npm install fuse.js
npm install date-fns
npm install @vercel/analytics
npm install zustand
```

### 3. Install Development Dependencies

```bash
# Development dependencies
npm install -D @types/node
```

### 4. Update package.json

Add these scripts to `package.json`:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "type-check": "tsc --noEmit"
  }
}
```

### 5. Create Project Structure

Create the following directory structure:

```bash
# Create directories
mkdir -p app/{(public),dashboard,api}
mkdir -p app/(public)/{jobs,companies,apply}
mkdir -p app/dashboard/{jobs,applications,company,analytics}
mkdir -p components/{Public,Dashboard,Shared}
mkdir -p lib
mkdir -p hooks
mkdir -p types
mkdir -p public/images/{companies,categories}
```

### 6. Configure TypeScript

Update `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "es5",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./*"],
      "@/components/*": ["./components/*"],
      "@/lib/*": ["./lib/*"],
      "@/hooks/*": ["./hooks/*"],
      "@/types/*": ["./types/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

### 7. Update Tailwind Configuration

Update `tailwind.config.js` to ensure all paths are included:

```javascript
import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#3b82f6",
          foreground: "#ffffff",
        },
        secondary: {
          DEFAULT: "#64748b",
          foreground: "#ffffff",
        },
      },
    },
  },
  plugins: [],
};

export default config;
```

### 8. Create Base Type Definitions

Create `types/index.ts`:

```typescript
// Job related types
export interface Job {
  _id: string;
  title: string;
  slug: { current: string };
  company: Company;
  description: any[];
  requirements: string;
  salaryType: 'hourly' | 'salary' | 'contract';
  salaryMin: number;
  salaryMax?: number;
  location: {
    city: string;
    county: string;
    zipCode: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  jobType: 'full-time' | 'part-time' | 'contract' | 'temporary';
  category: JobCategory;
  experienceLevel: 'entry' | 'intermediate' | 'experienced';
  benefits: string[];
  applicationDeadline?: string;
  isUrgent: boolean;
  featured: boolean;
  status: 'draft' | 'published' | 'expired' | 'filled';
  publishedAt: string;
  viewCount: number;
  applicationCount: number;
}

export interface Company {
  _id: string;
  name: string;
  slug: { current: string };
  logo?: any;
  description?: any[];
  website?: string;
  size?: '1-10' | '11-50' | '51-200' | '200+';
  locations?: Location[];
  benefitsOffered?: string[];
  verified: boolean;
  ownerId?: string;
}

export interface JobCategory {
  _id: string;
  name: string;
  slug: { current: string };
  description?: string;
  icon?: any;
}

export interface JobApplication {
  _id: string;
  job: Job;
  applicantInfo: {
    name: string;
    email: string;
    phone: string;
    resumeUrl?: string;
  };
  coverMessage?: string;
  status: 'new' | 'reviewed' | 'interviewing' | 'hired' | 'rejected';
  appliedDate: string;
  employerNotes?: string;
}

export interface Location {
  city: string;
  state: string;
  zipCode: string;
}

// Form types
export interface JobPostingForm {
  title: string;
  description: string;
  requirements: string;
  salaryType: string;
  salaryMin: number;
  salaryMax?: number;
  location: {
    city: string;
    county: string;
    zipCode: string;
  };
  jobType: string;
  category: string;
  experienceLevel: string;
  benefits: string[];
  applicationDeadline?: Date;
  isUrgent: boolean;
}

export interface ApplicationForm {
  name: string;
  email: string;
  phone: string;
  coverMessage?: string;
  resume?: File;
}

// User types
export interface User {
  id: string;
  email: string;
  name?: string;
  role: 'employer' | 'jobseeker' | 'admin';
  companyId?: string;
}
```

### 9. Clean Up Unnecessary Files

Remove NextAdmin demo files that won't be needed:

```bash
# Remove demo pages (we'll keep components)
rm -rf app/calendar
rm -rf app/inbox
rm -rf app/profile
rm -rf app/settings
rm -rf app/tables
rm -rf app/ui
```

### 10. Create .env.local Template

Create `.env.local.template`:

```env
# Sanity Configuration
NEXT_PUBLIC_SANITY_PROJECT_ID=your_project_id_here
NEXT_PUBLIC_SANITY_DATASET=production
SANITY_API_TOKEN=your_api_token_here

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=generate_32_char_secret_here

# Google OAuth (optional but recommended)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Email Service (Resend - free tier)
RESEND_API_KEY=your_resend_api_key
EMAIL_FROM=noreply@yourdomain.com

# Map Configuration (optional)
NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_token

# Analytics (optional)
NEXT_PUBLIC_GA_ID=your_google_analytics_id
```

### 11. Create .gitignore

Update `.gitignore`:

```gitignore
# Dependencies
/node_modules
/.pnp
.pnp.js

# Testing
/coverage

# Next.js
/.next/
/out/

# Production
/build

# Misc
.DS_Store
*.pem

# Debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Local env files
.env*.local
.env

# Vercel
.vercel

# TypeScript
*.tsbuildinfo
next-env.d.ts

# Sanity
/sanity/dist

# IDE
.vscode
.idea
```

## Verification Steps

1. **Check Installation:**
   ```bash
   npm run dev
   ```
   The development server should start on http://localhost:3000

2. **Verify TypeScript:**
   ```bash
   npm run type-check
   ```
   Should complete without errors

3. **Check File Structure:**
   ```bash
   ls -la app/
   ls -la components/
   ```
   All directories should be created

## Common Issues & Solutions

### Issue: Module not found errors
**Solution:** Ensure all dependencies are installed:
```bash
rm -rf node_modules package-lock.json
npm install
```

### Issue: TypeScript errors
**Solution:** Check tsconfig.json paths match your structure

### Issue: Tailwind not working
**Solution:** Ensure all content paths are included in tailwind.config.js

## Next Steps

Proceed to [DOC-002: Sanity Schema Setup](doc-002-sanity-schemas.md) to configure your CMS.

## Notes for Claude Code

When implementing this setup:
1. Ensure all directories are created before proceeding
2. Copy the type definitions exactly as shown
3. Don't skip the cleanup step - it prevents confusion later
4. The .env.local file is critical - create it even with placeholder values