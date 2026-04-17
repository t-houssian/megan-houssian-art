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
      name: 'releaseAt',
      title: 'Public Release Date & Time',
      type: 'datetime',
      description:
        'When this collection becomes publicly purchasable without a password.',
    }),
    defineField({
      name: 'earlyAccessStartsAt',
      title: 'Early Access Starts',
      type: 'datetime',
      description:
        'When collectors can begin purchasing this collection with the password.',
    }),
    defineField({
      name: 'earlyAccessPassword',
      title: 'Early Access Password',
      type: 'string',
      description:
        'Collectors must enter this password to purchase pieces in this collection during early access.',
    }),
    defineField({
      name: 'earlyAccessMessage',
      title: 'Early Access Purchase Message',
      type: 'text',
      rows: 3,
      description:
        'Shown on artwork pages while this collection is in early access.',
    }),
    defineField({
      name: 'earlyAccessEmailMessage',
      title: 'Collector Signup Email Message',
      type: 'text',
      rows: 3,
      description:
        'Optional message included with the password when someone joins the Collector List during early access.',
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
