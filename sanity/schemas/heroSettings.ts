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
