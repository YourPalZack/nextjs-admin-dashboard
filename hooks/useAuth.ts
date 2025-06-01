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