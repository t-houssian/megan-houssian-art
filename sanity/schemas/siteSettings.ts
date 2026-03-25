import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'siteSettings',
  title: 'Site Settings',
  type: 'document',
  fields: [
    defineField({
      name: 'favicon',
      title: 'Favicon Image',
      type: 'image',
      options: { hotspot: true },
      description:
        'Upload a square image. The website will generate favicon sizes from this image automatically.',
      fields: [
        defineField({
          name: 'alt',
          title: 'Alt Text',
          type: 'string',
          description: 'Internal description for the uploaded favicon image.'
        })
      ]
    })
  ],
  preview: {
    prepare() {
      return {
        title: 'Site Settings'
      }
    }
  }
})
