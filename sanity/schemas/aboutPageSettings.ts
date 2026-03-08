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
  name: 'aboutPageSettings',
  title: 'About Page Settings',
  type: 'document',
  fields: [
    defineField({
      name: 'pageTitle',
      title: 'Page Title',
      type: 'string',
      initialValue: 'About Megan',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'aboutPageImage',
      title: 'About Page Image',
      type: 'image',
      options: { hotspot: true },
      fields: [
        defineField({
          name: 'alt',
          title: 'Alt Text',
          type: 'string',
          initialValue: 'Megan Houssian',
        }),
      ],
    }),
    defineField({
      name: 'content',
      title: 'About Page Content',
      type: 'array',
      description:
        'Edit the full About page text in one field. Press Enter for new paragraphs and highlight text to add links.',
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
          children: [{ _type: 'span', text: "Hi, I'm Megan! I'm a Texas Hill Country landscape painter, wife, and mama." }],
          markDefs: [],
        },
        {
          _type: 'block',
          style: 'normal',
          children: [
            {
              _type: 'span',
              text: "I've loved creating all my life, and not just art. I learned to play three different instruments, and I've been making crepes for family breakfasts since I was eight.",
            },
          ],
          markDefs: [],
        },
        {
          _type: 'block',
          style: 'normal',
          children: [
            {
              _type: 'span',
              text: 'Fun fact: I actually started college as an art major... but I switched out on the very first day of class. I instinctively knew that turning art into an assignment would steal the joy from it.',
            },
          ],
          markDefs: [],
        },
        {
          _type: 'block',
          style: 'normal',
          children: [
            {
              _type: 'span',
              text: 'Motherhood brought it all back in the best way. It inspired me to protect my time, get really honest about what I wanted, and build a life that makes room for creating. My faith in Jesus Christ is also a guiding light in my daily life.',
            },
          ],
          markDefs: [],
        },
        {
          _type: 'block',
          style: 'normal',
          children: [
            {
              _type: 'span',
              text: `During my daughter's nap time, you'll find me painting distant blue hills, wildflowers, and open skies. Or, on days that aren't 100 degrees (Texas summers are brutal), you'll find me "cooking" outside with my daughter, where we make leaf and dirt soup topped with flowers we find in our yard.`,
            },
          ],
          markDefs: [],
        },
        {
          _type: 'block',
          style: 'normal',
          children: [
            {
              _type: 'span',
              text: "Whether you are drawn to the reverent landscapes, atmospheric skies, or the story of a happy mom who has found meaning in creation, welcome. If you'd like first access to new work, studio updates, and shop restocks, ",
            },
            {
              _type: 'span',
              text: 'join my email list here',
              marks: ['collector-link'],
            },
            {
              _type: 'span',
              text: ' so we can stay in touch.',
            },
          ],
          markDefs: [{ _key: 'collector-link', _type: 'link', href: '/#collector-early-access' }],
        },
      ],
      validation: (rule) => rule.required().min(1),
    }),
  ],
  preview: {
    prepare() {
      return {
        title: 'About Page Settings',
      };
    },
  },
});
