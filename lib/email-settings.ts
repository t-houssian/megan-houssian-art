import { sanityClient } from './sanity';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DEFAULT_SUPPORT_EMAIL = 'meganhoussianart@gmail.com';
const DEFAULT_CONTACT_RECIPIENT = 'meganhoussianart@gmail.com';
const DEFAULT_COMMISSION_RECIPIENT = 'tylerhoussian@gmail.com';

type EmailTemplateValues = Record<string, string | number | null | undefined>;

type NotificationEmailSettings = {
  recipientEmails: string[];
  subjectTemplate: string;
  heading: string;
  intro: string;
  footer: string;
};

type CollectorWelcomeSettings = {
  subject: string;
  preheader: string;
  title: string;
  greetingTemplate: string;
  intro: string;
  highlightsIntro: string;
  highlights: string[];
  body: string;
  ctaLabel: string;
  ctaHref: string;
  outro: string;
};

type OrderConfirmationSettings = {
  sendCopyToSupport: boolean;
  subjectTemplate: string;
  preheaderTemplate: string;
  title: string;
  greetingTemplate: string;
  intro: string;
  detailsHeading: string;
  supportMessage: string;
  fulfillmentMessage: string;
  ctaLabel: string;
  ctaHref: string;
  outro: string;
};

export type EmailSettings = {
  supportEmail: string;
  contactNotification: NotificationEmailSettings;
  commissionNotification: NotificationEmailSettings;
  collectorWelcome: CollectorWelcomeSettings;
  orderConfirmation: OrderConfirmationSettings;
};

type PartialEmailSettings = Partial<EmailSettings> & {
  contactNotification?: Partial<NotificationEmailSettings> | null;
  commissionNotification?: Partial<NotificationEmailSettings> | null;
  collectorWelcome?: Partial<CollectorWelcomeSettings> | null;
  orderConfirmation?: Partial<OrderConfirmationSettings> | null;
};

const normalizeString = (value: unknown) => (typeof value === 'string' ? value.trim() : '');

const normalizeNonEmptyString = (value: unknown, fallback: string) => {
  const normalized = normalizeString(value);
  return normalized.length > 0 ? normalized : fallback;
};

const normalizeBoolean = (value: unknown, fallback: boolean) =>
  typeof value === 'boolean' ? value : fallback;

const normalizeHref = (value: unknown, fallback: string) => {
  const normalized = normalizeString(value);
  if (!normalized) {
    return fallback;
  }

  const lower = normalized.toLowerCase();
  if (
    lower.startsWith('/') ||
    lower.startsWith('#') ||
    lower.startsWith('http://') ||
    lower.startsWith('https://') ||
    lower.startsWith('mailto:') ||
    lower.startsWith('tel:')
  ) {
    return normalized;
  }

  return fallback;
};

const normalizeEmail = (value: string) => value.trim().toLowerCase().replace(/^mailto:/, '');

const isValidEmail = (value: string) => EMAIL_PATTERN.test(normalizeEmail(value));

const uniqueEmails = (emails: string[]) =>
  emails.filter((email, index, all) => all.indexOf(email) === index);

const parseEmailString = (value: string) =>
  value
    .split(/[\n,;]/)
    .flatMap((part) => part.split(/\s+/))
    .map((part) => part.split('#')[0]?.trim() || '')
    .map(normalizeEmail)
    .filter(Boolean)
    .filter(isValidEmail);

const normalizeEmailList = (value: unknown, fallback: string[]) => {
  const candidates = Array.isArray(value)
    ? value
        .filter((item): item is string => typeof item === 'string')
        .map(normalizeEmail)
        .filter(isValidEmail)
    : [];

  return candidates.length > 0 ? uniqueEmails(candidates) : fallback;
};

const getEnvRecipientEmails = (fallback: string[]) => {
  const parsed = parseEmailString(process.env.MAILGUN_TO_EMAIL || '');
  return parsed.length > 0 ? uniqueEmails(parsed) : fallback;
};

const getDefaultEmailSettings = (): EmailSettings => ({
  supportEmail: DEFAULT_SUPPORT_EMAIL,
  contactNotification: {
    recipientEmails: getEnvRecipientEmails([DEFAULT_CONTACT_RECIPIENT]),
    subjectTemplate: 'New Contact Request: {{subject}}',
    heading: 'Contact Request',
    intro: 'A new contact form submission came in from {{name}}.',
    footer: 'Reply to {{email}} to continue the conversation.',
  },
  commissionNotification: {
    recipientEmails: getEnvRecipientEmails([DEFAULT_COMMISSION_RECIPIENT]),
    subjectTemplate: 'New Commission Request from {{name}}',
    heading: 'Commission Request',
    intro: 'A new commission inquiry was submitted through the website.',
    footer: 'Reply to {{email}} to follow up on this commission request.',
  },
  collectorWelcome: {
    subject: "You're on the Collector List",
    preheader: "Welcome to Megan's Collector List",
    title: 'Welcome to the Collector List',
    greetingTemplate: 'Hi {{firstName}},',
    intro: 'Thanks for signing up.',
    highlightsIntro: 'You are now on the list for:',
    highlights: [
      'Private preview links before new originals go live',
      'New painting releases',
      'Studio updates',
    ],
    body: 'I am so grateful you are here and I cannot wait to share new work with you.',
    ctaLabel: 'Browse Originals',
    ctaHref: '/originals',
    outro: 'Thank you for supporting my work. - Megan',
  },
  orderConfirmation: {
    sendCopyToSupport: true,
    subjectTemplate: 'Order Confirmation - {{product}}',
    preheaderTemplate: 'Order {{orderId}} confirmed',
    title: 'Order Confirmation',
    greetingTemplate: 'Hello {{customerName}},',
    intro: 'Thank you for your purchase from Megan Houssian Art.',
    detailsHeading: 'Order Details',
    supportMessage: 'If you have any questions, please email Megan at {{supportEmail}}.',
    fulfillmentMessage: 'We will send your shipping confirmation and tracking details when your artwork is on the way.',
    ctaLabel: 'View Originals',
    ctaHref: '/originals',
    outro: 'Thank you for supporting my work.',
  },
});

const emailSettingsProjection = `{
  supportEmail,
  contactNotification{
    recipientEmails,
    subjectTemplate,
    heading,
    intro,
    footer
  },
  commissionNotification{
    recipientEmails,
    subjectTemplate,
    heading,
    intro,
    footer
  },
  collectorWelcome{
    subject,
    preheader,
    title,
    greetingTemplate,
    intro,
    highlightsIntro,
    highlights,
    body,
    ctaLabel,
    ctaHref,
    outro
  },
  orderConfirmation{
    sendCopyToSupport,
    subjectTemplate,
    preheaderTemplate,
    title,
    greetingTemplate,
    intro,
    detailsHeading,
    supportMessage,
    fulfillmentMessage,
    ctaLabel,
    ctaHref,
    outro
  }
}`;

const emailSettingsSingletonQuery = `*[
  _type == "emailSettings" &&
  _id in ["emailSettings", "drafts.emailSettings"]
][0]${emailSettingsProjection}`;

const emailSettingsFallbackQuery = `*[_type == "emailSettings"] | order(_updatedAt desc)[0]${emailSettingsProjection}`;

const emailSettingsClient = sanityClient.withConfig({ useCdn: false });

export async function fetchEmailSettings(): Promise<EmailSettings> {
  const defaults = getDefaultEmailSettings();

  try {
    const singletonSettings = await emailSettingsClient.fetch<PartialEmailSettings | null>(
      emailSettingsSingletonQuery,
      {},
      { cache: 'no-store', next: { revalidate: 0 } }
    );

    const settings =
      singletonSettings ??
      (await emailSettingsClient.fetch<PartialEmailSettings | null>(
        emailSettingsFallbackQuery,
        {},
        { cache: 'no-store', next: { revalidate: 0 } }
      ));

    return {
      supportEmail: normalizeNonEmptyString(settings?.supportEmail, defaults.supportEmail),
      contactNotification: {
        recipientEmails: normalizeEmailList(
          settings?.contactNotification?.recipientEmails,
          defaults.contactNotification.recipientEmails
        ),
        subjectTemplate: normalizeNonEmptyString(
          settings?.contactNotification?.subjectTemplate,
          defaults.contactNotification.subjectTemplate
        ),
        heading: normalizeNonEmptyString(settings?.contactNotification?.heading, defaults.contactNotification.heading),
        intro: normalizeNonEmptyString(settings?.contactNotification?.intro, defaults.contactNotification.intro),
        footer: normalizeNonEmptyString(settings?.contactNotification?.footer, defaults.contactNotification.footer),
      },
      commissionNotification: {
        recipientEmails: normalizeEmailList(
          settings?.commissionNotification?.recipientEmails,
          defaults.commissionNotification.recipientEmails
        ),
        subjectTemplate: normalizeNonEmptyString(
          settings?.commissionNotification?.subjectTemplate,
          defaults.commissionNotification.subjectTemplate
        ),
        heading: normalizeNonEmptyString(
          settings?.commissionNotification?.heading,
          defaults.commissionNotification.heading
        ),
        intro: normalizeNonEmptyString(settings?.commissionNotification?.intro, defaults.commissionNotification.intro),
        footer: normalizeNonEmptyString(
          settings?.commissionNotification?.footer,
          defaults.commissionNotification.footer
        ),
      },
      collectorWelcome: {
        subject: normalizeNonEmptyString(settings?.collectorWelcome?.subject, defaults.collectorWelcome.subject),
        preheader: normalizeNonEmptyString(
          settings?.collectorWelcome?.preheader,
          defaults.collectorWelcome.preheader
        ),
        title: normalizeNonEmptyString(settings?.collectorWelcome?.title, defaults.collectorWelcome.title),
        greetingTemplate: normalizeNonEmptyString(
          settings?.collectorWelcome?.greetingTemplate,
          defaults.collectorWelcome.greetingTemplate
        ),
        intro: normalizeNonEmptyString(settings?.collectorWelcome?.intro, defaults.collectorWelcome.intro),
        highlightsIntro: normalizeNonEmptyString(
          settings?.collectorWelcome?.highlightsIntro,
          defaults.collectorWelcome.highlightsIntro
        ),
        highlights: normalizeStringList(settings?.collectorWelcome?.highlights, defaults.collectorWelcome.highlights),
        body: normalizeNonEmptyString(settings?.collectorWelcome?.body, defaults.collectorWelcome.body),
        ctaLabel: normalizeNonEmptyString(settings?.collectorWelcome?.ctaLabel, defaults.collectorWelcome.ctaLabel),
        ctaHref: normalizeHref(settings?.collectorWelcome?.ctaHref, defaults.collectorWelcome.ctaHref),
        outro: normalizeNonEmptyString(settings?.collectorWelcome?.outro, defaults.collectorWelcome.outro),
      },
      orderConfirmation: {
        sendCopyToSupport: normalizeBoolean(
          settings?.orderConfirmation?.sendCopyToSupport,
          defaults.orderConfirmation.sendCopyToSupport
        ),
        subjectTemplate: normalizeNonEmptyString(
          settings?.orderConfirmation?.subjectTemplate,
          defaults.orderConfirmation.subjectTemplate
        ),
        preheaderTemplate: normalizeNonEmptyString(
          settings?.orderConfirmation?.preheaderTemplate,
          defaults.orderConfirmation.preheaderTemplate
        ),
        title: normalizeNonEmptyString(settings?.orderConfirmation?.title, defaults.orderConfirmation.title),
        greetingTemplate: normalizeNonEmptyString(
          settings?.orderConfirmation?.greetingTemplate,
          defaults.orderConfirmation.greetingTemplate
        ),
        intro: normalizeNonEmptyString(settings?.orderConfirmation?.intro, defaults.orderConfirmation.intro),
        detailsHeading: normalizeNonEmptyString(
          settings?.orderConfirmation?.detailsHeading,
          defaults.orderConfirmation.detailsHeading
        ),
        supportMessage: normalizeNonEmptyString(
          settings?.orderConfirmation?.supportMessage,
          defaults.orderConfirmation.supportMessage
        ),
        fulfillmentMessage: normalizeNonEmptyString(
          settings?.orderConfirmation?.fulfillmentMessage,
          defaults.orderConfirmation.fulfillmentMessage
        ),
        ctaLabel: normalizeNonEmptyString(settings?.orderConfirmation?.ctaLabel, defaults.orderConfirmation.ctaLabel),
        ctaHref: normalizeHref(settings?.orderConfirmation?.ctaHref, defaults.orderConfirmation.ctaHref),
        outro: normalizeNonEmptyString(settings?.orderConfirmation?.outro, defaults.orderConfirmation.outro),
      },
    };
  } catch (error) {
    console.error('Failed to load email settings from Sanity', error);
    return defaults;
  }
}

function normalizeStringList(value: unknown, fallback: string[]) {
  const strings = Array.isArray(value)
    ? value.map((item) => normalizeString(item)).filter(Boolean)
    : [];

  return strings.length > 0 ? strings : fallback;
}

export function applyTemplate(template: string, values: EmailTemplateValues) {
  return template.replace(/{{\s*([\w.]+)\s*}}/g, (_match, key: string) => {
    const rawValue = values[key];
    if (rawValue === null || rawValue === undefined) {
      return '';
    }

    return String(rawValue);
  });
}

export function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function renderHtmlParagraphs(text: string) {
  const paragraphs = text
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  return paragraphs
    .map(
      (paragraph) =>
        `<p style="margin:0 0 12px;font-size:15px;line-height:1.7;color:#4a3a2d;">${escapeHtml(paragraph).replace(/\n/g, '<br/>')}</p>`
    )
    .join('');
}

export function renderHtmlBulletList(items: string[]) {
  const validItems = items.map((item) => item.trim()).filter(Boolean);
  if (validItems.length === 0) {
    return '';
  }

  return `<ul style="margin:0 0 0 18px;padding:0;color:#4a3a2d;">${validItems
    .map(
      (item) =>
        `<li style="margin:0 0 6px;font-size:15px;line-height:1.7;color:#4a3a2d;">${escapeHtml(item)}</li>`
    )
    .join('')}</ul>`;
}

export function renderTextBulletList(items: string[]) {
  return items
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item) => `- ${item}`)
    .join('\n');
}

export function resolveHref(href: string, baseUrl: string, fallback: string) {
  try {
    return new URL(href, baseUrl).toString();
  } catch {
    return fallback;
  }
}
