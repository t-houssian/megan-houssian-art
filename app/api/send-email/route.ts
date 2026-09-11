import { NextResponse } from 'next/server';
import FormData from 'form-data';
import Mailgun from 'mailgun.js';
import { getEmailLinks, renderBrandEmail, renderDetailTable } from '../../../lib/email-template';
import { applyTemplate, escapeHtml, fetchEmailSettings, renderHtmlParagraphs } from '../../../lib/email-settings';
import { InquiryValidationError, parseInquiry } from '../../../lib/inquiry';
import { getReferenceLinks } from '../../../lib/commission-uploads';

export const runtime = 'nodejs';
export const maxDuration = 30;

type EmailRow = {
  label: string;
  value: string;
  preformatted?: boolean;
};

const buildNotificationText = (heading: string, intro: string, rows: EmailRow[], footer: string) => {
  const sections = [
    `${heading}:`,
    intro,
    rows
      .map((row) => `${row.label}: ${row.preformatted ? `\n${row.value}` : row.value}`)
      .join('\n'),
    footer,
  ].filter((section) => section && section.trim().length > 0);

  return sections.join('\n\n');
};

const buildNotificationHtml = (
  heading: string,
  intro: string,
  rows: EmailRow[],
  footer: string,
  branding: Awaited<ReturnType<typeof fetchEmailSettings>>['brandTemplate'],
  referenceHtml = ''
) => {
  const detailRows = rows
    .filter((row) => !row.preformatted)
    .map((row) => ({
      label: row.label,
      value: row.value,
    }));
  const preformattedRowsHtml = rows
    .filter((row) => row.preformatted)
    .map(
      (row) =>
        `<div style="margin:18px 0 0;">
  <p style="margin:0 0 8px;font-size:15px;line-height:1.6;color:${branding.colors.bodyTextColor};font-weight:600;">${escapeHtml(
          row.label
        )}</p>
  <pre style="margin:0;padding:12px;background:${branding.colors.pageBackground};border:1px solid ${branding.colors.borderColor};border-radius:10px;white-space:pre-wrap;font-family:Menlo,Consolas,monospace;font-size:13px;line-height:1.6;color:${branding.colors.bodyTextColor};">${escapeHtml(
          row.value
        )}</pre>
</div>`
    )
    .join('');
  const footerHtml = footer.trim() ? renderHtmlParagraphs(footer, branding.colors.bodyTextColor) : '';

  return renderBrandEmail({
    preheader: heading,
    title: heading,
    intro,
    bodyHtml: `${detailRows.length > 0 ? renderDetailTable(detailRows, branding.colors) : ''}${preformattedRowsHtml}${referenceHtml}${footerHtml}`,
    branding,
  });
};

export async function POST(request: Request) {
  const startedAt = Date.now();
  const requestId = crypto.randomUUID();
  let stage = 'validation';
  let formType: string | undefined;
  let settingsMs = 0;
  let deliveryStartedAt = 0;

  try {
    const inquiry = await parseInquiry(request);
    formType = inquiry.type;
    const key = process.env.MAILGUN_API_KEY?.trim();
    const domain = process.env.MAILGUN_DOMAIN?.trim();
    if (!key || !domain) throw new Error('Email provider is not configured');

    stage = 'settings';
    const settingsStartedAt = Date.now();
    const [emailSettings, referenceLinks] = await Promise.all([
      fetchEmailSettings(), getReferenceLinks(inquiry.uploadSession),
    ]);
    settingsMs = Date.now() - settingsStartedAt;
    const template = inquiry.type === 'commission'
      ? emailSettings.commissionNotification
      : emailSettings.contactNotification;
    const values = {
      name: inquiry.name, email: inquiry.email, subject: inquiry.subject,
      description: inquiry.message, effectiveTotal: inquiry.effectiveTotal, upfrontCost: inquiry.upfrontCost,
    };
    // Subjects are email headers; never allow submitted line breaks into them.
    const subject = applyTemplate(template.subjectTemplate, values).replace(/[\r\n]+/g, ' ');
    const heading = applyTemplate(template.heading, values);
    const intro = applyTemplate(template.intro, values);
    const footer = applyTemplate(template.footer, values);
    const rows: EmailRow[] = [
      { label: 'Name', value: inquiry.name },
      { label: 'Email', value: inquiry.email },
      ...(inquiry.type === 'commission' ? [
        { label: 'Description', value: inquiry.message || 'No additional notes provided.' },
        { label: 'Estimated Total', value: `$${inquiry.effectiveTotal.toFixed(2)}` },
        { label: 'Estimated Deposit (not paid)', value: `$${inquiry.upfrontCost.toFixed(2)}` },
        { label: 'Reference Images', value: [...inquiry.attachments.map((file) => file.name), ...referenceLinks.map((file) => file.name)].join(', ') || 'None provided' },
        { label: 'Canvas Items', value: JSON.stringify(inquiry.canvasItems, null, 2), preformatted: true },
      ] : [
        { label: 'Subject', value: inquiry.subject },
        { label: 'Message', value: inquiry.message },
      ]),
    ];
    const links = getEmailLinks(emailSettings.brandTemplate);
    const referenceText = referenceLinks.length ? `\n\nReference photo downloads (save before the dates below):\n${referenceLinks.map((file) =>
      `${file.name} — expires ${new Date(file.expiresAt).toLocaleDateString('en-US', { timeZone: 'America/Chicago' })}\n${file.url}`
    ).join('\n\n')}` : '';
    const referenceHtml = referenceLinks.length ? `<h2 style="font-size:20px;">Reference photos</h2><p>Photos are stored privately for 35 days. Please download any you need to keep.</p><ul>${referenceLinks.map((file) =>
      `<li><a href="${escapeHtml(file.url)}">${escapeHtml(file.name)}</a> (expires ${new Date(file.expiresAt).toLocaleDateString('en-US', { timeZone: 'America/Chicago' })})</li>`
    ).join('')}</ul>` : '';
    const attachments = await Promise.all(inquiry.attachments.map(async (file) => ({
      filename: file.name.replace(/[\r\n]/g, ''),
      data: Buffer.from(await file.arrayBuffer()),
      contentType: file.type,
    })));
    const mg = new Mailgun(FormData).client({ username: 'api', key, timeout: 15_000 });
    stage = 'delivery';
    deliveryStartedAt = Date.now();
    // Await provider acceptance before showing success. A detached send could be
    // killed when the function finishes and silently lose the customer's request.
    const response = await mg.messages.create(domain, {
      from: process.env.MAILGUN_FROM_EMAIL?.trim() || `Megan Houssian Art <welcome@${domain}>`,
      to: template.recipientEmails,
      'h:Reply-To': inquiry.email,
      subject,
      text: `${buildNotificationText(heading, intro, rows, footer)}${referenceText}\n\nLinks:\n${[
        ...links.footerLinks, ...links.socialLinks,
      ].map((link) => `- ${link.label}: ${link.href}`).join('\n')}`,
      html: buildNotificationHtml(heading, intro, rows, footer, emailSettings.brandTemplate, referenceHtml),
      'o:tracking': 'no',
      ...(attachments.length ? { attachment: attachments } : {}),
    });
    console.info('inquiry.sent', {
      requestId, formType, settingsMs, deliveryMs: Date.now() - deliveryStartedAt,
      totalMs: Date.now() - startedAt, attachmentCount: attachments.length, referenceCount: referenceLinks.length,
      attachmentBytes: inquiry.attachments.reduce((sum, file) => sum + file.size, 0),
      messageId: response.id,
    });
    return NextResponse.json({ success: true, requestId });
  } catch (error) {
    if (error instanceof InquiryValidationError) {
      return NextResponse.json({ error: error.message, requestId }, { status: error.status });
    }
    // Provider errors can contain credentials and form contents. Log only safe
    // diagnostic fields, never the SDK error object or request body.
    const providerStatus = error && typeof error === 'object' && 'status' in error
      && typeof error.status === 'number' ? error.status : undefined;
    console.error('inquiry.failed', {
      requestId, formType, stage, providerStatus, settingsMs,
      deliveryMs: deliveryStartedAt ? Date.now() - deliveryStartedAt : 0,
      totalMs: Date.now() - startedAt,
      errorName: error instanceof Error ? error.name : 'ProviderError',
    });
    return NextResponse.json({
      error: 'We could not confirm your message was sent. Please try again, or email meganhoussianart@gmail.com directly.',
      requestId,
    }, { status: 502 });
  }
}
