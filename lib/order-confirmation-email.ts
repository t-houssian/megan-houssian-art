import FormData from 'form-data';
import Mailgun from 'mailgun.js';
import { getEmailLinks, renderBrandEmail, renderDetailTable } from './email-template';
import { applyTemplate, fetchEmailSettings, renderHtmlParagraphs, resolveHref } from './email-settings';
import { formatCurrency, formatCurrencyFromCents } from './money';

type OrderConfirmationEmailInput = {
  customerEmail?: string | null;
  customerName?: string | null;
  paymentMethod: 'stripe' | 'paypal';
  orderId: string;
  product?: string | null;
  amountCents?: number | null;
  amountDollars?: string | number | null;
  shippingOption?: 'shipping' | 'pickup' | string | null;
  shippingAddress?: {
    line1?: string | null;
    line2?: string | null;
    city?: string | null;
    state?: string | null;
    postalCode?: string | null;
    country?: string | null;
  } | null;
};

const mailgun = new Mailgun(FormData);
const DEFAULT_ORDER_NOTIFICATION_EMAIL = 'meganhoussianart@gmail.com';
const DEFAULT_ORDER_NOTIFICATION_CC_EMAIL = 'tylerhoussian@gmail.com';

const getDomain = () =>
  process.env.MAILGUN_DOMAIN || 'sandboxa69135ee3d8a4b649d035d06cc9f7ac1.mailgun.org';

const getFrom = (domain: string) =>
  process.env.MAILGUN_FROM_EMAIL || `Megan Houssian Art <welcome@${domain}>`;

const formatAmount = (input: OrderConfirmationEmailInput): string => {
  if (typeof input.amountCents === 'number' && Number.isFinite(input.amountCents)) {
    return `${formatCurrencyFromCents(input.amountCents)} USD`;
  }

  if (typeof input.amountDollars === 'number' && Number.isFinite(input.amountDollars)) {
    return `${formatCurrency(input.amountDollars)} USD`;
  }

  if (typeof input.amountDollars === 'string' && input.amountDollars.trim()) {
    const parsed = Number(input.amountDollars);
    if (Number.isFinite(parsed)) {
      return `${formatCurrency(parsed)} USD`;
    }
  }

  return 'N/A';
};

const formatShippingMethod = (shippingOption: OrderConfirmationEmailInput['shippingOption']) =>
  shippingOption === 'pickup' ? 'Gallery Pickup' : 'Shipping';

const formatAddressText = (shippingAddress: OrderConfirmationEmailInput['shippingAddress']) => {
  if (!shippingAddress?.line1) return 'N/A';

  const line2 = shippingAddress.line2 ? `\n${shippingAddress.line2}` : '';
  const locality = [shippingAddress.city, shippingAddress.state, shippingAddress.postalCode]
    .filter(Boolean)
    .join(', ');
  const country = shippingAddress.country || '';
  return `${shippingAddress.line1}${line2}\n${locality}${country ? `\n${country}` : ''}`;
};

const formatAddressSingleLine = (shippingAddress: OrderConfirmationEmailInput['shippingAddress']) => {
  if (!shippingAddress?.line1) return 'N/A';

  return [
    shippingAddress.line1,
    shippingAddress.line2,
    [shippingAddress.city, shippingAddress.state, shippingAddress.postalCode].filter(Boolean).join(', '),
    shippingAddress.country,
  ]
    .filter(Boolean)
    .join(' | ');
};

const normalizeEmail = (email: string) => email.trim().toLowerCase();

const getUniqueEmails = (emails: Array<string | null | undefined>) =>
  emails
    .filter((email): email is string => Boolean(email && email.trim()))
    .map(normalizeEmail)
    .filter((email, index, all) => all.indexOf(email) === index);

const getOrderNotificationRecipients = () => {
  const to = getUniqueEmails([
    process.env.ORDER_NOTIFICATION_EMAIL,
    DEFAULT_ORDER_NOTIFICATION_EMAIL,
  ]);
  const cc = getUniqueEmails([
    process.env.ORDER_NOTIFICATION_CC_EMAIL,
    DEFAULT_ORDER_NOTIFICATION_CC_EMAIL,
  ]).filter((email) => !to.includes(email));

  return { to, cc };
};

export async function sendOrderConfirmationEmail(input: OrderConfirmationEmailInput) {
  if (!process.env.MAILGUN_API_KEY) {
    throw new Error('MAILGUN_API_KEY is not configured');
  }

  const domain = getDomain();
  const from = getFrom(domain);
  const emailSettings = await fetchEmailSettings();
  const orderSettings = emailSettings.orderConfirmation;
  const amount = formatAmount(input);
  const shippingMethod = formatShippingMethod(input.shippingOption);
  const customerName = input.customerName?.trim() || 'Collector';
  const product = input.product || 'Artwork Purchase';
  const links = getEmailLinks(emailSettings.brandTemplate);
  const templateValues = {
    customerName,
    orderId: input.orderId,
    product,
    amount,
    paymentMethod: input.paymentMethod.toUpperCase(),
    shippingMethod,
    supportEmail: emailSettings.supportEmail,
  };
  const shippingAddressText =
    input.shippingOption === 'pickup' ? 'N/A (Gallery Pickup)' : formatAddressText(input.shippingAddress);
  const shippingAddressSingleLine =
    input.shippingOption === 'pickup' ? 'N/A (Gallery Pickup)' : formatAddressSingleLine(input.shippingAddress);
  const ctaHref = resolveHref(orderSettings.ctaHref, links.homeUrl, links.originalsUrl);
  const supportMessageText = applyTemplate(orderSettings.supportMessage, templateValues);
  const supportEmailAnchor = `<a href="mailto:${emailSettings.supportEmail}" style="color:${emailSettings.brandTemplate.colors.linkColor};text-decoration:underline;">${emailSettings.supportEmail}</a>`;
  const supportMessageHtml = renderHtmlParagraphs(
    supportMessageText,
    emailSettings.brandTemplate.colors.bodyTextColor
  ).replace(emailSettings.supportEmail, supportEmailAnchor);
  const fulfillmentMessageText = applyTemplate(orderSettings.fulfillmentMessage, templateValues);
  const customerTo = getUniqueEmails([input.customerEmail]);
  const notificationRecipients = getOrderNotificationRecipients();
  const hasCustomerRecipient = customerTo.length > 0;
  const hasNotificationRecipient = notificationRecipients.to.length > 0;

  if (!hasCustomerRecipient && !hasNotificationRecipient) {
    return;
  }

  const customerText = [
    applyTemplate(orderSettings.greetingTemplate, templateValues),
    '',
    applyTemplate(orderSettings.intro, templateValues),
    '',
    applyTemplate(orderSettings.detailsHeading, templateValues),
    `- Order ID: ${input.orderId}`,
    `- Artwork: ${product}`,
    `- Payment Method: ${input.paymentMethod.toUpperCase()}`,
    `- Total Paid: ${amount}`,
    `- Delivery Method: ${shippingMethod}`,
    '- Shipping Address:',
    shippingAddressText,
    '',
    supportMessageText,
    fulfillmentMessageText,
    '',
    'Shop and updates:',
    ...links.footerLinks.map((link) => `- ${link.label}: ${link.href}`),
    ...links.socialLinks.map((link) => `- ${link.label}: ${link.href}`),
    '',
    applyTemplate(orderSettings.outro, templateValues),
  ]
    .filter((line, index, all) => {
      if (line) return true;
      return index > 0 && all[index - 1] !== '';
    })
    .join('\n');

  const customerDetailsHtml = renderDetailTable([
    { label: 'Order ID', value: input.orderId },
    { label: 'Artwork', value: product },
    { label: 'Payment Method', value: input.paymentMethod.toUpperCase() },
    { label: 'Total Paid', value: amount },
    { label: 'Delivery Method', value: shippingMethod },
    { label: 'Shipping Address', value: shippingAddressSingleLine },
  ], emailSettings.brandTemplate.colors);

  const customerBodyHtml = `
<h2 style="margin:4px 0 12px;font-size:21px;line-height:1.3;color:${emailSettings.brandTemplate.colors.titleColor};font-weight:500;">${applyTemplate(
    orderSettings.detailsHeading,
    templateValues
  )}</h2>
${customerDetailsHtml}
${supportMessageHtml}
${renderHtmlParagraphs(fulfillmentMessageText, emailSettings.brandTemplate.colors.bodyTextColor)}`;

  const customerHtml = renderBrandEmail({
    preheader: applyTemplate(orderSettings.preheaderTemplate, templateValues),
    title: applyTemplate(orderSettings.title, templateValues),
    greeting: applyTemplate(orderSettings.greetingTemplate, templateValues),
    intro: applyTemplate(orderSettings.intro, templateValues),
    bodyHtml: customerBodyHtml,
    cta: {
      label: applyTemplate(orderSettings.ctaLabel, templateValues),
      href: ctaHref,
    },
    outro: applyTemplate(orderSettings.outro, templateValues),
    branding: emailSettings.brandTemplate,
  });

  const mg = mailgun.client({
    username: 'api',
    key: process.env.MAILGUN_API_KEY,
  });
  const replyTo = process.env.MAILGUN_REPLY_TO_EMAIL?.trim() || emailSettings.supportEmail;

  if (hasCustomerRecipient) {
    await mg.messages.create(domain, {
      from,
      to: customerTo,
      'h:Reply-To': replyTo,
      subject: applyTemplate(orderSettings.subjectTemplate, templateValues),
      text: customerText,
      html: customerHtml,
    });
  }

  if (hasNotificationRecipient) {
    const adminDetailsRows = [
      { label: 'Customer Name', value: customerName },
      { label: 'Customer Email', value: input.customerEmail?.trim() || 'N/A' },
      { label: 'Order ID', value: input.orderId },
      { label: 'Artwork', value: product },
      { label: 'Payment Method', value: input.paymentMethod.toUpperCase() },
      { label: 'Total Paid', value: amount },
      { label: 'Delivery Method', value: shippingMethod },
      { label: 'Shipping Address', value: shippingAddressSingleLine },
    ];
    const adminDetailsHtml = renderDetailTable(adminDetailsRows, emailSettings.brandTemplate.colors);
    const adminText = [
      'A new artwork order was completed.',
      '',
      ...adminDetailsRows.map((row) => `- ${row.label}: ${row.value}`),
      '',
      'Follow up with the collector using the customer email above.',
    ].join('\n');
    const adminHtml = renderBrandEmail({
      preheader: `New order ${input.orderId} for ${product}`,
      title: 'New Artwork Order',
      intro: 'A new artwork order was completed through the website.',
      bodyHtml: `
<h2 style="margin:4px 0 12px;font-size:21px;line-height:1.3;color:${emailSettings.brandTemplate.colors.titleColor};font-weight:500;">Transaction Details</h2>
${adminDetailsHtml}
${renderHtmlParagraphs(
  'Follow up with the collector using the customer email above.',
  emailSettings.brandTemplate.colors.bodyTextColor
)}`,
      cta: {
        label: 'Open Website',
        href: links.homeUrl,
      },
      branding: emailSettings.brandTemplate,
    });

    await mg.messages.create(domain, {
      from,
      to: notificationRecipients.to,
      cc: notificationRecipients.cc,
      'h:Reply-To': input.customerEmail?.trim() || replyTo,
      subject: `New order: ${product} - ${amount}`,
      text: adminText,
      html: adminHtml,
    });
  }
}
