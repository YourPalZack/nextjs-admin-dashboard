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