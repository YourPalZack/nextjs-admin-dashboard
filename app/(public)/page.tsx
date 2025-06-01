import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Briefcase, Building2, MapPin, Search, Shield, Users } from "lucide-react";

export default function HomePage() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-blue-50 to-white dark:from-blue-950 dark:to-background">
        <div className="container px-4 py-16 md:py-24">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="mb-6 text-4xl font-bold tracking-tight md:text-6xl">
              Find Blue-Collar Jobs in Colorado
            </h1>
            <p className="mb-8 text-lg text-muted-foreground md:text-xl">
              The premier destination for skilled trade professionals to find employment 
              opportunities in construction, manufacturing, transportation, and more.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Button size="lg" asChild>
                <Link href="/jobs">
                  <Search className="mr-2 h-5 w-5" />
                  Browse Jobs
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/dashboard">
                  <Building2 className="mr-2 h-5 w-5" />
                  Post a Job
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24">
        <div className="container px-4">
          <div className="mx-auto max-w-3xl text-center mb-12">
            <h2 className="mb-4 text-3xl font-bold">Why Choose Colorado Job Board?</h2>
            <p className="text-lg text-muted-foreground">
              Built specifically for Colorado&apos;s blue-collar workforce
            </p>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <MapPin className="mb-2 h-8 w-8 text-primary" />
                <CardTitle>Local Focus</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Exclusively featuring jobs in Colorado, from Denver to the Western Slope
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Briefcase className="mb-2 h-8 w-8 text-primary" />
                <CardTitle>Trade-Specific</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Tailored for construction, manufacturing, transportation, and skilled trades
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Users className="mb-2 h-8 w-8 text-primary" />
                <CardTitle>Direct Connection</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Connect directly with employers - no recruitment agencies or middlemen
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Shield className="mb-2 h-8 w-8 text-primary" />
                <CardTitle>Verified Employers</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  All employers are verified to ensure legitimate job opportunities
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Search className="mb-2 h-8 w-8 text-primary" />
                <CardTitle>Easy Search</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Simple, mobile-friendly search designed for workers on the go
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <ArrowRight className="mb-2 h-8 w-8 text-primary" />
                <CardTitle>Quick Apply</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  One-click applications with saved profiles - no complex forms
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Job Categories */}
      <section className="bg-muted/50 py-16 md:py-24">
        <div className="container px-4">
          <div className="mx-auto max-w-3xl text-center mb-12">
            <h2 className="mb-4 text-3xl font-bold">Popular Job Categories</h2>
            <p className="text-lg text-muted-foreground">
              Find opportunities in your trade
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {[
              "Construction",
              "Electrical",
              "Plumbing",
              "HVAC",
              "Manufacturing",
              "Welding",
              "Trucking",
              "Warehouse",
              "Landscaping",
              "Automotive",
              "Maintenance",
              "Equipment Operation"
            ].map((category) => (
              <Button
                key={category}
                variant="outline"
                className="h-auto justify-start p-4"
                asChild
              >
                <Link href={`/jobs?category=${category.toLowerCase()}`}>
                  {category}
                </Link>
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24">
        <div className="container px-4">
          <Card className="mx-auto max-w-2xl text-center">
            <CardHeader>
              <CardTitle className="text-3xl">Ready to Find Your Next Job?</CardTitle>
              <CardDescription className="text-lg">
                Join thousands of skilled workers finding great opportunities in Colorado
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
                <Button size="lg" asChild>
                  <Link href="/jobs">Start Your Job Search</Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="/auth/signin">Create Free Account</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </>
  );
}