import { defineField, defineType } from 'sanity'
import { DEFAULT_SITE_THEME, HEX_COLOR_PATTERN, SITE_THEME_PALETTE_HELPER_TEXT } from '../lib/siteTheme'

export default defineType({
  name: 'siteSettings',
  title: 'Site Settings',
  type: 'document',
  initialValue: {
    theme: DEFAULT_SITE_THEME
  },
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
    }),
    defineField({
      name: 'theme',
      title: 'Site Theme',
      type: 'object',
      description:
        `Controls the website color palette. ${SITE_THEME_PALETTE_HELPER_TEXT}`,
      initialValue: DEFAULT_SITE_THEME,
      fields: [
        defineField({
          name: 'mainBackgroundColor',
          title: 'Main Background Color',
          type: 'string',
          initialValue: DEFAULT_SITE_THEME.mainBackgroundColor,
          description: 'Default site background.',
          validation: (rule) =>
            rule.required().regex(HEX_COLOR_PATTERN, { name: 'hex color' })
        }),
        defineField({
          name: 'secondaryBackgroundColor',
          title: 'Secondary Background Color',
          type: 'string',
          initialValue: DEFAULT_SITE_THEME.secondaryBackgroundColor,
          description: 'Secondary surface and section background.',
          validation: (rule) =>
            rule.required().regex(HEX_COLOR_PATTERN, { name: 'hex color' })
        }),
        defineField({
          name: 'navBackgroundColor',
          title: 'Nav Bar Background Color',
          type: 'string',
          initialValue: DEFAULT_SITE_THEME.navBackgroundColor,
          description: 'Background used for the top navigation bar and its menus.',
          validation: (rule) =>
            rule.required().regex(HEX_COLOR_PATTERN, { name: 'hex color' })
        }),
        defineField({
          name: 'textColor',
          title: 'Text Color',
          type: 'string',
          initialValue: DEFAULT_SITE_THEME.textColor,
          description: 'Primary body and heading text.',
          validation: (rule) =>
            rule.required().regex(HEX_COLOR_PATTERN, { name: 'hex color' })
        }),
        defineField({
          name: 'buttonColor',
          title: 'Button Color',
          type: 'string',
          initialValue: DEFAULT_SITE_THEME.buttonColor,
          validation: (rule) =>
            rule.required().regex(HEX_COLOR_PATTERN, { name: 'hex color' })
        }),
        defineField({
          name: 'buttonHoverColor',
          title: 'Button Hover Color',
          type: 'string',
          initialValue: DEFAULT_SITE_THEME.buttonHoverColor,
          validation: (rule) =>
            rule.required().regex(HEX_COLOR_PATTERN, { name: 'hex color' })
        }),
        defineField({
          name: 'linkColor',
          title: 'Link Color',
          type: 'string',
          initialValue: DEFAULT_SITE_THEME.linkColor,
          validation: (rule) =>
            rule.required().regex(HEX_COLOR_PATTERN, { name: 'hex color' })
        }),
        defineField({
          name: 'mutedTextColor',
          title: 'Muted Text Color',
          type: 'string',
          initialValue: DEFAULT_SITE_THEME.mutedTextColor,
          validation: (rule) =>
            rule.required().regex(HEX_COLOR_PATTERN, { name: 'hex color' })
        }),
        defineField({
          name: 'accentColor',
          title: 'Accent Color',
          type: 'string',
          initialValue: DEFAULT_SITE_THEME.accentColor,
          description: 'Soft accent used in gradients and highlighted panels.',
          validation: (rule) =>
            rule.required().regex(HEX_COLOR_PATTERN, { name: 'hex color' })
        }),
        defineField({
          name: 'borderColor',
          title: 'Border Color',
          type: 'string',
          initialValue: DEFAULT_SITE_THEME.borderColor,
          validation: (rule) =>
            rule.required().regex(HEX_COLOR_PATTERN, { name: 'hex color' })
        }),
        defineField({
          name: 'heroOverlayColor',
          title: 'Hero Overlay Color',
          type: 'string',
          initialValue: DEFAULT_SITE_THEME.heroOverlayColor,
          validation: (rule) =>
            rule.required().regex(HEX_COLOR_PATTERN, { name: 'hex color' })
        }),
        defineField({
          name: 'surfaceAccentColor',
          title: 'Surface Accent Color',
          type: 'string',
          initialValue: DEFAULT_SITE_THEME.surfaceAccentColor,
          description: 'Extra neutral accent available for future surfaces and dividers.',
          validation: (rule) =>
            rule.required().regex(HEX_COLOR_PATTERN, { name: 'hex color' })
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
