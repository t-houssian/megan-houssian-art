import FormData from 'form-data';
import Mailgun from 'mailgun.js';

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
    return `$${(input.amountCents / 100).toFixed(2)} USD`;
  }

  if (typeof input.amountDollars === 'number' && Number.isFinite(input.amountDollars)) {
    return `$${input.amountDollars.toFixed(2)} USD`;
  }

  if (typeof input.amountDollars === 'string' && input.amountDollars.trim()) {
    const parsed = Number(input.amountDollars);
    if (Number.isFinite(parsed)) {
      return `$${parsed.toFixed(2)} USD`;
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

const formatAddressHtml = (shippingAddress: OrderConfirmationEmailInput['shippingAddress']) => {
  if (!shippingAddress?.line1) return 'N/A';

  const lines = [
    shippingAddress.line1,
    shippingAddress.line2,
    [shippingAddress.city, shippingAddress.state, shippingAddress.postalCode].filter(Boolean).join(', '),
    shippingAddress.country,
  ].filter(Boolean) as string[];

  return lines.join('<br/>');
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
  const to = [input.customerEmail, MEGAN_EMAIL]
    .filter((email): email is string => Boolean(email && email.trim()))
    .map((email) => email.trim().toLowerCase())
    .filter((email, index, all) => all.indexOf(email) === index);

  if (to.length === 0) {
    return;
  }

  const shippingAddressText =
    input.shippingOption === 'pickup' ? 'N/A (Gallery Pickup)' : formatAddressText(input.shippingAddress);
  const shippingAddressHtml =
    input.shippingOption === 'pickup' ? 'N/A (Gallery Pickup)' : formatAddressHtml(input.shippingAddress);

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

Thank you for supporting Megan's work.
`;

  const html = `
<p>Hello ${customerName},</p>
<p>Thank you for your purchase from Megan Houssian Art.</p>
<h3>Order Details</h3>
<ul>
  <li><strong>Order ID:</strong> ${input.orderId}</li>
  <li><strong>Artwork:</strong> ${product}</li>
  <li><strong>Payment Method:</strong> ${input.paymentMethod.toUpperCase()}</li>
  <li><strong>Total Paid:</strong> ${amount}</li>
  <li><strong>Delivery Method:</strong> ${shippingMethod}</li>
  <li><strong>Shipping Address:</strong><br/>${shippingAddressHtml}</li>
</ul>
<p>If you have any questions, please email Megan at <a href="mailto:${MEGAN_EMAIL}">${MEGAN_EMAIL}</a>.</p>
<p>We will send your shipping confirmation and tracking codes when we ship out your piece.</p>
<p>Thank you for supporting Megan's work.</p>
`;

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
