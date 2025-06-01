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