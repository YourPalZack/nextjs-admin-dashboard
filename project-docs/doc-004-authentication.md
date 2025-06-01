# DOC-004: Authentication Setup

## Overview
Implement NextAuth.js authentication with Google OAuth and role-based access control.

## Prerequisites
- Environment variables configured (from DOC-003)
- Google OAuth credentials ready
- Project structure created

## Steps

### 1. Install NextAuth Dependencies

```bash
npm install next-auth@beta @auth/core
```

### 2. Create Auth Configuration

Create `lib/auth.config.ts`:

```typescript
import type { NextAuthConfig } from 'next-auth';
import Google from 'next-auth/providers/google';
import { client } from './sanity';

export const authConfig: NextAuthConfig = {
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === 'google') {
        try {
          // Check if user exists in Sanity
          const existingUser = await client.fetch(
            `*[_type == "user" && email == $email][0]`,
            { email: user.email }
          );

          if (!existingUser) {
            // Create new user in Sanity
            await client.create({
              _type: 'user',
              email: user.email,
              name: user.name,
              image: user.image,
              role: 'jobseeker', // Default role
              createdAt: new Date().toISOString(),
            });
          }
          return true;
        } catch (error) {
          console.error('Error during sign in:', error);
          return false;
        }
      }
      return true;
    },
    async session({ session, token }) {
      if (session.user?.email) {
        // Fetch user data from Sanity
        const userData = await client.fetch(
          `*[_type == "user" && email == $email][0]{
            _id,
            email,
            name,
            role,
            companyId
          }`,
          { email: session.user.email }
        );

        if (userData) {
          session.user = {
            ...session.user,
            id: userData._id,
            role: userData.role,
            companyId: userData.companyId,
          };
        }
      }
      return session;
    },
    async jwt({ token, user, account }) {
      if (account && user) {
        token.id = user.id;
      }
      return token;
    },
  },
  session: {
    strategy: 'jwt',
  },
};
```

### 3. Create Auth Route Handler

Create `app/api/auth/[...nextauth]/route.ts`:

```typescript
import NextAuth from 'next-auth';
import { authConfig } from '@/lib/auth.config';

const handler = NextAuth(authConfig);

export { handler as GET, handler as POST };
```

### 4. Add User Schema to Sanity

Add to your Sanity schemas - `schemas/documents/user.ts`:

```typescript
import {defineType, defineField} from 'sanity'

export default defineType({
  name: 'user',
  title: 'User',
  type: 'document',
  fields: [
    defineField({
      name: 'email',
      title: 'Email',
      type: 'email',
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
    }),
    defineField({
      name: 'image',
      title: 'Profile Image',
      type: 'url',
    }),
    defineField({
      name: 'role',
      title: 'Role',
      type: 'string',
      options: {
        list: [
          {title: 'Job Seeker', value: 'jobseeker'},
          {title: 'Employer', value: 'employer'},
          {title: 'Admin', value: 'admin'},
        ],
      },
      initialValue: 'jobseeker',
    }),
    defineField({
      name: 'companyId',
      title: 'Company ID',
      type: 'string',
      description: 'Reference to company document',
      hidden: ({document}) => document?.role !== 'employer',
    }),
    defineField({
      name: 'createdAt',
      title: 'Created At',
      type: 'datetime',
      readOnly: true,
    }),
  ],
})
```

### 5. Create Auth Provider

Create `components/Providers/AuthProvider.tsx`:

```typescript
'use client';

import { SessionProvider } from 'next-auth/react';
import { ReactNode } from 'react';

interface AuthProviderProps {
  children: ReactNode;
}

export default function AuthProvider({ children }: AuthProviderProps) {
  return <SessionProvider>{children}</SessionProvider>;
}
```

### 6. Update Root Layout

Update `app/layout.tsx`:

```typescript
import { Inter } from 'next/font/google';
import './globals.css';
import AuthProvider from '@/components/Providers/AuthProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Colorado Trades Jobs',
  description: 'Find blue-collar jobs in Colorado',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
```

### 7. Create Sign In Page

Create `app/auth/signin/page.tsx`:

```typescript
'use client';

import { signIn } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Icons } from '@/components/icons';
import Link from 'next/link';

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            Sign in to Colorado Trades Jobs
          </CardTitle>
          <CardDescription className="text-center">
            Choose your preferred sign-in method
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4">
            <Button
              variant="outline"
              onClick={() => signIn('google', { callbackUrl: '/dashboard' })}
              className="w-full"
            >
              <Icons.google className="mr-2 h-4 w-4" />
              Continue with Google
            </Button>
          </div>
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-muted-foreground">
                Or
              </span>
            </div>
          </div>

          <div className="text-center text-sm">
            <span className="text-muted-foreground">
              New to Colorado Trades Jobs?{' '}
            </span>
            <Link 
              href="/auth/signup" 
              className="text-primary underline underline-offset-4 hover:text-primary/80"
            >
              Create an account
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
```

### 8. Create Sign Up Page

Create `app/auth/signup/page.tsx`:

```typescript
'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Icons } from '@/components/icons';
import Link from 'next/link';

export default function SignUpPage() {
  const [userType, setUserType] = useState<'jobseeker' | 'employer'>('jobseeker');

  const handleSignUp = () => {
    // Store user type in session storage for post-auth setup
    sessionStorage.setItem('userType', userType);
    signIn('google', { callbackUrl: '/onboarding' });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            Create an account
          </CardTitle>
          <CardDescription className="text-center">
            Join Colorado Trades Jobs today
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <Label>I want to:</Label>
            <RadioGroup value={userType} onValueChange={(value: any) => setUserType(value)}>
              <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-gray-50">
                <RadioGroupItem value="jobseeker" id="jobseeker" />
                <Label htmlFor="jobseeker" className="flex-1 cursor-pointer">
                  <div className="font-medium">Find a job</div>
                  <div className="text-sm text-muted-foreground">
                    Browse and apply to blue-collar jobs
                  </div>
                </Label>
              </div>
              <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-gray-50">
                <RadioGroupItem value="employer" id="employer" />
                <Label htmlFor="employer" className="flex-1 cursor-pointer">
                  <div className="font-medium">Hire workers</div>
                  <div className="text-sm text-muted-foreground">
                    Post jobs and find qualified candidates
                  </div>
                </Label>
              </div>
            </RadioGroup>
          </div>

          <Button onClick={handleSignUp} className="w-full">
            <Icons.google className="mr-2 h-4 w-4" />
            Continue with Google
          </Button>

          <div className="text-center text-sm">
            <span className="text-muted-foreground">
              Already have an account?{' '}
            </span>
            <Link 
              href="/auth/signin" 
              className="text-primary underline underline-offset-4 hover:text-primary/80"
            >
              Sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
```

### 9. Create Custom Hook for Auth

Create `hooks/useAuth.ts`:

```typescript
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface UseAuthOptions {
  required?: boolean;
  redirectTo?: string;
  role?: 'jobseeker' | 'employer' | 'admin';
}

export function useAuth(options: UseAuthOptions = {}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { required = false, redirectTo = '/auth/signin', role } = options;

  useEffect(() => {
    if (required && status === 'unauthenticated') {
      router.push(redirectTo);
    }

    if (role && session?.user?.role !== role && status === 'authenticated') {
      router.push('/unauthorized');
    }
  }, [session, status, required, redirectTo, role, router]);

  return {
    user: session?.user,
    isLoading: status === 'loading',
    isAuthenticated: status === 'authenticated',
    role: session?.user?.role,
  };
}
```

### 10. Create Middleware for Protected Routes

Create `middleware.ts` in the root directory:

```typescript
import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // Redirect to onboarding if user hasn't completed setup
    if (token && !token.onboardingComplete && !path.startsWith('/onboarding')) {
      return NextResponse.redirect(new URL('/onboarding', req.url));
    }

    // Check role-based access
    if (path.startsWith('/dashboard') && token?.role === 'jobseeker') {
      return NextResponse.redirect(new URL('/jobs', req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const path = req.nextUrl.pathname;
        
        // Public paths
        if (path.startsWith('/auth') || path === '/' || path.startsWith('/jobs') || path.startswith('/companies')) {
          return true;
        }
        
        // Protected paths
        if (path.startsWith('/dashboard') || path.startsWith('/apply')) {
          return !!token;
        }
        
        return true;
      },
    },
  }
);

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
```

### 11. Create Auth Context for Client Components

Create `contexts/AuthContext.tsx`:

```typescript
'use client';

import { createContext, useContext, ReactNode } from 'react';
import { useSession } from 'next-auth/react';

interface AuthContextType {
  user: any;
  isLoading: boolean;
  isAuthenticated: boolean;
  isEmployer: boolean;
  isJobSeeker: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthContextProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();

  const value: AuthContextType = {
    user: session?.user,
    isLoading: status === 'loading',
    isAuthenticated: status === 'authenticated',
    isEmployer: session?.user?.role === 'employer',
    isJobSeeker: session?.user?.role === 'jobseeker',
    isAdmin: session?.user?.role === 'admin',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within AuthContextProvider');
  }
  return context;
}
```

### 12. Update NextAuth Types

Create `types/next-auth.d.ts`:

```typescript
import { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      role: 'jobseeker' | 'employer' | 'admin';
      companyId?: string;
    } & DefaultSession['user'];
  }

  interface User {
    role: 'jobseeker' | 'employer' | 'admin';
    companyId?: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: 'jobseeker' | 'employer' | 'admin';
    companyId?: string;
    onboardingComplete?: boolean;
  }
}
```

## Verification Steps

1. **Test Google Sign In:**
   - Click "Sign in with Google"
   - Should redirect to Google
   - Should return to callback URL

2. **Check Session:**
   ```typescript
   // Add to any page temporarily
   const { data: session } = useSession();
   console.log('Session:', session);
   ```

3. **Test Protected Routes:**
   - Try accessing `/dashboard` without auth
   - Should redirect to sign in

4. **Test Role-Based Access:**
   - Sign in as job seeker
   - Try accessing employer dashboard
   - Should redirect or show error

## Common Issues & Solutions

### Issue: Google OAuth redirect mismatch
**Solution:** Ensure redirect URIs in Google Console match exactly:
- `http://localhost:3000/api/auth/callback/google`
- Include both with and without trailing slash

### Issue: Session not persisting
**Solution:** Check NEXTAUTH_SECRET is set and consistent

### Issue: User not created in Sanity
**Solution:** Verify Sanity write permissions and user schema is deployed

## Next Steps

Proceed to [DOC-005: Sanity Client & Queries](doc-005-sanity-client.md) to set up data fetching.

## Notes for Claude Code

When implementing auth:
1. Test each provider separately
2. Verify Sanity user creation works
3. Check middleware catches all protected routes
4. Ensure types are properly extended