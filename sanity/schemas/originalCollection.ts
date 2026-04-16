import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'originalCollection',
  title: 'Original Collection',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (rule) => rule.required().min(2),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Collection Page Description',
      type: 'text',
      rows: 4,
      description: 'Shown on the collection page above the pieces in this collection.',
    }),
    defineField({
      name: 'pieces',
      title: 'Pieces in This Collection',
      type: 'array',
      of: [
        {
          type: 'reference',
          to: [{type: 'original'}],
        },
      ],
      description:
        'Add originals here to show them as part of this collection. You can also assign collections from an original artwork document.',
    }),
  ],
  preview: {
    select: {
      title: 'title',
      pieces: 'pieces',
    },
    prepare({title, pieces}) {
      const pieceCount = Array.isArray(pieces) ? pieces.length : 0

      return {
        title: title || 'Untitled collection',
        subtitle: `${pieceCount} ${pieceCount === 1 ? 'piece' : 'pieces'}`,
      }
    },
  },
})
