export default {
    name: 'artProduct',
    title: 'Art Products',
    type: 'document',
    fields: [
      { name: 'title', title: 'Title', type: 'string' },
      { name: 'slug', title: 'Slug', type: 'slug', options: { source: 'title' } },
      { name: 'image', title: 'Image', type: 'image' },
      { name: 'price', title: 'Price', type: 'number' },
      { name: 'description', title: 'Description', type: 'text' },
      { name: 'printOnDemand', title: 'Print on Demand', type: 'boolean' }
    ]
  }
  