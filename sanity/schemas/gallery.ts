import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'gallery',         // New document type
  title: 'Gallery',        // Display title in Studio
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      description: 'Short label used in Studio and as the image alt text.',
      validation: (rule) => rule.min(2).warning('Add a short, descriptive title so you can spot this image later.'),
    }),
    {
      name: 'mainImage',
      title: 'Main Image',
      type: 'image',
      options: { hotspot: true },
    },
  ],
  preview: {
    select: {
      title: 'title',
      media: 'mainImage',
    },
    prepare({ title, media }) {
      return {
        title: title || 'Untitled art piece',
        media,
      }
    },
  },
})
