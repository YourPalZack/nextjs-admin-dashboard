'use client';

import Image from 'next/image';
import { PortableText } from '@portabletext/react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Building2,
  MapPin,
  Users,
  Globe,
  Mail,
  Phone,
  CheckCircle2,
  Calendar,
  Briefcase,
} from 'lucide-react';
import { Company } from '@/types';
import { urlFor } from '@/lib/sanity';
import { format } from 'date-fns';
import CompanyFollowButton from './CompanyFollowButton';

interface CompanyDetailContentProps {
  company: Company;
}

export default function CompanyDetailContent({ company }: CompanyDetailContentProps) {
  const handleWebsiteClick = () => {
    if (company.website) {
      window.open(company.website, '_blank');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card>
        <CardContent className="p-8">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Logo */}
            <div className="flex-shrink-0">
              {company.logo ? (
                <Image
                  src={urlFor(company.logo).width(120).height(120).url()}
                  alt={company.name}
                  width={120}
                  height={120}
                  className="rounded-lg"
                />
              ) : (
                <div className="w-30 h-30 bg-gray-100 rounded-lg flex items-center justify-center">
                  <Building2 className="h-12 w-12 text-gray-400" />
                </div>
              )}
            </div>

            {/* Company Info */}
            <div className="flex-1 space-y-4">
              <div>
                <h1 className="text-3xl font-bold flex items-center gap-3">
                  {company.name}
                  {company.verified && (
                    <Badge variant="default" className="gap-1">
                      <CheckCircle2 className="h-4 w-4" />
                      Verified Employer
                    </Badge>
                  )}
                </h1>
                
                {/* Quick Stats */}
                <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-600">
                  {company.size && (
                    <span className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {company.size} employees
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Briefcase className="h-4 w-4" />
                    {company.jobCount || 0} open positions
                  </span>
                  {company.createdAt && (
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      Member since {format(new Date(company.createdAt), 'yyyy')}
                    </span>
                  )}
                </div>
              </div>

              {/* Contact Info */}
              <div className="flex flex-wrap gap-4">
                <CompanyFollowButton
                  companyId={company._id}
                  companyName={company.name}
                  size="default"
                />
                {company.website && (
                  <Button variant="outline" onClick={handleWebsiteClick}>
                    <Globe className="h-4 w-4 mr-2" />
                    Visit Website
                  </Button>
                )}
                {company.email && (
                  <Button variant="outline" onClick={() => window.location.href = `mailto:${company.email}`}>
                    <Mail className="h-4 w-4 mr-2" />
                    Contact
                  </Button>
                )}
                {company.phone && (
                  <Button variant="outline" onClick={() => window.location.href = `tel:${company.phone}`}>
                    <Phone className="h-4 w-4 mr-2" />
                    {company.phone}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* About Section */}
      {company.description && (
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold">About {company.name}</h2>
          </CardHeader>
          <CardContent>
            <div className="prose prose-gray max-w-none">
              <PortableText value={company.description} />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Locations */}
      {company.locations && company.locations.length > 0 && (
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold">Locations</h2>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {company.locations.map((location, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-4 border rounded-lg"
                >
                  <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="font-medium">{location.city}</p>
                    {location.state && (
                      <p className="text-sm text-gray-600">
                        {location.state} {location.zipCode}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Benefits */}
      {company.benefitsOffered && company.benefitsOffered.length > 0 && (
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold">Benefits & Perks</h2>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {company.benefitsOffered.map((benefit) => (
                <div key={benefit} className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                  <span>{benefit}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Company Culture (if you add this to schema) */}
      {company.activeJobs && company.activeJobs.length > 0 && (
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold">Currently Hiring For</h2>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {Array.from(new Set(company.activeJobs.map(job => job.category?.name))).filter(Boolean).map((categoryName) => (
                <Badge key={categoryName} variant="secondary">
                  {categoryName}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}