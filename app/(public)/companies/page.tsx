import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building2, MapPin, Users, CheckCircle } from "lucide-react";
import Link from "next/link";

// Mock data for now - will be replaced with Sanity data
const mockCompanies = [
  {
    _id: "1",
    name: "ABC Construction",
    slug: { current: "abc-construction" },
    description: "Leading construction company in Denver specializing in commercial and residential projects.",
    size: "51-200",
    locations: [{ city: "Denver", state: "CO" }],
    verified: true,
    jobCount: 5
  },
  {
    _id: "2",
    name: "Lightning Electric Co.",
    slug: { current: "lightning-electric" },
    description: "Full-service electrical contractor serving the Boulder area for over 20 years.",
    size: "11-50",
    locations: [{ city: "Boulder", state: "CO" }],
    verified: true,
    jobCount: 3
  },
  {
    _id: "3",
    name: "Cool Air Services",
    slug: { current: "cool-air-services" },
    description: "HVAC installation and maintenance throughout Colorado Springs.",
    size: "11-50",
    locations: [{ city: "Colorado Springs", state: "CO" }],
    verified: false,
    jobCount: 2
  },
];

export default function CompaniesPage() {
  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Companies Hiring in Colorado</h1>
        <p className="text-muted-foreground">
          Discover employers looking for skilled trade professionals
        </p>
      </div>

      {/* Search will go here */}
      <div className="mb-8 p-4 bg-muted/50 rounded-lg">
        <p className="text-sm text-muted-foreground">Company search coming soon...</p>
      </div>

      {/* Company listings */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {mockCompanies.map((company) => (
          <Card key={company._id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <Building2 className="h-8 w-8 text-muted-foreground" />
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {company.name}
                      {company.verified && (
                        <CheckCircle className="h-5 w-5 text-blue-600" />
                      )}
                    </CardTitle>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <CardDescription className="line-clamp-2">
                {company.description}
              </CardDescription>
              
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span>{company.size} employees</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span>
                    {company.locations.map(loc => `${loc.city}, ${loc.state}`).join(" • ")}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-sm font-medium">
                  {company.jobCount} open positions
                </span>
                <Button size="sm" asChild>
                  <Link href={`/companies/${company.slug.current}`}>
                    View Jobs
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}