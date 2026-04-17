// ./original.ts
import { defineType } from 'sanity'

export default defineType({
  name: 'original',
  title: 'Original Artwork',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Title',
      type: 'string',
    },
    {
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
      },
    },
    {
      name: 'mainImage',
      title: 'Main Image',
      type: 'image',
      options: { hotspot: true },
    },
    {
      name: 'gallery',
      title: 'Gallery',
      type: 'array',
      of: [
        {
          type: 'image',
          options: { hotspot: true },
        },
      ],
      description: 'Additional images for this artwork',
    },
    {
      name: 'collections',
      title: 'Collections',
      type: 'array',
      of: [
        {
          type: 'reference',
          to: [{type: 'originalCollection'}],
        },
      ],
      description:
        'Collections this original belongs to. Originals can also be added from the Original Collection document.',
    },
    {
      name: 'price',
      title: 'Price',
      type: 'number',
    },
    {
      name: 'artworkSize',
      title: 'Artwork Size',
      type: 'string',
      description: 'Artwork dimensions in inches, shown on original artwork cards. Example: 24 x 36 in.',
    },
    {
      name: 'testProduct',
      title: 'Test Product',
      type: 'boolean',
      initialValue: false,
      description:
        'Turn this on only for payment testing. Test products can use very small prices such as $0.01.',
    },
    {
      name: 'sold',
      title: 'Sold',
      type: 'boolean',
      initialValue: false,
    },
    {
      name: 'releaseAt',
      title: 'Public Release Date & Time',
      type: 'datetime',
      description:
        'When this individual piece becomes publicly purchasable without a password. Leave blank to inherit from its collection or make it immediately available.',
    },
    {
      name: 'earlyAccessStartsAt',
      title: 'Early Access Starts',
      type: 'datetime',
      description:
        'When collectors can begin purchasing this piece with the password. Leave blank to inherit from its collection.',
    },
    {
      name: 'earlyAccessPassword',
      title: 'Early Access Password',
      type: 'string',
      description:
        'Collectors must enter this password to purchase this single piece during early access. Leave blank to inherit from its collection.',
    },
    {
      name: 'earlyAccessMessage',
      title: 'Early Access Purchase Message',
      type: 'text',
      rows: 3,
      description:
        'Shown on the artwork page while this piece is in early access. Leave blank to use the default or collection message.',
    },
    {
      name: 'earlyAccessEmailMessage',
      title: 'Collector Signup Email Message',
      type: 'text',
      rows: 3,
      description:
        'Optional message included with the password when someone joins the Collector List during early access.',
    },
    {
      name: 'description',
      title: 'Description',
      type: 'text',
    },
    {
      name: 'shipping',
      title: 'Shipping Information',
      type: 'object',
      fields: [
        {
          name: 'weight',
          title: 'Weight (ounces)',
          type: 'number',
          description: 'Weight of the artwork with packaging in ounces',
          initialValue: 16,
        },
        {
          name: 'dimensions',
          title: 'Package Dimensions',
          type: 'object',
          fields: [
            {
              name: 'length',
              title: 'Length (inches)',
              type: 'number',
              description: 'Package length in inches',
              initialValue: 12,
            },
            {
              name: 'width',
              title: 'Width (inches)',
              type: 'number',
              description: 'Package width in inches',
              initialValue: 9,
            },
            {
              name: 'height',
              title: 'Height (inches)',
              type: 'number',
              description: 'Package height/thickness in inches',
              initialValue: 2,
            },
          ],
        },
      ],
      description: 'Shipping weight and package dimensions for accurate shipping calculations',
    },
  ],
})
