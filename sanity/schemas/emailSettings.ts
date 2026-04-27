import { defineArrayMember, defineField, defineType } from 'sanity';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const HEX_COLOR_PATTERN = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

const isAllowedLinkValue = (value: unknown) => {
  if (typeof value !== 'string') {
    return false;
  }

  const normalized = value.trim().toLowerCase();
  return (
    normalized.startsWith('/') ||
    normalized.startsWith('#') ||
    normalized.startsWith('http://') ||
    normalized.startsWith('https://') ||
    normalized.startsWith('mailto:') ||
    normalized.startsWith('tel:')
  );
};

const emailArrayField = (name: string, title: string, description: string, initialValue: string[]) =>
  defineField({
    name,
    title,
    type: 'array',
    description,
    of: [
      defineArrayMember({
        type: 'string',
        validation: (rule) => rule.custom((value) => {
          if (typeof value !== 'string' || !value.trim()) {
            return 'Email is required.';
          }

          return EMAIL_PATTERN.test(value.trim()) ? true : 'Enter a valid email address.';
        }),
      }),
    ],
    initialValue,
    validation: (rule) => rule.required().min(1),
  });

const linkItemFields = [
  defineField({
    name: 'label',
    title: 'Label',
    type: 'string',
    validation: (rule) => rule.required(),
  }),
  defineField({
    name: 'href',
    title: 'Link',
    type: 'string',
    validation: (rule) =>
      rule.required().custom((value) =>
        isAllowedLinkValue(value) ? true : 'Use /path, #anchor, http(s)://, mailto:, or tel:'
      ),
  }),
];

const hexColorField = (name: string, title: string, initialValue: string) =>
  defineField({
    name,
    title,
    type: 'string',
    initialValue,
    validation: (rule) =>
      rule.required().custom((value) =>
        typeof value === 'string' && HEX_COLOR_PATTERN.test(value.trim())
          ? true
          : 'Use a hex color like #6b4f3a'
      ),
  });

export default defineType({
  name: 'emailSettings',
  title: 'Email Settings',
  type: 'document',
  groups: [
    { name: 'general', title: 'General', default: true },
    { name: 'contact', title: 'Contact Notifications' },
    { name: 'commission', title: 'Commission Notifications' },
    { name: 'collector', title: 'Collector Welcome' },
    { name: 'order', title: 'Order Confirmation' },
  ],
  fields: [
    defineField({
      name: 'supportEmail',
      title: 'Support Email Address',
      type: 'string',
      group: 'general',
      description: 'Used inside customer-facing emails and for optional order copy notifications.',
      initialValue: 'meganhoussianart@gmail.com',
      validation: (rule) =>
        rule.required().custom((value) =>
          typeof value === 'string' && EMAIL_PATTERN.test(value.trim()) ? true : 'Enter a valid email address.'
        ),
    }),
    defineField({
      name: 'brandImage',
      title: 'Main Email Image',
      type: 'image',
      group: 'general',
      options: { hotspot: true },
      description:
        'Used in all branded transactional emails. Leave empty to fall back to /public/images/image.png on the website.',
    }),
    defineField({
      name: 'brandImageAlt',
      title: 'Main Email Image Alt Text',
      type: 'string',
      group: 'general',
      initialValue: 'Megan Houssian Art featured artwork',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'brandTemplate',
      title: 'Base Email Template',
      type: 'object',
      group: 'general',
      fields: [
        defineField({
          name: 'brandName',
          title: 'Brand Name',
          type: 'string',
          initialValue: 'Megan Houssian Art',
          validation: (rule) => rule.required(),
        }),
        defineField({
          name: 'imageLinkHref',
          title: 'Image Link',
          type: 'string',
          description: 'Where the email image should point when clicked.',
          initialValue: '/',
          validation: (rule) =>
            rule.required().custom((value) =>
              isAllowedLinkValue(value) ? true : 'Use /path, #anchor, http(s)://, mailto:, or tel:'
            ),
        }),
        defineField({
          name: 'footerLinks',
          title: 'Footer Links',
          type: 'array',
          of: [
            defineArrayMember({
              type: 'object',
              fields: linkItemFields,
              preview: {
                select: {
                  title: 'label',
                  subtitle: 'href',
                },
              },
            }),
          ],
          initialValue: [
            { label: 'Website', href: '/' },
            { label: 'Originals', href: '/originals' },
            { label: 'Print Shop', href: '/prints' },
            { label: 'Contact', href: '/contact' },
          ],
          validation: (rule) => rule.required().min(1),
        }),
        defineField({
          name: 'socialLinks',
          title: 'Social Links',
          type: 'array',
          of: [
            defineArrayMember({
              type: 'object',
              fields: [
                defineField({
                  name: 'platform',
                  title: 'Platform',
                  type: 'string',
                  options: {
                    list: [
                      { title: 'Instagram', value: 'instagram' },
                      { title: 'Pinterest', value: 'pinterest' },
                      { title: 'Facebook', value: 'facebook' },
                    ],
                  },
                  validation: (rule) => rule.required(),
                }),
                ...linkItemFields,
              ],
              preview: {
                select: {
                  title: 'label',
                  subtitle: 'href',
                },
              },
            }),
          ],
          initialValue: [
            { platform: 'instagram', label: 'Instagram', href: 'https://www.instagram.com/meganhoussianart/' },
            { platform: 'pinterest', label: 'Pinterest', href: 'https://pin.it/1Scq2kp48' },
            {
              platform: 'facebook',
              label: 'Facebook',
              href: 'https://www.facebook.com/marketplace/profile/61550348800548/?ref=permalink&mibextid=6ojiHh',
            },
          ],
        }),
        defineField({
          name: 'colors',
          title: 'Colors',
          type: 'object',
          fields: [
            hexColorField('pageBackground', 'Page Background', '#f7f2ea'),
            hexColorField('cardBackground', 'Card Background', '#fffdf8'),
            hexColorField('borderColor', 'Border', '#eadfce'),
            hexColorField('headerGradientFrom', 'Header Gradient From', '#f4ebde'),
            hexColorField('headerGradientTo', 'Header Gradient To', '#fbf7ef'),
            hexColorField('footerBackground', 'Footer Background', '#faf5ec'),
            hexColorField('titleColor', 'Heading Text', '#3f3126'),
            hexColorField('bodyTextColor', 'Body Text', '#4a3a2d'),
            hexColorField('mutedTextColor', 'Muted Text', '#8b7765'),
            hexColorField('linkColor', 'Link Color', '#6b4f3a'),
            hexColorField('buttonBackground', 'Button Background', '#fffdf8'),
            hexColorField('buttonTextColor', 'Button Text', '#6b4f3a'),
            hexColorField('detailTableBackground', 'Detail Table Background', '#fffdf8'),
            hexColorField('detailTableLabelColor', 'Detail Table Label Text', '#5f4735'),
          ],
        }),
      ],
    }),
    defineField({
      name: 'contactNotification',
      title: 'Contact Form Notification',
      type: 'object',
      group: 'contact',
      fields: [
        emailArrayField(
          'recipientEmails',
          'Recipient Emails',
          'These addresses receive website contact form submissions.',
          ['meganhoussianart@gmail.com']
        ),
        defineField({
          name: 'subjectTemplate',
          title: 'Subject Template',
          type: 'string',
          description: 'Available placeholders: {{name}}, {{email}}, {{subject}}',
          initialValue: 'New Contact Request: {{subject}}',
          validation: (rule) => rule.required(),
        }),
        defineField({
          name: 'heading',
          title: 'Heading',
          type: 'string',
          initialValue: 'Contact Request',
          validation: (rule) => rule.required(),
        }),
        defineField({
          name: 'intro',
          title: 'Intro Copy',
          type: 'text',
          rows: 3,
          description: 'Available placeholders: {{name}}, {{email}}, {{subject}}',
          initialValue: 'A new contact form submission came in from {{name}}.',
          validation: (rule) => rule.required(),
        }),
        defineField({
          name: 'footer',
          title: 'Footer Copy',
          type: 'text',
          rows: 3,
          description: 'Available placeholders: {{name}}, {{email}}, {{subject}}',
          initialValue: 'Reply to {{email}} to continue the conversation.',
          validation: (rule) => rule.required(),
        }),
      ],
    }),
    defineField({
      name: 'commissionNotification',
      title: 'Commission Request Notification',
      type: 'object',
      group: 'commission',
      fields: [
        emailArrayField(
          'recipientEmails',
          'Recipient Emails',
          'These addresses receive commission requests.',
          ['tylerhoussian@gmail.com']
        ),
        defineField({
          name: 'subjectTemplate',
          title: 'Subject Template',
          type: 'string',
          description: 'Available placeholders: {{name}}, {{email}}, {{effectiveTotal}}, {{upfrontCost}}',
          initialValue: 'New Commission Request from {{name}}',
          validation: (rule) => rule.required(),
        }),
        defineField({
          name: 'heading',
          title: 'Heading',
          type: 'string',
          initialValue: 'Commission Request',
          validation: (rule) => rule.required(),
        }),
        defineField({
          name: 'intro',
          title: 'Intro Copy',
          type: 'text',
          rows: 3,
          description: 'Available placeholders: {{name}}, {{email}}, {{effectiveTotal}}, {{upfrontCost}}',
          initialValue: 'A new commission inquiry was submitted through the website.',
          validation: (rule) => rule.required(),
        }),
        defineField({
          name: 'footer',
          title: 'Footer Copy',
          type: 'text',
          rows: 3,
          description: 'Available placeholders: {{name}}, {{email}}, {{effectiveTotal}}, {{upfrontCost}}',
          initialValue: 'Reply to {{email}} to follow up on this commission request.',
          validation: (rule) => rule.required(),
        }),
      ],
    }),
    defineField({
      name: 'collectorWelcome',
      title: 'Collector Welcome Email',
      type: 'object',
      group: 'collector',
      fields: [
        defineField({
          name: 'subject',
          title: 'Subject',
          type: 'string',
          initialValue: "You're on the Collector List",
          validation: (rule) => rule.required(),
        }),
        defineField({
          name: 'preheader',
          title: 'Preheader',
          type: 'string',
          initialValue: "Welcome, and thank you for joining my Collector Circle.",
          validation: (rule) => rule.required(),
        }),
        defineField({
          name: 'title',
          title: 'Email Title',
          type: 'string',
          initialValue: 'Welcome to the Collector Circle',
          validation: (rule) => rule.required(),
        }),
        defineField({
          name: 'body',
          title: 'Email Body',
          type: 'text',
          rows: 10,
          description: 'Available placeholders: {{firstName}}',
          initialValue:
            "Welcome, and thank you for joining my Collector Circle. I'm so happy to have you!\n\nThis is where I'll share new work, first looks at upcoming paintings, and notes from the studio along the way. You'll be the first to hear about new collections, available pieces, and the ongoing process behind my journey.\n\nI'm so glad you're here, and I look forward to sharing my work with you!",
          validation: (rule) => rule.required(),
        }),
        defineField({
          name: 'ctaLabel',
          title: 'CTA Label',
          type: 'string',
          initialValue: 'Browse Originals',
          validation: (rule) => rule.required(),
        }),
        defineField({
          name: 'ctaHref',
          title: 'CTA Link',
          type: 'string',
          description: 'Use /path, #anchor, or a full URL.',
          initialValue: '/originals',
          validation: (rule) =>
            rule.required().custom((value) =>
              isAllowedLinkValue(value) ? true : 'Use /path, #anchor, http(s)://, mailto:, or tel:'
            ),
        }),
      ],
    }),
    defineField({
      name: 'orderConfirmation',
      title: 'Order Confirmation Email',
      type: 'object',
      group: 'order',
      fields: [
        defineField({
          name: 'sendCopyToSupport',
          title: 'Send a Copy to Support Email',
          type: 'boolean',
          initialValue: true,
        }),
        defineField({
          name: 'subjectTemplate',
          title: 'Subject Template',
          type: 'string',
          description:
            'Available placeholders: {{customerName}}, {{orderId}}, {{product}}, {{amount}}, {{paymentMethod}}, {{shippingMethod}}',
          initialValue: 'Order Confirmation - {{product}}',
          validation: (rule) => rule.required(),
        }),
        defineField({
          name: 'preheaderTemplate',
          title: 'Preheader Template',
          type: 'string',
          description: 'Available placeholders: {{orderId}}, {{product}}',
          initialValue: 'Order {{orderId}} confirmed',
          validation: (rule) => rule.required(),
        }),
        defineField({
          name: 'title',
          title: 'Email Title',
          type: 'string',
          initialValue: 'Order Confirmation',
          validation: (rule) => rule.required(),
        }),
        defineField({
          name: 'greetingTemplate',
          title: 'Greeting Template',
          type: 'string',
          description: 'Available placeholders: {{customerName}}',
          initialValue: 'Hello {{customerName}},',
          validation: (rule) => rule.required(),
        }),
        defineField({
          name: 'intro',
          title: 'Intro Copy',
          type: 'text',
          rows: 3,
          description: 'Available placeholders: {{customerName}}, {{product}}',
          initialValue: 'Thank you for your purchase from Megan Houssian Art.',
          validation: (rule) => rule.required(),
        }),
        defineField({
          name: 'detailsHeading',
          title: 'Details Heading',
          type: 'string',
          initialValue: 'Order Details',
          validation: (rule) => rule.required(),
        }),
        defineField({
          name: 'supportMessage',
          title: 'Support Message',
          type: 'text',
          rows: 3,
          description: 'Available placeholders: {{supportEmail}}, {{customerName}}, {{orderId}}',
          initialValue: 'If you have any questions, please email Megan at {{supportEmail}}.',
          validation: (rule) => rule.required(),
        }),
        defineField({
          name: 'fulfillmentMessage',
          title: 'Fulfillment Message',
          type: 'text',
          rows: 3,
          description: 'Available placeholders: {{shippingMethod}}, {{product}}',
          initialValue: 'We will send your shipping confirmation and tracking details when your artwork is on the way.',
          validation: (rule) => rule.required(),
        }),
        defineField({
          name: 'ctaLabel',
          title: 'CTA Label',
          type: 'string',
          initialValue: 'View Originals',
          validation: (rule) => rule.required(),
        }),
        defineField({
          name: 'ctaHref',
          title: 'CTA Link',
          type: 'string',
          description: 'Use /path, #anchor, or a full URL.',
          initialValue: '/originals',
          validation: (rule) =>
            rule.required().custom((value) =>
              isAllowedLinkValue(value) ? true : 'Use /path, #anchor, http(s)://, mailto:, or tel:'
            ),
        }),
        defineField({
          name: 'outro',
          title: 'Outro Copy',
          type: 'text',
          rows: 3,
          description: 'Available placeholders: {{customerName}}, {{product}}',
          initialValue: 'Thank you for supporting my work.',
          validation: (rule) => rule.required(),
        }),
      ],
    }),
  ],
  preview: {
    prepare() {
      return {
        title: 'Email Settings',
      };
    },
  },
});
