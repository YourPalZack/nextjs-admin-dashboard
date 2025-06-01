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