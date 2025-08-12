// schemas/print.ts
import { defineType } from 'sanity'

export default defineType({
  name: 'print',
  title: 'Print',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Title',
      type: 'string'
    },
    {
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
      }
    },
    {
      name: 'mainImage',
      title: 'Main Image',
      type: 'image',
      options: { hotspot: true }
    },
    {
      name: 'price',
      title: 'Price',
      type: 'number'
    },
    {
      name: 'soldOut',
      title: 'Sold Out',
      type: 'boolean',
      initialValue: false
    },
    {
      name: 'description',
      title: 'Description',
      type: 'text'
    }
  ]
})
