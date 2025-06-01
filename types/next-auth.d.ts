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