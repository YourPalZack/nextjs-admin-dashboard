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
        if (path.startsWith('/auth') || path === '/' || path.startsWith('/jobs') || path.startsWith('/companies')) {
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