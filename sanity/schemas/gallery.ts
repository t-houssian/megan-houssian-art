import { defineType } from 'sanity'

export default defineType({
  name: 'gallery',         // New document type
  title: 'Gallery',        // Display title in Studio
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Title',
      type: 'string',
    },
    {
      name: 'mainImage',
      title: 'Main Image',
      type: 'image',
      options: { hotspot: true },
    },
  ],
})
