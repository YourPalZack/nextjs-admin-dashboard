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