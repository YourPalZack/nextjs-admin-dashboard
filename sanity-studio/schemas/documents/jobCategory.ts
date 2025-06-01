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