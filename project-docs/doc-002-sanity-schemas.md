# DOC-002: Sanity Schema Setup

## Overview
Complete Sanity CMS setup with all schemas required for the job board.

## Prerequisites
- Sanity CLI installed globally: `npm install -g @sanity/cli`
- Sanity account (free at sanity.io)

## Steps

### 1. Create Sanity Studio Project

```bash
# In a separate directory from your Next.js project
cd ..
npm create sanity@latest -- --template clean --create-project "Colorado Job Board" --dataset production --typescript

# When prompted:
# - Project name: Colorado Job Board Studio
# - Use TypeScript: Yes
# - Package manager: npm
```

### 2. Project Structure

Your Sanity studio structure should look like:
```
colorado-job-board-studio/
├── schemas/
│   ├── index.ts
│   ├── documents/
│   │   ├── jobPosting.ts
│   │   ├── company.ts
│   │   ├── jobCategory.ts
│   │   └── jobApplication.ts
│   ├── objects/
│   │   ├── location.ts
│   │   ├── benefit.ts
│   │   └── contactInfo.ts
│   └── blocks/
│       └── blockContent.ts
├── sanity.config.ts
└── sanity.cli.ts
```

### 3. Create Schema Files

#### 3.1 Create Block Content Schema
`schemas/blocks/blockContent.ts`:

```typescript
import {defineType, defineArrayMember} from 'sanity'

export default defineType({
  title: 'Block Content',
  name: 'blockContent',
  type: 'array',
  of: [
    defineArrayMember({
      title: 'Block',
      type: 'block',
      styles: [
        {title: 'Normal', value: 'normal'},
        {title: 'H1', value: 'h1'},
        {title: 'H2', value: 'h2'},
        {title: 'H3', value: 'h3'},
        {title: 'H4', value: 'h4'},
        {title: 'Quote', value: 'blockquote'},
      ],
      lists: [{title: 'Bullet', value: 'bullet'}, {title: 'Number', value: 'number'}],
      marks: {
        decorators: [
          {title: 'Strong', value: 'strong'},
          {title: 'Emphasis', value: 'em'},
        ],
        annotations: [
          {
            title: 'URL',
            name: 'link',
            type: 'object',
            fields: [
              {
                title: 'URL',
                name: 'href',
                type: 'url',
              },
            ],
          },
        ],
      },
    }),
  ],
})
```

#### 3.2 Create Location Object
`schemas/objects/location.ts`:

```typescript
import {defineType} from 'sanity'

export default defineType({
  name: 'location',
  title: 'Location',
  type: 'object',
  fields: [
    {
      name: 'city',
      title: 'City',
      type: 'string',
      validation: Rule => Rule.required(),
    },
    {
      name: 'county',
      title: 'County',
      type: 'string',
    },
    {
      name: 'zipCode',
      title: 'ZIP Code',
      type: 'string',
      validation: Rule => Rule.regex(/^\d{5}(-\d{4})?$/, {
        name: 'zipCode',
        invert: false,
      }).error('Please enter a valid ZIP code'),
    },
    {
      name: 'coordinates',
      title: 'Coordinates',
      type: 'geopoint',
    },
  ],
})
```

#### 3.3 Create Job Category Schema
`schemas/documents/jobCategory.ts`:

```typescript
import {defineType, defineField} from 'sanity'

export default defineType({
  name: 'jobCategory',
  title: 'Job Category',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Category Name',
      type: 'string',
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'name',
        maxLength: 96,
      },
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'icon',
      title: 'Icon',
      type: 'image',
      options: {
        hotspot: true,
      },
    }),
    defineField({
      name: 'orderRank',
      title: 'Order',
      type: 'number',
      hidden: true,
    }),
  ],
  preview: {
    select: {
      title: 'name',
      media: 'icon',
    },
  },
})
```

#### 3.4 Create Company Schema
`schemas/documents/company.ts`:

```typescript
import {defineType, defineField} from 'sanity'

export default defineType({
  name: 'company',
  title: 'Company',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Company Name',
      type: 'string',
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'name',
        maxLength: 96,
      },
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'logo',
      title: 'Company Logo',
      type: 'image',
      options: {
        hotspot: true,
      },
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'blockContent',
    }),
    defineField({
      name: 'website',
      title: 'Website',
      type: 'url',
    }),
    defineField({
      name: 'email',
      title: 'Contact Email',
      type: 'email',
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'phone',
      title: 'Phone Number',
      type: 'string',
    }),
    defineField({
      name: 'size',
      title: 'Company Size',
      type: 'string',
      options: {
        list: [
          {title: '1-10 employees', value: '1-10'},
          {title: '11-50 employees', value: '11-50'},
          {title: '51-200 employees', value: '51-200'},
          {title: '200+ employees', value: '200+'},
        ],
      },
    }),
    defineField({
      name: 'locations',
      title: 'Locations',
      type: 'array',
      of: [{type: 'location'}],
    }),
    defineField({
      name: 'benefitsOffered',
      title: 'Benefits Offered',
      type: 'array',
      of: [{type: 'string'}],
      options: {
        layout: 'tags',
      },
    }),
    defineField({
      name: 'verified',
      title: 'Verified Company',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'ownerId',
      title: 'Owner ID',
      type: 'string',
      description: 'NextAuth User ID',
    }),
    defineField({
      name: 'createdAt',
      title: 'Created At',
      type: 'datetime',
      readOnly: true,
    }),
  ],
  preview: {
    select: {
      title: 'name',
      subtitle: 'size',
      media: 'logo',
      verified: 'verified',
    },
    prepare(selection) {
      const {title, subtitle, media, verified} = selection
      return {
        title: verified ? `${title} ✓` : title,
        subtitle,
        media,
      }
    },
  },
})
```

#### 3.5 Create Job Posting Schema
`schemas/documents/jobPosting.ts`:

```typescript
import {defineType, defineField} from 'sanity'

export default defineType({
  name: 'jobPosting',
  title: 'Job Posting',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Job Title',
      type: 'string',
      validation: Rule => Rule.required().min(5).max(100),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'company',
      title: 'Company',
      type: 'reference',
      to: [{type: 'company'}],
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Job Description',
      type: 'blockContent',
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'requirements',
      title: 'Requirements',
      type: 'text',
      rows: 6,
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'responsibilities',
      title: 'Responsibilities',
      type: 'text',
      rows: 6,
    }),
    defineField({
      name: 'salaryType',
      title: 'Salary Type',
      type: 'string',
      options: {
        list: [
          {title: 'Hourly', value: 'hourly'},
          {title: 'Annual Salary', value: 'salary'},
          {title: 'Contract', value: 'contract'},
        ],
      },
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'salaryMin',
      title: 'Minimum Salary',
      type: 'number',
      validation: Rule => Rule.positive(),
    }),
    defineField({
      name: 'salaryMax',
      title: 'Maximum Salary',
      type: 'number',
      validation: Rule => Rule.positive(),
    }),
    defineField({
      name: 'showSalary',
      title: 'Show Salary on Listing',
      type: 'boolean',
      initialValue: true,
    }),
    defineField({
      name: 'location',
      title: 'Job Location',
      type: 'location',
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'remoteOptions',
      title: 'Remote Options',
      type: 'string',
      options: {
        list: [
          {title: 'On-site only', value: 'onsite'},
          {title: 'Remote available', value: 'remote'},
          {title: 'Hybrid', value: 'hybrid'},
        ],
      },
      initialValue: 'onsite',
    }),
    defineField({
      name: 'jobType',
      title: 'Job Type',
      type: 'string',
      options: {
        list: [
          {title: 'Full-time', value: 'full-time'},
          {title: 'Part-time', value: 'part-time'},
          {title: 'Contract', value: 'contract'},
          {title: 'Temporary', value: 'temporary'},
        ],
      },
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'reference',
      to: [{type: 'jobCategory'}],
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'experienceLevel',
      title: 'Experience Level',
      type: 'string',
      options: {
        list: [
          {title: 'Entry Level', value: 'entry'},
          {title: 'Intermediate', value: 'intermediate'},
          {title: 'Experienced', value: 'experienced'},
          {title: 'Senior', value: 'senior'},
        ],
      },
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'benefits',
      title: 'Benefits',
      type: 'array',
      of: [{type: 'string'}],
      options: {
        layout: 'tags',
      },
    }),
    defineField({
      name: 'skills',
      title: 'Required Skills',
      type: 'array',
      of: [{type: 'string'}],
      options: {
        layout: 'tags',
      },
    }),
    defineField({
      name: 'certifications',
      title: 'Required Certifications',
      type: 'array',
      of: [{type: 'string'}],
      options: {
        layout: 'tags',
      },
    }),
    defineField({
      name: 'applicationDeadline',
      title: 'Application Deadline',
      type: 'date',
    }),
    defineField({
      name: 'startDate',
      title: 'Start Date',
      type: 'date',
      description: 'When the position needs to be filled',
    }),
    defineField({
      name: 'isUrgent',
      title: 'Urgent Hire',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'featured',
      title: 'Featured Listing',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      options: {
        list: [
          {title: 'Draft', value: 'draft'},
          {title: 'Published', value: 'published'},
          {title: 'Expired', value: 'expired'},
          {title: 'Filled', value: 'filled'},
        ],
      },
      initialValue: 'draft',
    }),
    defineField({
      name: 'viewCount',
      title: 'View Count',
      type: 'number',
      initialValue: 0,
      readOnly: true,
    }),
    defineField({
      name: 'applicationCount',
      title: 'Application Count',
      type: 'number',
      initialValue: 0,
      readOnly: true,
    }),
    defineField({
      name: 'publishedAt',
      title: 'Published At',
      type: 'datetime',
    }),
    defineField({
      name: 'expiresAt',
      title: 'Expires At',
      type: 'datetime',
    }),
  ],
  preview: {
    select: {
      title: 'title',
      company: 'company.name',
      status: 'status',
      urgent: 'isUrgent',
      featured: 'featured',
    },
    prepare(selection) {
      const {title, company, status, urgent, featured} = selection
      let statusEmoji = status === 'published' ? '🟢' : status === 'draft' ? '🟡' : '🔴'
      let badges = []
      if (urgent) badges.push('🚨')
      if (featured) badges.push('⭐')
      
      return {
        title: `${statusEmoji} ${title} ${badges.join(' ')}`,
        subtitle: company || 'No company assigned',
      }
    },
  },
})
```

#### 3.6 Create Job Application Schema
`schemas/documents/jobApplication.ts`:

```typescript
import {defineType, defineField} from 'sanity'

export default defineType({
  name: 'jobApplication',
  title: 'Job Application',
  type: 'document',
  fields: [
    defineField({
      name: 'job',
      title: 'Job Posting',
      type: 'reference',
      to: [{type: 'jobPosting'}],
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'applicantInfo',
      title: 'Applicant Information',
      type: 'object',
      fields: [
        {
          name: 'name',
          title: 'Full Name',
          type: 'string',
          validation: Rule => Rule.required(),
        },
        {
          name: 'email',
          title: 'Email',
          type: 'email',
          validation: Rule => Rule.required(),
        },
        {
          name: 'phone',
          title: 'Phone Number',
          type: 'string',
          validation: Rule => Rule.required(),
        },
        {
          name: 'resumeUrl',
          title: 'Resume URL',
          type: 'url',
        },
        {
          name: 'linkedIn',
          title: 'LinkedIn Profile',
          type: 'url',
        },
      ],
    }),
    defineField({
      name: 'coverMessage',
      title: 'Cover Message',
      type: 'text',
      rows: 6,
    }),
    defineField({
      name: 'status',
      title: 'Application Status',
      type: 'string',
      options: {
        list: [
          {title: 'New', value: 'new'},
          {title: 'Reviewed', value: 'reviewed'},
          {title: 'Interviewing', value: 'interviewing'},
          {title: 'Hired', value: 'hired'},
          {title: 'Rejected', value: 'rejected'},
        ],
      },
      initialValue: 'new',
    }),
    defineField({
      name: 'rating',
      title: 'Applicant Rating',
      type: 'number',
      options: {
        list: [1, 2, 3, 4, 5],
      },
    }),
    defineField({
      name: 'appliedDate',
      title: 'Applied Date',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
      readOnly: true,
    }),
    defineField({
      name: 'employerNotes',
      title: 'Internal Notes',
      type: 'text',
      rows: 4,
      description: 'Private notes about this applicant (not visible to applicant)',
    }),
    defineField({
      name: 'interviewDate',
      title: 'Interview Date',
      type: 'datetime',
    }),
  ],
  preview: {
    select: {
      name: 'applicantInfo.name',
      job: 'job.title',
      status: 'status',
      date: 'appliedDate',
    },
    prepare(selection) {
      const {name, job, status, date} = selection
      const statusEmoji = {
        new: '🆕',
        reviewed: '👀',
        interviewing: '💬',
        hired: '✅',
        rejected: '❌',
      }[status] || '❓'
      
      return {
        title: `${statusEmoji} ${name}`,
        subtitle: `${job} - ${new Date(date).toLocaleDateString()}`,
      }
    },
  },
})
```

### 4. Update Schema Index
`schemas/index.ts`:

```typescript
// Documents
import company from './documents/company'
import jobPosting from './documents/jobPosting'
import jobCategory from './documents/jobCategory'
import jobApplication from './documents/jobApplication'

// Objects
import location from './objects/location'

// Blocks
import blockContent from './blocks/blockContent'

export const schemaTypes = [
  // Documents
  company,
  jobPosting,
  jobCategory,
  jobApplication,
  
  // Objects
  location,
  
  // Blocks
  blockContent,
]
```

### 5. Configure Sanity Studio
Update `sanity.config.ts`:

```typescript
import {defineConfig} from 'sanity'
import {deskTool} from 'sanity/desk'
import {visionTool} from '@sanity/vision'
import {schemaTypes} from './schemas'

export default defineConfig({
  name: 'default',
  title: 'Colorado Job Board',

  projectId: process.env.SANITY_STUDIO_PROJECT_ID!,
  dataset: 'production',

  plugins: [
    deskTool({
      structure: (S) =>
        S.list()
          .title('Content')
          .items([
            S.listItem()
              .title('Job Postings')
              .child(
                S.documentList()
                  .title('Job Postings')
                  .filter('_type == "jobPosting"')
              ),
            S.listItem()
              .title('Applications')
              .child(
                S.documentList()
                  .title('Applications')
                  .filter('_type == "jobApplication"')
              ),
            S.listItem()
              .title('Companies')
              .child(
                S.documentList()
                  .title('Companies')
                  .filter('_type == "company"')
              ),
            S.listItem()
              .title('Categories')
              .child(
                S.documentList()
                  .title('Job Categories')
                  .filter('_type == "jobCategory"')
              ),
          ]),
    }),
    visionTool(),
  ],

  schema: {
    types: schemaTypes,
  },
})
```

### 6. Add Sample Data Script
Create `scripts/seedData.ts`:

```typescript
// This script adds initial categories to your Sanity dataset
import {createClient} from '@sanity/client'

const client = createClient({
  projectId: 'your-project-id',
  dataset: 'production',
  apiVersion: '2024-01-01',
  token: 'your-token', // Need write access
  useCdn: false,
})

const categories = [
  { name: 'Construction', slug: 'construction', description: 'General construction and building trades' },
  { name: 'Electrical', slug: 'electrical', description: 'Electrical installation and maintenance' },
  { name: 'Plumbing', slug: 'plumbing', description: 'Plumbing and pipefitting' },
  { name: 'HVAC', slug: 'hvac', description: 'Heating, ventilation, and air conditioning' },
  { name: 'Manufacturing', slug: 'manufacturing', description: 'Manufacturing and production' },
  { name: 'Welding', slug: 'welding', description: 'Welding and metalwork' },
  { name: 'Trucking', slug: 'trucking', description: 'Transportation and logistics' },
  { name: 'Warehouse', slug: 'warehouse', description: 'Warehouse and distribution' },
  { name: 'Landscaping', slug: 'landscaping', description: 'Landscaping and grounds maintenance' },
  { name: 'Automotive', slug: 'automotive', description: 'Auto repair and maintenance' },
]

async function seedCategories() {
  console.log('Seeding categories...')
  
  for (const category of categories) {
    try {
      await client.create({
        _type: 'jobCategory',
        name: category.name,
        slug: { current: category.slug },
        description: category.description,
      })
      console.log(`Created category: ${category.name}`)
    } catch (error) {
      console.error(`Error creating category ${category.name}:`, error)
    }
  }
  
  console.log('Seeding complete!')
}

seedCategories()
```

### 7. Deploy Sanity Studio

```bash
# In your sanity studio directory
npm run build
sanity deploy

# Choose a unique URL like: colorado-jobs-studio
```

### 8. Create API Token

1. Go to https://www.sanity.io/manage
2. Select your project
3. Go to API → Tokens
4. Add API token:
   - Name: "Next.js Development"
   - Permissions: Editor
   - Copy the token for your .env.local

## Verification Steps

1. **Access Studio:**
   Visit `https://[your-studio-name].sanity.studio`

2. **Create Test Data:**
   - Add at least one job category
   - Create a test company
   - Create a test job posting

3. **Test GROQ Queries:**
   Use Vision plugin to test:
   ```groq
   *[_type == "jobPosting" && status == "published"]
   ```

## Common Issues & Solutions

### Issue: Cannot create documents
**Solution:** Check API token has write permissions

### Issue: References not working
**Solution:** Ensure referenced documents exist first

### Issue: Validation errors
**Solution:** Check all required fields are filled

## Next Steps

Proceed to [DOC-003: Environment Configuration](doc-003-environment.md) to set up your environment variables.

## Notes for Claude Code

When implementing schemas:
1. Create all schemas in the exact order shown
2. Deploy after creating all schemas
3. Test each document type in the studio
4. Keep the studio URL handy for content management