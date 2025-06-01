import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, DollarSign, Clock, Building2, ChevronRight } from "lucide-react";
import Link from "next/link";

// Mock data for now - will be replaced with Sanity data
const mockJobs = [
  {
    _id: "1",
    title: "Construction Foreman",
    company: { name: "ABC Construction", verified: true },
    location: { city: "Denver", county: "Denver County" },
    salaryType: "hourly",
    salaryMin: 35,
    salaryMax: 45,
    jobType: "full-time",
    experienceLevel: "experienced",
    isUrgent: true,
    publishedAt: new Date().toISOString(),
    slug: { current: "construction-foreman-abc" }
  },
  {
    _id: "2",
    title: "Electrician",
    company: { name: "Lightning Electric Co.", verified: true },
    location: { city: "Boulder", county: "Boulder County" },
    salaryType: "hourly",
    salaryMin: 28,
    salaryMax: 38,
    jobType: "full-time",
    experienceLevel: "intermediate",
    isUrgent: false,
    publishedAt: new Date().toISOString(),
    slug: { current: "electrician-lightning" }
  },
  {
    _id: "3",
    title: "HVAC Technician",
    company: { name: "Cool Air Services", verified: false },
    location: { city: "Colorado Springs", county: "El Paso County" },
    salaryType: "hourly",
    salaryMin: 25,
    salaryMax: 35,
    jobType: "full-time",
    experienceLevel: "entry",
    isUrgent: false,
    publishedAt: new Date().toISOString(),
    slug: { current: "hvac-tech-cool-air" }
  },
];

export default function JobsPage() {
  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Blue-Collar Jobs in Colorado</h1>
        <p className="text-muted-foreground">
          {mockJobs.length} jobs available
        </p>
      </div>

      {/* Search and filters will go here */}
      <div className="mb-8 p-4 bg-muted/50 rounded-lg">
        <p className="text-sm text-muted-foreground">Search and filters coming soon...</p>
      </div>

      {/* Job listings */}
      <div className="grid gap-4">
        {mockJobs.map((job) => (
          <Card key={job._id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-xl">
                    {job.title}
                    {job.isUrgent && (
                      <span className="ml-2 text-xs bg-red-100 text-red-700 px-2 py-1 rounded">
                        Urgent
                      </span>
                    )}
                  </CardTitle>
                  <CardDescription className="flex items-center gap-1 mt-1">
                    <Building2 className="h-4 w-4" />
                    {job.company.name}
                    {job.company.verified && (
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                        Verified
                      </span>
                    )}
                  </CardDescription>
                </div>
                <Button variant="ghost" size="icon" asChild>
                  <Link href={`/jobs/${job.slug.current}`}>
                    <ChevronRight className="h-5 w-5" />
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>{job.location.city}, CO</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <DollarSign className="h-4 w-4" />
                  <span>
                    ${job.salaryMin}-${job.salaryMax}/hr
                  </span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span className="capitalize">{job.jobType}</span>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="text-xs bg-muted px-2 py-1 rounded capitalize">
                  {job.experienceLevel} level
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pagination will go here */}
      <div className="mt-8 flex justify-center">
        <Button variant="outline">Load More Jobs</Button>
      </div>
    </div>
  );
}