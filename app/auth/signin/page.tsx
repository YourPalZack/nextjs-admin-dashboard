import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function SignInPage() {
  return (
    <div className="container flex items-center justify-center min-h-[calc(100vh-4rem)] py-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Sign In</CardTitle>
          <CardDescription>
            Choose your account type to continue
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button className="w-full" variant="outline" size="lg">
            Continue with Google
          </Button>
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or continue as
              </span>
            </div>
          </div>

          <div className="grid gap-4">
            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <h3 className="font-semibold mb-2">Job Seeker</h3>
                <p className="text-sm text-muted-foreground">
                  Find and apply for blue-collar jobs across Colorado
                </p>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <h3 className="font-semibold mb-2">Employer</h3>
                <p className="text-sm text-muted-foreground">
                  Post jobs and manage applications from skilled workers
                </p>
              </CardContent>
            </Card>
          </div>
        </CardContent>
        <CardFooter>
          <p className="text-sm text-muted-foreground text-center w-full">
            Don&apos;t have an account?{" "}
            <Link href="/auth/signup" className="text-primary hover:underline">
              Sign up
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}