import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Building2, 
  MapPin, 
  Users, 
  Briefcase, 
  CheckCircle2,
  ExternalLink 
} from 'lucide-react';
import { Company } from '@/types';
import { urlFor } from '@/lib/sanity';

interface CompanyCardProps {
  company: Company;
}

export default function CompanyCard({ company }: CompanyCardProps) {
  return (
    <Card className="h-full hover:shadow-lg transition-shadow">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            {company.logo ? (
              <Image
                src={urlFor(company.logo).width(64).height(64).url()}
                alt={company.name}
                width={64}
                height={64}
                className="rounded-lg"
              />
            ) : (
              <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                <Building2 className="h-8 w-8 text-gray-400" />
              </div>
            )}
            <div>
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <Link
                  href={`/companies/${company.slug.current}`}
                  className="hover:text-blue-600 transition-colors"
                >
                  {company.name}
                </Link>
                {company.verified && (
                  <CheckCircle2 className="h-5 w-5 text-blue-500" />
                )}
              </h3>
              {company.size && (
                <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                  <Users className="h-4 w-4" />
                  {company.size} employees
                </p>
              )}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Locations */}
        {company.locations && company.locations.length > 0 && (
          <div className="flex items-start gap-2">
            <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
            <div className="flex flex-wrap gap-1">
              {company.locations.slice(0, 3).map((location, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {location.city}
                </Badge>
              ))}
              {company.locations.length > 3 && (
                <Badge variant="secondary" className="text-xs">
                  +{company.locations.length - 3} more
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Active Jobs */}
        <div className="flex items-center gap-2 text-sm">
          <Briefcase className="h-4 w-4 text-gray-400" />
          <span>
            <span className="font-medium">{company.jobCount || 0}</span> open positions
          </span>
        </div>

        {/* Benefits Preview */}
        {company.benefitsOffered && company.benefitsOffered.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {company.benefitsOffered.slice(0, 3).map((benefit) => (
              <Badge key={benefit} variant="outline" className="text-xs">
                {benefit}
              </Badge>
            ))}
            {company.benefitsOffered.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{company.benefitsOffered.length - 3}
              </Badge>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Link href={`/companies/${company.slug.current}`} className="flex-1">
            <Button variant="default" className="w-full">
              View Jobs
            </Button>
          </Link>
          {company.website && (
            <Button
              variant="outline"
              size="icon"
              onClick={() => window.open(company.website, '_blank')}
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}