import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'galleryOrder',
  title: 'Gallery Order',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      initialValue: 'Gallery Order',
      readOnly: true,
      description: 'This label just helps you spot the order document in Studio.',
    }),
    defineField({
      name: 'items',
      title: 'Gallery Items',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'gallery' }] }],
      validation: (rule) => rule.unique(),
      description: 'Add pieces and drag to change how they appear on the homepage.',
    }),
  ],
  preview: {
    select: {
      title: 'title',
    },
  },
})
