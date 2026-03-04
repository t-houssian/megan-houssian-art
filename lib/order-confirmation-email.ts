import FormData from 'form-data';
import Mailgun from 'mailgun.js';
import { getEmailLinks, renderBrandEmail, renderDetailTable } from './email-template';
import { formatRoundedCents, formatRoundedDollars } from './money';

const MEGAN_EMAIL = 'meganhoussianart@gmail.com';

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

const getDomain = () =>
  process.env.MAILGUN_DOMAIN || 'sandboxa69135ee3d8a4b649d035d06cc9f7ac1.mailgun.org';

const getFrom = (domain: string) =>
  process.env.MAILGUN_FROM_EMAIL || `Megan Houssian Art <mailgun@${domain}>`;

const formatAmount = (input: OrderConfirmationEmailInput): string => {
  if (typeof input.amountCents === 'number' && Number.isFinite(input.amountCents)) {
    return `${formatRoundedCents(input.amountCents)} USD`;
  }

  if (typeof input.amountDollars === 'number' && Number.isFinite(input.amountDollars)) {
    return `${formatRoundedDollars(input.amountDollars)} USD`;
  }

  if (typeof input.amountDollars === 'string' && input.amountDollars.trim()) {
    const parsed = Number(input.amountDollars);
    if (Number.isFinite(parsed)) {
      return `${formatRoundedDollars(parsed)} USD`;
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

export async function sendOrderConfirmationEmail(input: OrderConfirmationEmailInput) {
  if (!process.env.MAILGUN_API_KEY) {
    throw new Error('MAILGUN_API_KEY is not configured');
  }

  const domain = getDomain();
  const from = getFrom(domain);
  const amount = formatAmount(input);
  const shippingMethod = formatShippingMethod(input.shippingOption);
  const customerName = input.customerName?.trim() || 'Collector';
  const product = input.product || 'Artwork Purchase';
  const links = getEmailLinks();
  const to = [input.customerEmail, MEGAN_EMAIL]
    .filter((email): email is string => Boolean(email && email.trim()))
    .map((email) => email.trim().toLowerCase())
    .filter((email, index, all) => all.indexOf(email) === index);

  if (to.length === 0) {
    return;
  }

  const shippingAddressText =
    input.shippingOption === 'pickup' ? 'N/A (Gallery Pickup)' : formatAddressText(input.shippingAddress);
  const shippingAddressSingleLine =
    input.shippingOption === 'pickup' ? 'N/A (Gallery Pickup)' : formatAddressSingleLine(input.shippingAddress);

  const text = `Hello ${customerName},

Thank you for your purchase from Megan Houssian Art.

Order Details
- Order ID: ${input.orderId}
- Artwork: ${product}
- Payment Method: ${input.paymentMethod.toUpperCase()}
- Total Paid: ${amount}
- Delivery Method: ${shippingMethod}
- Shipping Address:
${shippingAddressText}

If you have any questions, please email Megan at ${MEGAN_EMAIL}.
We will send your shipping confirmation and tracking codes when we ship out your piece.

Shop and updates:
- Website: ${links.homeUrl}
- Originals: ${links.originalsUrl}
- Print Shop: ${links.printsUrl}
- Contact: ${links.contactUrl}
${links.pinterestUrl ? `- Pinterest: ${links.pinterestUrl}\n` : ''}${links.facebookUrl ? `- Facebook: ${links.facebookUrl}\n` : ''}${
    links.instagramUrl ? `- Instagram: ${links.instagramUrl}\n` : ''
  }

Thank you for supporting my work.
`;

  const detailsHtml = renderDetailTable([
    { label: 'Order ID', value: input.orderId },
    { label: 'Artwork', value: product },
    { label: 'Payment Method', value: input.paymentMethod.toUpperCase() },
    { label: 'Total Paid', value: amount },
    { label: 'Delivery Method', value: shippingMethod },
    { label: 'Shipping Address', value: shippingAddressSingleLine },
  ]);

  const bodyHtml = `
<h2 style="margin:4px 0 12px;font-size:21px;line-height:1.3;color:#3f3126;font-weight:500;">Order Details</h2>
${detailsHtml}
<p style="margin:18px 0 0;font-size:15px;line-height:1.7;color:#4a3a2d;">
If you have any questions, please email Megan at <a href="mailto:${MEGAN_EMAIL}" style="color:#6b4f3a;text-decoration:underline;">${MEGAN_EMAIL}</a>.
</p>
<p style="margin:10px 0 0;font-size:15px;line-height:1.7;color:#4a3a2d;">
We will send your shipping confirmation and tracking details when your artwork is on the way.
</p>`;

  const html = renderBrandEmail({
    preheader: `Order ${input.orderId} confirmed`,
    title: 'Order Confirmation',
    greeting: `Hello ${customerName},`,
    intro: 'Thank you for your purchase from Megan Houssian Art.',
    bodyHtml,
    cta: {
      label: 'View Originals',
      href: links.originalsUrl,
    },
    outro: "Thank you for supporting my work.",
  });

  const mg = mailgun.client({
    username: 'api',
    key: process.env.MAILGUN_API_KEY,
  });

  await mg.messages.create(domain, {
    from,
    to,
    subject: `Order Confirmation - ${product}`,
    text,
    html,
  });
}
