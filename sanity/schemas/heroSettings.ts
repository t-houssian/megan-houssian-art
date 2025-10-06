import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'heroSettings',
  title: 'Hero Settings',
  type: 'document',
  fields: [
    defineField({
      name: 'backgroundImage',
      title: 'Background Image',
      type: 'image',
      options: { hotspot: true },
      fields: [
        defineField({
          name: 'alt',
          title: 'Alternative text',
          type: 'string',
          description: 'Describe the image for accessibility and SEO.'
        })
      ],
      validation: (rule) => rule.required()
    }),
    defineField({
      name: 'primaryTextColor',
      title: 'Primary Text Color',
      type: 'string',
      description: 'Hex color (e.g. #4A3F35) for the main hero text.',
      validation: (rule) =>
        rule.regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, {
          name: 'hex color'
        }).warning('Enter a valid hex color such as #4A3F35.')
    }),
    defineField({
      name: 'buttonPrimaryColor',
      title: 'Button Text Color',
      type: 'string',
      description: 'Hex color (e.g. #000000) for the button text.',
      validation: (rule) =>
        rule.regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, {
          name: 'hex color'
        }).warning('Enter a valid hex color such as #000000.')
    }),
    defineField({
      name: 'buttonBorderColor',
      title: 'Button Border Color',
      type: 'string',
      description: 'Hex color (e.g. #F7F3E9) for the button border.',
      validation: (rule) =>
        rule.regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, {
          name: 'hex color'
        }).warning('Enter a valid hex color such as #F7F3E9.')
    }),
    defineField({
      name: 'buttonHoverColor',
      title: 'Button Hover Background Color',
      type: 'string',
      description: 'Hex color (e.g. #8B4513) for the button background on hover.',
      validation: (rule) =>
        rule.regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, {
          name: 'hex color'
        }).warning('Enter a valid hex color such as #8B4513.')
    }),
    defineField({
      name: 'buttonHoverTextColor',
      title: 'Button Hover Text Color',
      type: 'string',
      description: 'Hex color (e.g. #FEFBF3) for the button text on hover.',
      validation: (rule) =>
        rule.regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, {
          name: 'hex color'
        }).warning('Enter a valid hex color such as #FEFBF3.')
    })
  ],
  preview: {
    prepare() {
      return {
        title: 'Hero Settings'
      }
    }
  }
})
