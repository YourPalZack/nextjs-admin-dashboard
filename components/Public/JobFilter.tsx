'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { JobCategory } from '@/types';
import { useState } from 'react';

interface JobFilterProps {
  categories: JobCategory[];
  currentFilters: any;
  onFilterChange: (filterType: string, value: string) => void;
  totalJobs: number;
}

const locations = [
  'Denver',
  'Colorado Springs',
  'Aurora',
  'Fort Collins',
  'Lakewood',
  'Thornton',
  'Westminster',
  'Pueblo',
  'Boulder',
  'Greeley',
];

const jobTypes = [
  { value: 'full-time', label: 'Full-time' },
  { value: 'part-time', label: 'Part-time' },
  { value: 'contract', label: 'Contract' },
  { value: 'temporary', label: 'Temporary' },
];

const experienceLevels = [
  { value: 'entry', label: 'Entry Level' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'experienced', label: 'Experienced' },
  { value: 'senior', label: 'Senior' },
];

export default function JobFilter({
  categories,
  currentFilters,
  onFilterChange,
  totalJobs,
}: JobFilterProps) {
  const [salaryMin, setSalaryMin] = useState(currentFilters.salaryMin || 0);

  const handleSalaryChange = (value: number[]) => {
    setSalaryMin(value[0]);
  };

  const handleSalaryCommit = () => {
    onFilterChange('salaryMin', salaryMin.toString());
  };

  return (
    <div className="space-y-6">
      {/* Results Count */}
      <Card>
        <CardContent className="p-4">
          <p className="text-sm text-gray-600">
            Showing <span className="font-semibold">{totalJobs}</span> jobs
          </p>
        </CardContent>
      </Card>

      {/* Category Filter */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Category</CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={currentFilters.category}
            onValueChange={(value) => onFilterChange('category', value)}
          >
            <div className="flex items-center space-x-2 mb-2">
              <RadioGroupItem value="" id="all-categories" />
              <Label htmlFor="all-categories" className="font-normal cursor-pointer">
                All Categories
              </Label>
            </div>
            {categories.map((category) => (
              <div key={category._id} className="flex items-center space-x-2 mb-2">
                <RadioGroupItem value={category.slug.current} id={category._id} />
                <Label htmlFor={category._id} className="font-normal cursor-pointer">
                  {category.name}
                  {category.jobCount && category.jobCount > 0 && (
                    <span className="text-gray-500 ml-1">({category.jobCount})</span>
                  )}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Location Filter */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Location</CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={currentFilters.location}
            onValueChange={(value) => onFilterChange('location', value)}
          >
            <div className="flex items-center space-x-2 mb-2">
              <RadioGroupItem value="" id="all-locations" />
              <Label htmlFor="all-locations" className="font-normal cursor-pointer">
                All Locations
              </Label>
            </div>
            {locations.map((location) => (
              <div key={location} className="flex items-center space-x-2 mb-2">
                <RadioGroupItem value={location} id={location} />
                <Label htmlFor={location} className="font-normal cursor-pointer">
                  {location}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Job Type Filter */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Job Type</CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={currentFilters.jobType}
            onValueChange={(value) => onFilterChange('jobType', value)}
          >
            <div className="flex items-center space-x-2 mb-2">
              <RadioGroupItem value="" id="all-types" />
              <Label htmlFor="all-types" className="font-normal cursor-pointer">
                All Types
              </Label>
            </div>
            {jobTypes.map((type) => (
              <div key={type.value} className="flex items-center space-x-2 mb-2">
                <RadioGroupItem value={type.value} id={type.value} />
                <Label htmlFor={type.value} className="font-normal cursor-pointer">
                  {type.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Experience Level */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Experience Level</CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={currentFilters.experienceLevel}
            onValueChange={(value) => onFilterChange('experienceLevel', value)}
          >
            <div className="flex items-center space-x-2 mb-2">
              <RadioGroupItem value="" id="all-levels" />
              <Label htmlFor="all-levels" className="font-normal cursor-pointer">
                All Levels
              </Label>
            </div>
            {experienceLevels.map((level) => (
              <div key={level.value} className="flex items-center space-x-2 mb-2">
                <RadioGroupItem value={level.value} id={level.value} />
                <Label htmlFor={level.value} className="font-normal cursor-pointer">
                  {level.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Salary Filter */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Minimum Salary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between text-sm">
              <span>$0</span>
              <span className="font-medium">
                ${salaryMin.toLocaleString()}/hr
              </span>
            </div>
            <Slider
              value={[salaryMin]}
              onValueChange={handleSalaryChange}
              onValueCommit={handleSalaryCommit}
              min={0}
              max={100}
              step={5}
              className="w-full"
            />
            <p className="text-xs text-gray-500">
              Drag to set minimum hourly rate
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}