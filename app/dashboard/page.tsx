import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Briefcase, 
  FileText, 
  Eye, 
  TrendingUp,
  Plus,
  ArrowUpRight,
  Users,
  DollarSign,
  Building2
} from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  // Mock data - will be replaced with real data
  const stats = {
    activeJobs: 3,
    totalApplications: 47,
    viewsThisMonth: 1234,
    hiredThisMonth: 2
  };

  const recentApplications = [
    {
      id: 1,
      applicantName: "John Smith",
      jobTitle: "Construction Foreman",
      appliedAt: "2 hours ago",
      status: "new"
    },
    {
      id: 2,
      applicantName: "Maria Garcia",
      jobTitle: "Electrician",
      appliedAt: "5 hours ago",
      status: "reviewed"
    },
    {
      id: 3,
      applicantName: "Robert Johnson",
      jobTitle: "Construction Foreman",
      appliedAt: "1 day ago",
      status: "interviewing"
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here&apos;s what&apos;s happening with your job postings.
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/jobs/new">
            <Plus className="mr-2 h-4 w-4" />
            Post New Job
          </Link>
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Jobs</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeJobs}</div>
            <p className="text-xs text-muted-foreground">
              +1 from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalApplications}</div>
            <p className="text-xs text-muted-foreground">
              +23% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Views This Month</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.viewsThisMonth.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              +12% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hired This Month</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.hiredThisMonth}</div>
            <p className="text-xs text-muted-foreground">
              Great hiring rate!
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Applications */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Recent Applications</CardTitle>
              <CardDescription>
                Latest applications to your job postings
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href="/dashboard/applications">
                View All
                <ArrowUpRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentApplications.map((application) => (
              <div
                key={application.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="space-y-1">
                  <p className="font-medium">{application.applicantName}</p>
                  <p className="text-sm text-muted-foreground">
                    Applied for {application.jobTitle}
                  </p>
                </div>
                <div className="text-right space-y-1">
                  <p className="text-sm text-muted-foreground">
                    {application.appliedAt}
                  </p>
                  <span className={cn(
                    "text-xs px-2 py-1 rounded-full",
                    application.status === "new" && "bg-blue-100 text-blue-700",
                    application.status === "reviewed" && "bg-yellow-100 text-yellow-700",
                    application.status === "interviewing" && "bg-green-100 text-green-700"
                  )}>
                    {application.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2">
            <Button variant="outline" className="justify-start" asChild>
              <Link href="/dashboard/jobs/new">
                <Plus className="mr-2 h-4 w-4" />
                Post a New Job
              </Link>
            </Button>
            <Button variant="outline" className="justify-start" asChild>
              <Link href="/dashboard/company">
                <Building2 className="mr-2 h-4 w-4" />
                Update Company Profile
              </Link>
            </Button>
            <Button variant="outline" className="justify-start" asChild>
              <Link href="/dashboard/analytics">
                <TrendingUp className="mr-2 h-4 w-4" />
                View Analytics
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Billing Summary</CardTitle>
            <CardDescription>Current billing period</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Job Posts Used</span>
                <span className="font-medium">3 / 10</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Featured Listings</span>
                <span className="font-medium">1</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Current Plan</span>
                <span className="font-medium">Basic</span>
              </div>
              <Button variant="outline" className="w-full mt-4">
                Upgrade Plan
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Helper function for className
function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}