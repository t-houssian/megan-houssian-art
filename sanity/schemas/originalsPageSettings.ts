import { defineArrayMember, defineField, defineType } from 'sanity';

const isAllowedLinkValue = (value: unknown) => {
  if (typeof value !== 'string') {
    return false;
  }

  const normalized = value.trim().toLowerCase();
  return (
    normalized.startsWith('/') ||
    normalized.startsWith('#') ||
    normalized.startsWith('http://') ||
    normalized.startsWith('https://') ||
    normalized.startsWith('mailto:') ||
    normalized.startsWith('tel:')
  );
};

export default defineType({
  name: 'originalsPageSettings',
  title: 'Originals Page Settings',
  type: 'document',
  fields: [
    defineField({
      name: 'pageTitle',
      title: 'Page Title',
      type: 'string',
      initialValue: 'Originals',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'pageIntro',
      title: 'Page Intro',
      type: 'text',
      rows: 3,
      initialValue: 'Explore what is available now, what is coming next, and how to get first access.',
    }),
    defineField({
      name: 'availableOriginalsLabel',
      title: 'Available Originals Label',
      type: 'string',
      initialValue: 'Available Originals',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'availableOriginalsAnnouncement',
      title: 'Available Originals Announcement',
      type: 'string',
      initialValue: 'Texas Hill Country Landscapes Collection coming soon',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'availableOriginalsDescription',
      title: 'Available Originals Description',
      type: 'text',
      rows: 3,
      initialValue: 'Join the Collector List below to get early access before this collection is released.',
    }),
    defineField({
      name: 'availableOriginalsCardDescription',
      title: 'Available Originals Card Description',
      type: 'text',
      rows: 3,
      initialValue: 'Original works are released in curated drops. New pieces will appear here when they become available.',
    }),
    defineField({
      name: 'comingSoonImage',
      title: 'Originals Coming Soon Image',
      type: 'image',
      options: { hotspot: true },
      description: 'Image displayed on the Originals page while the next collection is not yet live.',
      fields: [
        defineField({
          name: 'alt',
          title: 'Alt Text',
          type: 'string',
          initialValue: 'Upcoming original collection preview',
        }),
      ],
    }),
    defineField({
      name: 'comingSoonContent',
      title: 'Coming Soon Content',
      type: 'array',
      description:
        'Edit the Originals page message in one field. Press Enter for new paragraphs and highlight text to add links.',
      of: [
        defineArrayMember({
          type: 'block',
          marks: {
            annotations: [
              defineArrayMember({
                name: 'link',
                title: 'Link',
                type: 'object',
                fields: [
                  defineField({
                    name: 'href',
                    title: 'URL',
                    type: 'string',
                    validation: (rule) =>
                      rule.required().custom((value) =>
                        isAllowedLinkValue(value)
                          ? true
                          : 'Use /path, #anchor, http(s)://, mailto:, or tel:'
                      ),
                  }),
                ],
              }),
            ],
          },
        }),
      ],
      initialValue: [
        {
          _type: 'block',
          style: 'normal',
          children: [
            { _type: 'span', text: 'A new collection is coming soon! Join my ' },
            { _type: 'span', text: 'collector list', marks: ['collector-link'] },
            { _type: 'span', text: ' for updates and first access to new originals.' },
          ],
          markDefs: [{ _key: 'collector-link', _type: 'link', href: '/#collector-early-access' }],
        },
      ],
      validation: (rule) => rule.required().min(1),
    }),
    defineField({
      name: 'showCollections',
      title: 'Show Collections Option',
      type: 'boolean',
      initialValue: false,
      description: 'Turn on when you want the Collections option to appear on the Originals page.',
    }),
    defineField({
      name: 'collectionsLabel',
      title: 'Collections Label',
      type: 'string',
      initialValue: 'Collections',
      hidden: ({ parent }) => !parent?.showCollections,
    }),
    defineField({
      name: 'collectionsDescription',
      title: 'Collections Description',
      type: 'text',
      rows: 2,
      initialValue: 'Curated series and seasonal releases.',
      hidden: ({ parent }) => !parent?.showCollections,
    }),
    defineField({
      name: 'showPrints',
      title: 'Show Prints Option and Prints Pages',
      type: 'boolean',
      initialValue: false,
      description: 'When off, Prints is hidden on Originals and /prints routes are not accessible.',
    }),
    defineField({
      name: 'printsLabel',
      title: 'Prints Label',
      type: 'string',
      initialValue: 'Prints',
      hidden: ({ parent }) => !parent?.showPrints,
    }),
    defineField({
      name: 'printsDescription',
      title: 'Prints Description',
      type: 'text',
      rows: 2,
      initialValue: 'Museum-quality prints of select works.',
      hidden: ({ parent }) => !parent?.showPrints,
    }),
    defineField({
      name: 'earlyAccessHeading',
      title: 'Early Access Heading',
      type: 'string',
      initialValue: 'Collector Early Access',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'homeCollectorIntro',
      title: 'Homepage Collector Intro',
      type: 'text',
      rows: 2,
      description: 'Italic statement shown above the collector signup section on the homepage.',
      initialValue:
        'Timeless landscapes collected in homes across the Texas Hill Country and featured in local shops.',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'homeCollectorSubhead',
      title: 'Homepage Collector Subhead',
      type: 'text',
      rows: 3,
      description: 'The sentence shown in the collector signup section on the homepage.',
      initialValue: "Join my Collector List and I'll email you a private early access link 24 hours before new originals go live.",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'earlyAccessSubhead',
      title: 'Early Access Subhead',
      type: 'text',
      rows: 3,
      initialValue: "Join my Collector List and I'll email you a private early access link 24 hours before new originals go live.",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'earlyAccessButtonLabel',
      title: 'Early Access Button Label',
      type: 'string',
      initialValue: 'Get early access',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'earlyAccessFinePrint',
      title: 'Early Access Fine Print',
      type: 'text',
      rows: 2,
      initialValue: "By signing up, you'll receive emails about new paintings and releases. Unsubscribe anytime.",
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    prepare() {
      return {
        title: 'Originals Page Settings',
      };
    },
  },
});
