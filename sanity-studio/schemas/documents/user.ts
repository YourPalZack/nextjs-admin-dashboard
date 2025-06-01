import {defineType, defineField} from 'sanity'

export default defineType({
  name: 'user',
  title: 'User',
  type: 'document',
  fields: [
    defineField({
      name: 'email',
      title: 'Email',
      type: 'email',
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
    }),
    defineField({
      name: 'image',
      title: 'Profile Image',
      type: 'url',
    }),
    defineField({
      name: 'role',
      title: 'Role',
      type: 'string',
      options: {
        list: [
          {title: 'Job Seeker', value: 'jobseeker'},
          {title: 'Employer', value: 'employer'},
          {title: 'Admin', value: 'admin'},
        ],
      },
      initialValue: 'jobseeker',
    }),
    defineField({
      name: 'companyId',
      title: 'Company ID',
      type: 'string',
      description: 'Reference to company document',
      hidden: ({document}) => document?.role !== 'employer',
    }),
    defineField({
      name: 'createdAt',
      title: 'Created At',
      type: 'datetime',
      readOnly: true,
    }),
  ],
})