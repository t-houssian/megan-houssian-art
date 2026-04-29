import { defineField, defineType } from 'sanity'
import { DEFAULT_FOOTER_CONTENT, DEFAULT_HOMEPAGE_CONTENT } from '../lib/siteContent'
import { DEFAULT_SITE_THEME, HEX_COLOR_PATTERN, SITE_THEME_PALETTE_HELPER_TEXT } from '../lib/siteTheme'

export default defineType({
  name: 'siteSettings',
  title: 'Site Settings',
  type: 'document',
  initialValue: {
    theme: DEFAULT_SITE_THEME,
    homepageContent: DEFAULT_HOMEPAGE_CONTENT,
    footerContent: DEFAULT_FOOTER_CONTENT
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
    }),
    defineField({
      name: 'homepageContent',
      title: 'Homepage Copy',
      type: 'object',
      description: 'Text used across homepage sections.',
      initialValue: DEFAULT_HOMEPAGE_CONTENT,
      options: { collapsible: true, collapsed: false },
      fields: [
        defineField({
          name: 'homeCollectorIntro',
          title: 'Homepage Collector Intro',
          type: 'text',
          rows: 2,
          description: 'Italic statement shown above the collector signup section on the homepage.',
          initialValue: DEFAULT_HOMEPAGE_CONTENT.homeCollectorIntro,
          validation: (rule) => rule.required()
        }),
        defineField({
          name: 'aboutHeading',
          title: 'About Section Heading',
          type: 'string',
          initialValue: DEFAULT_HOMEPAGE_CONTENT.aboutHeading,
          validation: (rule) => rule.required()
        }),
        defineField({
          name: 'aboutLocation',
          title: 'About Section Location',
          type: 'string',
          initialValue: DEFAULT_HOMEPAGE_CONTENT.aboutLocation,
          validation: (rule) => rule.required()
        }),
        defineField({
          name: 'aboutDescription',
          title: 'About Section Description',
          type: 'text',
          rows: 4,
          initialValue: DEFAULT_HOMEPAGE_CONTENT.aboutDescription,
          validation: (rule) => rule.required()
        }),
        defineField({
          name: 'aboutButtonLabel',
          title: 'About Section Button Label',
          type: 'string',
          initialValue: DEFAULT_HOMEPAGE_CONTENT.aboutButtonLabel,
          validation: (rule) => rule.required()
        }),
        defineField({
          name: 'commissionsHeading',
          title: 'Commission Section Heading',
          type: 'string',
          initialValue: DEFAULT_HOMEPAGE_CONTENT.commissionsHeading,
          validation: (rule) => rule.required()
        }),
        defineField({
          name: 'commissionsDescription',
          title: 'Commission Section Description',
          type: 'text',
          rows: 4,
          initialValue: DEFAULT_HOMEPAGE_CONTENT.commissionsDescription,
          validation: (rule) => rule.required()
        }),
        defineField({
          name: 'commissionsButtonLabel',
          title: 'Commission Section Button Label',
          type: 'string',
          initialValue: DEFAULT_HOMEPAGE_CONTENT.commissionsButtonLabel,
          validation: (rule) => rule.required()
        }),
        defineField({
          name: 'contactHeading',
          title: 'Contact Section Heading',
          type: 'string',
          initialValue: DEFAULT_HOMEPAGE_CONTENT.contactHeading,
          validation: (rule) => rule.required()
        }),
        defineField({
          name: 'contactIntroText',
          title: 'Contact Section Intro Text',
          type: 'string',
          description: 'Text shown before the linked email address.',
          initialValue: DEFAULT_HOMEPAGE_CONTENT.contactIntroText,
          validation: (rule) => rule.required()
        }),
        defineField({
          name: 'contactEmail',
          title: 'Contact Section Email',
          type: 'string',
          initialValue: DEFAULT_HOMEPAGE_CONTENT.contactEmail,
          validation: (rule) => rule.required().email()
        }),
        defineField({
          name: 'contactButtonLabel',
          title: 'Contact Section Button Label',
          type: 'string',
          initialValue: DEFAULT_HOMEPAGE_CONTENT.contactButtonLabel,
          validation: (rule) => rule.required()
        })
      ]
    }),
    defineField({
      name: 'footerContent',
      title: 'Footer Copy',
      type: 'object',
      description: 'Text labels used across the site footer.',
      initialValue: DEFAULT_FOOTER_CONTENT,
      options: { collapsible: true, collapsed: false },
      fields: [
        defineField({
          name: 'brandTitle',
          title: 'Brand Title',
          type: 'string',
          initialValue: DEFAULT_FOOTER_CONTENT.brandTitle,
          validation: (rule) => rule.required()
        }),
        defineField({
          name: 'brandDescription',
          title: 'Brand Description',
          type: 'text',
          rows: 3,
          initialValue: DEFAULT_FOOTER_CONTENT.brandDescription,
          validation: (rule) => rule.required()
        }),
        defineField({
          name: 'exploreHeading',
          title: 'Explore Column Heading',
          type: 'string',
          initialValue: DEFAULT_FOOTER_CONTENT.exploreHeading,
          validation: (rule) => rule.required()
        }),
        defineField({
          name: 'galleryLabel',
          title: 'Gallery Link Label',
          type: 'string',
          initialValue: DEFAULT_FOOTER_CONTENT.galleryLabel,
          validation: (rule) => rule.required()
        }),
        defineField({
          name: 'originalsLabel',
          title: 'Originals Link Label',
          type: 'string',
          initialValue: DEFAULT_FOOTER_CONTENT.originalsLabel,
          validation: (rule) => rule.required()
        }),
        defineField({
          name: 'commissionsLabel',
          title: 'Commissions Link Label',
          type: 'string',
          initialValue: DEFAULT_FOOTER_CONTENT.commissionsLabel,
          validation: (rule) => rule.required()
        }),
        defineField({
          name: 'aboutLabel',
          title: 'About Link Label',
          type: 'string',
          initialValue: DEFAULT_FOOTER_CONTENT.aboutLabel,
          validation: (rule) => rule.required()
        }),
        defineField({
          name: 'connectHeading',
          title: 'Connect Column Heading',
          type: 'string',
          initialValue: DEFAULT_FOOTER_CONTENT.connectHeading,
          validation: (rule) => rule.required()
        }),
        defineField({
          name: 'instagramLabel',
          title: 'Instagram Label',
          type: 'string',
          initialValue: DEFAULT_FOOTER_CONTENT.instagramLabel,
          validation: (rule) => rule.required()
        }),
        defineField({
          name: 'pinterestLabel',
          title: 'Pinterest Label',
          type: 'string',
          initialValue: DEFAULT_FOOTER_CONTENT.pinterestLabel,
          validation: (rule) => rule.required()
        }),
        defineField({
          name: 'facebookLabel',
          title: 'Facebook Label',
          type: 'string',
          initialValue: DEFAULT_FOOTER_CONTENT.facebookLabel,
          validation: (rule) => rule.required()
        }),
        defineField({
          name: 'contactLabel',
          title: 'Contact Link Label',
          type: 'string',
          initialValue: DEFAULT_FOOTER_CONTENT.contactLabel,
          validation: (rule) => rule.required()
        }),
        defineField({
          name: 'copyrightName',
          title: 'Copyright Name',
          type: 'string',
          initialValue: DEFAULT_FOOTER_CONTENT.copyrightName,
          validation: (rule) => rule.required()
        }),
        defineField({
          name: 'location',
          title: 'Footer Location',
          type: 'string',
          initialValue: DEFAULT_FOOTER_CONTENT.location,
          validation: (rule) => rule.required()
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
