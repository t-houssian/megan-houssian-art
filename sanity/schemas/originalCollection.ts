import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'originalCollection',
  title: 'Original Collection',
  type: 'document',
  groups: [
    {name: 'artworkOrder', title: 'Artwork Order', default: true},
    {name: 'details', title: 'Collection Details'},
    {name: 'scheduling', title: 'Release Settings'},
  ],
  fields: [
    defineField({
      name: 'artworkOrder',
      title: 'Artwork Order',
      type: 'array',
      group: 'artworkOrder',
      of: [
        {
          type: 'reference',
          to: [{type: 'original'}],
          weak: true,
          options: {
            disableNew: true,
            filter: ({document}) => ({
              filter:
                '$collectionId in coalesce(collections[]._ref, []) || _id in $legacyPieceIds',
              params: {
                collectionId: document._id.replace(/^drafts\./, ''),
                legacyPieceIds: Array.isArray(document.pieces)
                  ? document.pieces.flatMap((piece) =>
                      typeof piece?._ref === 'string' ? [piece._ref] : []
                    )
                  : [],
              },
            }),
          },
        },
      ],
      validation: (rule) => rule.unique(),
      description:
        'Drag artworks into the order you want, from top to bottom, then Publish. This list only controls display order; assign collection membership on the artwork or in Collection Details. New members appear after the saved order until you add them here.',
    }),
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      group: 'details',
      validation: (rule) => rule.required().min(2),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      group: 'details',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Collection Notes',
      type: 'text',
      group: 'details',
      rows: 4,
      description: 'Optional notes about this collection.',
    }),
    defineField({
      name: 'releaseAt',
      title: 'Public Release Date & Time',
      type: 'datetime',
      group: 'scheduling',
      description:
        'When this collection becomes publicly purchasable.',
    }),
    defineField({
      name: 'earlyAccessStartsAt',
      title: 'Early Access Starts',
      type: 'datetime',
      group: 'scheduling',
      description:
        'When collectors can begin purchasing this collection before the public release time.',
    }),
    defineField({
      name: 'earlyAccessMessage',
      title: 'Early Access Purchase Message',
      type: 'text',
      group: 'scheduling',
      rows: 3,
      description:
        'Shown on artwork pages while this collection is in early access.',
    }),
    defineField({
      name: 'earlyAccessEmailMessage',
      title: 'Collector Signup Email Message',
      type: 'text',
      group: 'scheduling',
      rows: 3,
      description:
        'Optional message included when someone joins the Collector List during early access.',
    }),
    defineField({
      name: 'pieces',
      title: 'Pieces in This Collection',
      type: 'array',
      group: 'details',
      of: [
        {
          type: 'reference',
          to: [{type: 'original'}],
        },
      ],
      description:
        'Add originals here to make them members of this collection. You can also assign membership on an artwork. Arrange their display order in the Artwork Order tab.',
    }),
  ],
  preview: {
    select: {
      title: 'title',
    },
    prepare({title}) {
      return {
        title: title || 'Untitled collection',
        subtitle: 'Original artwork collection',
      }
    },
  },
})
