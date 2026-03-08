import { defineField, defineType } from 'sanity';

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
      name: 'introParagraph',
      title: 'Intro Paragraph',
      type: 'text',
      rows: 3,
      initialValue: "Hi, I'm Megan! I'm a Texas Hill Country landscape painter, wife, and mama.",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'instrumentsParagraph',
      title: 'Instruments Paragraph',
      type: 'text',
      rows: 4,
      initialValue:
        "I've loved creating all my life, and not just art. I learned to play three different instruments, and I've been making crepes for family breakfasts since I was eight.",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'collegeParagraph',
      title: 'College Story Paragraph',
      type: 'text',
      rows: 4,
      initialValue:
        'Fun fact: I actually started college as an art major... but I switched out on the very first day of class. I instinctively knew that turning art into an assignment would steal the joy from it.',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'motherhoodParagraph',
      title: 'Motherhood Paragraph',
      type: 'text',
      rows: 4,
      initialValue:
        'Motherhood brought it all back in the best way. It inspired me to protect my time, get really honest about what I wanted, and build a life that makes room for creating. My faith in Jesus Christ is also a guiding light in my daily life.',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'napTimeParagraph',
      title: 'Nap Time Paragraph',
      type: 'text',
      rows: 5,
      initialValue:
        "During my daughter's nap time, you'll find me painting distant blue hills, wildflowers, and open skies. Or, on days that aren't 100 degrees (Texas summers are brutal), you'll find me \"cooking\" outside with my daughter, where we make leaf and dirt soup topped with flowers we find in our yard.",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'closingPrefix',
      title: 'Closing Text (Before Link)',
      type: 'text',
      rows: 4,
      initialValue:
        "Whether you are drawn to the reverent landscapes, atmospheric skies, or the story of a happy mom who has found meaning in creation, welcome. If you'd like first access to new work, studio updates, and shop restocks,",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'closingLinkText',
      title: 'Closing Link Text',
      type: 'string',
      initialValue: 'join my email list here',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'closingLinkHref',
      title: 'Closing Link URL',
      type: 'string',
      initialValue: '/#collector-early-access',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'closingSuffix',
      title: 'Closing Text (After Link)',
      type: 'string',
      initialValue: 'so we can stay in touch.',
      validation: (rule) => rule.required(),
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
