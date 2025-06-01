# DOC-006: Layout Structure

## Overview
Create the layout structure for both public and dashboard sections using NextAdmin components.

## Prerequisites
- NextAdmin theme installed (from DOC-001)
- Authentication configured (from DOC-004)
- Basic components available

## Steps

### 1. Update Root Layout

Update `app/layout.tsx`:

```typescript
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import AuthProvider from '@/components/Providers/AuthProvider';
import { Toaster } from '@/components/ui/toaster';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: {
    default: 'Colorado Trades Jobs - Find Blue-Collar Jobs in Colorado',
    template: '%s | Colorado Trades Jobs',
  },
  description: 'Find construction, manufacturing, and skilled trade jobs across Colorado. Connect with employers looking for blue-collar workers.',
  keywords: 'jobs, Colorado, construction, manufacturing, trades, blue collar, employment',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://coloradotradesjobs.com',
    siteName: 'Colorado Trades Jobs',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Colorado Trades Jobs',
      },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className={inter.className}>
        <AuthProvider>
          {children}
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
```

### 2. Create Public Layout

Create `app/(public)/layout.tsx`:

```typescript
'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { 
  Menu, 
  Briefcase, 
  Building2, 
  User, 
  LogIn,
  Search,
  MapPin
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Find Jobs', href: '/jobs', icon: Search },
  { name: 'Companies', href: '/companies', icon: Building2 },
  { name: 'Browse by Location', href: '/jobs?view=map', icon: MapPin },
];

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" aria-label="Top">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <div className="flex items-center">
              <Link href="/" className="flex items-center space-x-2">
                <Briefcase className="h-8 w-8 text-blue-600" />
                <span className="text-xl font-bold text-gray-900">
                  Colorado Trades Jobs
                </span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex md:items-center md:space-x-6">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      'flex items-center space-x-1 text-sm font-medium transition-colors hover:text-blue-600',
                      pathname === item.href
                        ? 'text-blue-600'
                        : 'text-gray-700'
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>

            {/* Desktop Auth Buttons */}
            <div className="hidden md:flex md:items-center md:space-x-4">
              {session ? (
                <>
                  {session.user.role === 'employer' ? (
  

### 3. Update Dashboard Layout

The NextAdmin theme already includes a dashboard layout. We need to customize it for our job board. Update `app/dashboard/layout.tsx`:

```typescript
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Loader from '@/components/common/Loader';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return;
    
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    } else if (session?.user?.role === 'jobseeker') {
      router.push('/profile');
    } else {
      setLoading(false);
    }
  }, [session, status, router]);

  if (loading || status === 'loading') {
    return <Loader />;
  }

  return (
    <div className="dark:bg-boxdark-2 dark:text-bodydark">
      <div className="flex h-screen overflow-hidden">
        {/* Sidebar */}
        <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        {/* Content Area */}
        <div className="relative flex flex-1 flex-col overflow-y-auto overflow-x-hidden">
          {/* Header */}
          <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

          {/* Main Content */}
          <main>
            <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
```

### 4. Customize Sidebar Navigation

Update `components/Sidebar/index.tsx` to include job board specific navigation:

```typescript
'use client';

import React, { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { 
  LayoutDashboard,
  Briefcase,
  FileText,
  Building2,
  BarChart3,
  Settings,
  Users,
  Plus,
  List
} from 'lucide-react';
import SidebarLinkGroup from './SidebarLinkGroup';

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (arg: boolean) => void;
}

const Sidebar = ({ sidebarOpen, setSidebarOpen }: SidebarProps) => {
  const pathname = usePathname();
  const trigger = useRef<any>(null);
  const sidebar = useRef<any>(null);

  const storedSidebarExpanded = 'true';
  const [sidebarExpanded, setSidebarExpanded] = useState(
    storedSidebarExpanded === null ? false : storedSidebarExpanded === 'true'
  );

  // Close on click outside
  useEffect(() => {
    const clickHandler = ({ target }: MouseEvent) => {
      if (!sidebar.current || !trigger.current) return;
      if (
        !sidebarOpen ||
        sidebar.current.contains(target) ||
        trigger.current.contains(target)
      )
        return;
      setSidebarOpen(false);
    };
    document.addEventListener('click', clickHandler);
    return () => document.removeEventListener('click', clickHandler);
  });

  // Close if the esc key is pressed
  useEffect(() => {
    const keyHandler = ({ key }: KeyboardEvent) => {
      if (!sidebarOpen || key !== 'Escape') return;
      setSidebarOpen(false);
    };
    document.addEventListener('keydown', keyHandler);
    return () => document.removeEventListener('keydown', keyHandler);
  });

  useEffect(() => {
    localStorage.setItem('sidebar-expanded', sidebarExpanded.toString());
    if (sidebarExpanded) {
      document.querySelector('body')?.classList.add('sidebar-expanded');
    } else {
      document.querySelector('body')?.classList.remove('sidebar-expanded');
    }
  }, [sidebarExpanded]);

  return (
    <aside
      ref={sidebar}
      className={`absolute left-0 top-0 z-9999 flex h-screen w-72.5 flex-col overflow-y-hidden bg-black duration-300 ease-linear dark:bg-boxdark lg:static lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      {/* SIDEBAR HEADER */}
      <div className="flex items-center justify-between gap-2 px-6 py-5.5 lg:py-6.5">
        <Link href="/dashboard" className="flex items-center gap-2">
          <Briefcase className="h-8 w-8 text-white" />
          <span className="text-xl font-bold text-white">
            CTJ Employer
          </span>
        </Link>

        <button
          ref={trigger}
          onClick={() => setSidebarOpen(!sidebarOpen)}
          aria-controls="sidebar"
          aria-expanded={sidebarOpen}
          className="block lg:hidden"
        >
          <svg
            className="fill-current"
            width="20"
            height="18"
            viewBox="0 0 20 18"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M19 8.175H2.98748L9.36248 1.6875C9.69998 1.35 9.69998 0.825 9.36248 0.4875C9.02498 0.15 8.49998 0.15 8.16248 0.4875L0.399976 8.3625C0.0624756 8.7 0.0624756 9.225 0.399976 9.5625L8.16248 17.4375C8.31248 17.5875 8.53748 17.7 8.76248 17.7C8.98748 17.7 9.17498 17.625 9.36248 17.475C9.69998 17.1375 9.69998 16.6125 9.36248 16.275L2.98748 9.8625H19C19.45 9.8625 19.825 9.4875 19.825 9.0375C19.825 8.55 19.45 8.175 19 8.175Z"
              fill=""
            />
          </svg>
        </button>
      </div>
      {/* SIDEBAR HEADER */}

      <div className="no-scrollbar flex flex-col overflow-y-auto duration-300 ease-linear">
        {/* Sidebar Menu */}
        <nav className="mt-5 px-4 py-4 lg:mt-9 lg:px-6">
          {/* Menu Group */}
          <div>
            <h3 className="mb-4 ml-4 text-sm font-semibold text-bodydark2">
              MENU
            </h3>

            <ul className="mb-6 flex flex-col gap-1.5">
              {/* Dashboard */}
              <li>
                <Link
                  href="/dashboard"
                  className={`group relative flex items-center gap-2.5 rounded-sm px-4 py-2 font-medium text-bodydark1 duration-300 ease-in-out hover:bg-graydark dark:hover:bg-meta-4 ${
                    pathname === '/dashboard' &&
                    'bg-graydark dark:bg-meta-4'
                  }`}
                >
                  <LayoutDashboard className="h-5 w-5" />
                  Dashboard
                </Link>
              </li>

              {/* Jobs */}
              <SidebarLinkGroup
                activeCondition={pathname.includes('/dashboard/jobs')}
              >
                {(handleClick, open) => {
                  return (
                    <React.Fragment>
                      <Link
                        href="#"
                        className={`group relative flex items-center gap-2.5 rounded-sm px-4 py-2 font-medium text-bodydark1 duration-300 ease-in-out hover:bg-graydark dark:hover:bg-meta-4 ${
                          pathname.includes('/dashboard/jobs') &&
                          'bg-graydark dark:bg-meta-4'
                        }`}
                        onClick={(e) => {
                          e.preventDefault();
                          sidebarExpanded ? handleClick() : setSidebarExpanded(true);
                        }}
                      >
                        <Briefcase className="h-5 w-5" />
                        Job Postings
                        <svg
                          className={`absolute right-4 top-1/2 -translate-y-1/2 fill-current ${
                            open && 'rotate-180'
                          }`}
                          width="20"
                          height="20"
                          viewBox="0 0 20 20"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M4.41107 6.9107C4.73651 6.58527 5.26414 6.58527 5.58958 6.9107L10.0003 11.3214L14.4111 6.91071C14.7365 6.58527 15.2641 6.58527 15.5896 6.91071C15.915 7.23614 15.915 7.76378 15.5896 8.08922L10.5896 13.0892C10.2641 13.4147 9.73651 13.4147 9.41107 13.0892L4.41107 8.08922C4.08563 7.76378 4.08563 7.23614 4.41107 6.9107Z"
                            fill=""
                          />
                        </svg>
                      </Link>
                      {/* Dropdown Menu */}
                      <div
                        className={`translate transform overflow-hidden ${
                          !open && 'hidden'
                        }`}
                      >
                        <ul className="mb-5.5 mt-4 flex flex-col gap-2.5 pl-6">
                          <li>
                            <Link
                              href="/dashboard/jobs"
                              className={`group relative flex items-center gap-2.5 rounded-md px-4 font-medium text-bodydark2 duration-300 ease-in-out hover:text-white ${
                                pathname === '/dashboard/jobs' &&
                                'text-white'
                              }`}
                            >
                              <List className="h-4 w-4" />
                              All Jobs
                            </Link>
                          </li>
                          <li>
                            <Link
                              href="/dashboard/jobs/create"
                              className={`group relative flex items-center gap-2.5 rounded-md px-4 font-medium text-bodydark2 duration-300 ease-in-out hover:text-white ${
                                pathname === '/dashboard/jobs/create' &&
                                'text-white'
                              }`}
                            >
                              <Plus className="h-4 w-4" />
                              Post New Job
                            </Link>
                          </li>
                        </ul>
                      </div>
                      {/* Dropdown Menu */}
                    </React.Fragment>
                  );
                }}
              </SidebarLinkGroup>

              {/* Applications */}
              <li>
                <Link
                  href="/dashboard/applications"
                  className={`group relative flex items-center gap-2.5 rounded-sm px-4 py-2 font-medium text-bodydark1 duration-300 ease-in-out hover:bg-graydark dark:hover:bg-meta-4 ${
                    pathname.includes('/dashboard/applications') &&
                    'bg-graydark dark:bg-meta-4'
                  }`}
                >
                  <FileText className="h-5 w-5" />
                  Applications
                  {/* TODO: Add notification badge for new applications */}
                </Link>
              </li>

              {/* Company Profile */}
              <li>
                <Link
                  href="/dashboard/company"
                  className={`group relative flex items-center gap-2.5 rounded-sm px-4 py-2 font-medium text-bodydark1 duration-300 ease-in-out hover:bg-graydark dark:hover:bg-meta-4 ${
                    pathname === '/dashboard/company' &&
                    'bg-graydark dark:bg-meta-4'
                  }`}
                >
                  <Building2 className="h-5 w-5" />
                  Company Profile
                </Link>
              </li>

              {/* Analytics */}
              <li>
                <Link
                  href="/dashboard/analytics"
                  className={`group relative flex items-center gap-2.5 rounded-sm px-4 py-2 font-medium text-bodydark1 duration-300 ease-in-out hover:bg-graydark dark:hover:bg-meta-4 ${
                    pathname === '/dashboard/analytics' &&
                    'bg-graydark dark:bg-meta-4'
                  }`}
                >
                  <BarChart3 className="h-5 w-5" />
                  Analytics
                </Link>
              </li>
            </ul>
          </div>

          {/* Others Group */}
          <div>
            <h3 className="mb-4 ml-4 text-sm font-semibold text-bodydark2">
              OTHERS
            </h3>

            <ul className="mb-6 flex flex-col gap-1.5">
              {/* Settings */}
              <li>
                <Link
                  href="/dashboard/settings"
                  className={`group relative flex items-center gap-2.5 rounded-sm px-4 py-2 font-medium text-bodydark1 duration-300 ease-in-out hover:bg-graydark dark:hover:bg-meta-4 ${
                    pathname.includes('/dashboard/settings') &&
                    'bg-graydark dark:bg-meta-4'
                  }`}
                >
                  <Settings className="h-5 w-5" />
                  Settings
                </Link>
              </li>
            </ul>
          </div>
        </nav>
        {/* Sidebar Menu */}
      </div>
    </aside>
  );
};

export default Sidebar;
```

### 5. Create Loading Component

Create `app/loading.tsx`:

```typescript
import Loader from '@/components/common/Loader';

export default function Loading() {
  return <Loader />;
}
```

### 6. Create Not Found Page

Create `app/not-found.tsx`:

```typescript
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-900">404</h1>
        <p className="mt-4 text-xl text-gray-600">Page not found</p>
        <p className="mt-2 text-gray-500">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-8 flex gap-4 justify-center">
          <Link href="/">
            <Button>Go to Homepage</Button>
          </Link>
          <Link href="/jobs">
            <Button variant="outline">Browse Jobs</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
```

### 7. Create Error Page

Create `app/error.tsx`:

```typescript
'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900">
          Something went wrong!
        </h1>
        <p className="mt-4 text-gray-600">
          We're sorry, but something unexpected happened.
        </p>
        <div className="mt-8">
          <Button onClick={reset}>Try again</Button>
        </div>
      </div>
    </div>
  );
}
```

### 8. Create Breadcrumb Component

Create `components/Shared/Breadcrumb.tsx`:

```typescript
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

interface BreadcrumbProps {
  pageName: string;
  description?: string;
  breadcrumbItems?: Array<{
    label: string;
    href: string;
  }>;
}

const Breadcrumb = ({ pageName, description, breadcrumbItems = [] }: BreadcrumbProps) => {
  return (
    <div className="mb-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-bold text-black dark:text-white">
          {pageName}
        </h2>

        <nav>
          <ol className="flex items-center gap-2">
            <li>
              <Link className="font-medium" href="/dashboard">
                Dashboard
              </Link>
            </li>
            {breadcrumbItems.map((item, index) => (
              <li key={index} className="flex items-center gap-2">
                <ChevronRight className="h-4 w-4" />
                <Link className="font-medium" href={item.href}>
                  {item.label}
                </Link>
              </li>
            ))}
            <li className="flex items-center gap-2">
              <ChevronRight className="h-4 w-4" />
              <span className="text-primary">{pageName}</span>
            </li>
          </ol>
        </nav>
      </div>
      {description && (
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          {description}
        </p>
      )}
    </div>
  );
};

export default Breadcrumb;
```

### 9. Create Page Container Component

Create `components/Shared/PageContainer.tsx`:

```typescript
interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
}

export default function PageContainer({ children, className = '' }: PageContainerProps) {
  return (
    <div className={`mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 ${className}`}>
      {children}
    </div>
  );
}
```

### 10. Update Global CSS

Ensure `app/globals.css` includes necessary styles:

```css
@import 'tailwindcss/base';
@import 'tailwindcss/components';
@import 'tailwindcss/utilities';

/* Custom scrollbar styles */
.no-scrollbar::-webkit-scrollbar {
  display: none;
}

.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

/* Smooth scroll behavior */
html {
  scroll-behavior: smooth;
}

/* Focus styles */
@layer utilities {
  .focus-visible-ring {
    @apply focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2;
  }
}
```

## Verification Steps

1. **Test Public Layout:**
   - Navigate to homepage
   - Check mobile menu works
   - Verify navigation highlights

2. **Test Dashboard Layout:**
   - Sign in as employer
   - Check sidebar navigation
   - Verify auth protection

3. **Test Responsive Design:**
   - Check on mobile devices
   - Test tablet breakpoints
   - Verify desktop layout

## Common Issues & Solutions

### Issue: Sidebar not closing on mobile
**Solution:** Check click outside handler and event listeners

### Issue: Navigation not highlighting
**Solution:** Verify pathname matching logic

### Issue: Layout shift on page load
**Solution:** Add proper loading states and suspense boundaries

## Next Steps

Proceed to [DOC-007: Job Listing Page](doc-007-job-listings.md) to build the main job browsing interface.

## Notes for Claude Code

When implementing layouts:
1. Test auth redirects thoroughly
2. Ensure mobile menu works properly
3. Check all navigation links
4. Verify loading states
5. Test dark mode if implemented="/dashboard">
                      <Button variant="outline">
                        <Building2 className="mr-2 h-4 w-4" />
                        Employer Dashboard
                      </Button>
                    </Link>
                  ) : (
                    <Link href="/profile">
                      <Button variant="outline">
                        <User className="mr-2 h-4 w-4" />
                        My Applications
                      </Button>
                    </Link>
                  )}
                </>
              ) : (
                <>
                  <Link href="/auth/signin">
                    <Button variant="ghost">Sign In</Button>
                  </Link>
                  <Link href="/auth/signup">
                    <Button>
                      <Briefcase className="mr-2 h-4 w-4" />
                      Post a Job
                    </Button>
                  </Link>
                </>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="flex md:hidden">
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Menu className="h-6 w-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                  <nav className="flex flex-col space-y-4 mt-6">
                    {navigation.map((item) => {
                      const Icon = item.icon;
                      return (
                        <Link
                          key={item.name}
                          href={item.href}
                          onClick={() => setMobileMenuOpen(false)}
                          className={cn(
                            'flex items-center space-x-2 text-base font-medium py-2',
                            pathname === item.href
                              ? 'text-blue-600'
                              : 'text-gray-700'
                          )}
                        >
                          <Icon className="h-5 w-5" />
                          <span>{item.name}</span>
                        </Link>
                      );
                    })}
                    
                    <div className="border-t pt-4">
                      {session ? (
                        <>
                          {session.user.role === 'employer' ? (
                            <Link
                              href="/dashboard"
                              onClick={() => setMobileMenuOpen(false)}
                            >
                              <Button className="w-full" variant="outline">
                                <Building2 className="mr-2 h-4 w-4" />
                                Employer Dashboard
                              </Button>
                            </Link>
                          ) : (
                            <Link
                              href="/profile"
                              onClick={() => setMobileMenuOpen(false)}
                            >
                              <Button className="w-full" variant="outline">
                                <User className="mr-2 h-4 w-4" />
                                My Applications
                              </Button>
                            </Link>
                          )}
                        </>
                      ) : (
                        <div className="space-y-2">
                          <Link
                            href="/auth/signin"
                            onClick={() => setMobileMenuOpen(false)}
                          >
                            <Button className="w-full" variant="outline">
                              Sign In
                            </Button>
                          </Link>
                          <Link
                            href="/auth/signup"
                            onClick={() => setMobileMenuOpen(false)}
                          >
                            <Button className="w-full">
                              Post a Job
                            </Button>
                          </Link>
                        </div>
                      )}
                    </div>
                  </nav>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider">
                For Job Seekers
              </h3>
              <ul className="mt-4 space-y-2">
                <li>
                  <Link href="/jobs" className="text-gray-300 hover:text-white">
                    Browse Jobs
                  </Link>
                </li>
                <li>
                  <Link href="/companies" className="text-gray-300 hover:text-white">
                    Companies
                  </Link>
                </li>
                <li>
                  <Link href="/resources/resume-tips" className="text-gray-300 hover:text-white">
                    Resume Tips
                  </Link>
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider">
                For Employers
              </h3>
              <ul className="mt-4 space-y-2">
                <li>
                  <Link href="/auth/signup" className="text-gray-300 hover:text-white">
                    Post a Job
                  </Link>
                </li>
                <li>
                  <Link href="/pricing" className="text-gray-300 hover:text-white">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link href="/resources/hiring-guide" className="text-gray-300 hover:text-white">
                    Hiring Guide
                  </Link>
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider">
                Resources
              </h3>
              <ul className="mt-4 space-y-2">
                <li>
                  <Link href="/about" className="text-gray-300 hover:text-white">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="/blog" className="text-gray-300 hover:text-white">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="text-gray-300 hover:text-white">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider">
                Legal
              </h3>
              <ul className="mt-4 space-y-2">
                <li>
                  <Link href="/privacy" className="text-gray-300 hover:text-white">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="text-gray-300 hover:text-white">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link href