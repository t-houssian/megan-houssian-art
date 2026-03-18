import { defineArrayMember, defineField, defineType } from 'sanity';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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
          initialValue: "Welcome to Megan's Collector List",
          validation: (rule) => rule.required(),
        }),
        defineField({
          name: 'title',
          title: 'Email Title',
          type: 'string',
          initialValue: 'Welcome to the Collector List',
          validation: (rule) => rule.required(),
        }),
        defineField({
          name: 'greetingTemplate',
          title: 'Greeting Template',
          type: 'string',
          description: 'Available placeholders: {{firstName}}',
          initialValue: 'Hi {{firstName}},',
          validation: (rule) => rule.required(),
        }),
        defineField({
          name: 'intro',
          title: 'Intro Copy',
          type: 'text',
          rows: 3,
          description: 'Available placeholders: {{firstName}}',
          initialValue: 'Thanks for signing up.',
          validation: (rule) => rule.required(),
        }),
        defineField({
          name: 'highlightsIntro',
          title: 'Highlights Intro',
          type: 'string',
          initialValue: 'You are now on the list for:',
          validation: (rule) => rule.required(),
        }),
        defineField({
          name: 'highlights',
          title: 'Highlights',
          type: 'array',
          of: [defineArrayMember({ type: 'string' })],
          initialValue: [
            'Private preview links before new originals go live',
            'New painting releases',
            'Studio updates',
          ],
          validation: (rule) => rule.required().min(1),
        }),
        defineField({
          name: 'body',
          title: 'Body Copy',
          type: 'text',
          rows: 4,
          description: 'Available placeholders: {{firstName}}',
          initialValue: 'I am so grateful you are here and I cannot wait to share new work with you.',
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
        defineField({
          name: 'outro',
          title: 'Outro Copy',
          type: 'text',
          rows: 3,
          description: 'Available placeholders: {{firstName}}',
          initialValue: 'Thank you for supporting my work. - Megan',
          validation: (rule) => rule.required(),
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
