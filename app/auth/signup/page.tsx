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