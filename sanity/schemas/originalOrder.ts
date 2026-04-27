import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'originalOrder',
  title: 'Originals Order',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      initialValue: 'Originals Order',
      readOnly: true,
      description: 'This label just helps you spot the order document in Studio.',
    }),
    defineField({
      name: 'items',
      title: 'Original Artworks',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'original' }] }],
      validation: (rule) => rule.unique(),
      description: 'Add originals and drag to change how they appear on the originals page.',
    }),
  ],
  preview: {
    select: {
      title: 'title',
    },
  },
})
