import { defineType } from 'sanity'

export default defineType({
  name: 'collection',         // Unique identifier – must be lowercase
  title: 'Collection',       // Human-readable title
  type: 'document',         // This marks it as a document
  fields: [
    {
      name: 'title',
      title: 'Title',
      type: 'string',
    },
    {
      name: 'mainImage',
      title: 'Main Image',
      type: 'image',
      options: { hotspot: true },
    },
  ],
})
