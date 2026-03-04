import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'heroSettings',
  title: 'Hero Settings',
  type: 'document',
  fields: [
    defineField({
      name: 'backgroundImage',
      title: 'Main Page Hero Image',
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
      name: 'aboutPageImage',
      title: 'About Page Image',
      type: 'image',
      options: { hotspot: true },
      fields: [
        defineField({
          name: 'alt',
          title: 'Alternative text',
          type: 'string',
          description: 'Describe the image for accessibility and SEO.'
        })
      ]
    }),
    defineField({
      name: 'stylePreset',
      title: 'Hero Style Preset',
      type: 'string',
      description: 'Choose a text and button color pairing that best complements the current hero image.',
      options: {
        layout: 'radio',
        list: [
          {
            title: 'Classic Noir (black text, cream border)',
            value: 'classic'
          },
          {
            title: 'Moonlit Cream (cream text, black border)',
            value: 'moonlit'
          },
          {
            title: 'Warm Sepia (rich brown text, tan border)',
            value: 'sepia'
          },
          {
            title: 'Olive Grove (earthy olive text, warm cream border)',
            value: 'olive'
          },
          {
            title: 'Linen Glow (all-cream accents)',
            value: 'linen'
          },
          {
            title: 'Charcoal Sketch (charcoal text, soft ivory border)',
            value: 'charcoal'
          },
          {
            title: 'Porcelain Shine (porcelain text, cocoa border)',
            value: 'porcelain'
          },
          {
            title: 'Sage Whisper (sage text, light moss border)',
            value: 'sage'
          },
          {
            title: 'Twilight Veil (pale text, deep slate border)',
            value: 'twilight'
          },
          {
            title: 'Sunset Ember (copper text, apricot border)',
            value: 'sunset'
          },
          {
            title: 'Meadow Breeze (leafy text, soft grass border)',
            value: 'meadow'
          },
          {
            title: 'Morning Mist (mist text, blue-gray border)',
            value: 'mist'
          },
          {
            title: 'Riverstone Cool (blue-gray text, pale stone border)',
            value: 'riverstone'
          },
          {
            title: 'Amber Glow (amber text, honey border)',
            value: 'amber'
          },
          {
            title: 'Rosewood Velvet (wine text, blush border)',
            value: 'rosewood'
          },
          {
            title: 'Clay Hearth (clay text, bisque border)',
            value: 'clay'
          },
          {
            title: 'Storm Drift (pale text, stormy border)',
            value: 'storm'
          },
          {
            title: 'Harvest Grain (warm brown text, oat border)',
            value: 'harvest'
          },
          {
            title: 'Mulberry Wine (mulberry text, petal border)',
            value: 'mulberry'
          },
          {
            title: 'Coastal Fog (ocean text, sea-glass border)',
            value: 'coastal'
          },
          {
            title: 'Sandstone Dune (sand text, sunlit border)',
            value: 'sandstone'
          },
          {
            title: 'Pearled Ivory (pearl text, latte border)',
            value: 'pearl'
          },
          {
            title: 'Cinder Smoke (frost text, charcoal border)',
            value: 'cinder'
          },
          {
            title: 'Canyon Clay (canyon text, desert border)',
            value: 'canyon'
          }
        ]
      },
      initialValue: 'classic'
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
