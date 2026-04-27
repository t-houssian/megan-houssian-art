import { defineField, defineType } from 'sanity'
import { DEFAULT_SITE_THEME, HEX_COLOR_PATTERN, SITE_THEME_PALETTE } from '../lib/siteTheme'

const DEFAULT_HERO_CTA = {
  enabled: false,
  label: 'Browse Originals',
  href: '/originals',
  placement: 'middle',
  backgroundColor: DEFAULT_SITE_THEME.buttonColor,
  textColor: DEFAULT_SITE_THEME.secondaryBackgroundColor,
  borderColor: '#000000',
  hoverBackgroundColor: DEFAULT_SITE_THEME.buttonHoverColor,
  hoverTextColor: DEFAULT_SITE_THEME.secondaryBackgroundColor,
}

const colorField = (name: string, title: string, initialValue: string) =>
  defineField({
    name,
    title,
    type: 'string',
    initialValue,
    description: `Use a hex color. Suggested palette: ${SITE_THEME_PALETTE.join(', ')}`,
    hidden: ({ parent }) => parent?.enabled === false,
    validation: (rule) => rule.required().regex(HEX_COLOR_PATTERN, { name: 'hex color' })
  })

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
    }),
    defineField({
      name: 'cta',
      title: 'Hero Button',
      type: 'object',
      description: 'Optional button shown over the main homepage photo.',
      options: { collapsible: true, collapsed: false },
      initialValue: DEFAULT_HERO_CTA,
      fields: [
        defineField({
          name: 'enabled',
          title: 'Show Button',
          type: 'boolean',
          initialValue: DEFAULT_HERO_CTA.enabled,
        }),
        defineField({
          name: 'label',
          title: 'Button Text',
          type: 'string',
          initialValue: DEFAULT_HERO_CTA.label,
          hidden: ({ parent }) => parent?.enabled === false,
          validation: (rule) => rule.max(40),
        }),
        defineField({
          name: 'href',
          title: 'Button Link',
          type: 'string',
          initialValue: DEFAULT_HERO_CTA.href,
          description: 'Use an internal path like /originals or /#collector-early-access.',
          hidden: ({ parent }) => parent?.enabled === false,
          validation: (rule) =>
            rule.custom((value) => {
              if (!value) return true
              if (typeof value !== 'string') return 'Button link must be text'
              if (!value.startsWith('/') || value.startsWith('//')) {
                return 'Use an internal path starting with /'
              }
              return true
            }),
        }),
        defineField({
          name: 'placement',
          title: 'Button Placement',
          type: 'string',
          initialValue: DEFAULT_HERO_CTA.placement,
          hidden: ({ parent }) => parent?.enabled === false,
          options: {
            layout: 'radio',
            list: [
              { title: 'Centered Higher', value: 'higher' },
              { title: 'Centered Middle', value: 'middle' },
              { title: 'Centered Lower', value: 'lower' },
            ],
          },
        }),
        colorField('backgroundColor', 'Button Background Color', DEFAULT_HERO_CTA.backgroundColor),
        colorField('textColor', 'Button Text Color', DEFAULT_HERO_CTA.textColor),
        colorField('borderColor', 'Button Border Color', DEFAULT_HERO_CTA.borderColor),
        colorField('hoverBackgroundColor', 'Button Hover Background Color', DEFAULT_HERO_CTA.hoverBackgroundColor),
        colorField('hoverTextColor', 'Button Hover Text Color', DEFAULT_HERO_CTA.hoverTextColor),
      ],
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
