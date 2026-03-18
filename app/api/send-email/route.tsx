// app/api/send-email/route.ts
import { NextResponse } from 'next/server';
import FormData from 'form-data';
import Mailgun from 'mailgun.js';
import { applyTemplate, escapeHtml, fetchEmailSettings, renderHtmlParagraphs } from '../../../lib/email-settings';

const MAX_ATTACHMENT_BYTES = 25 * 1024 * 1024;

// Initialize Mailgun client
const mailgun = new Mailgun(FormData);
const mg = mailgun.client({
  username: 'api',
  key: process.env.MAILGUN_API_KEY || 'key-yourkeyhere'
});
const domain =
  process.env.MAILGUN_DOMAIN || 'sandboxa69135ee3d8a4b649d035d06cc9f7ac1.mailgun.org';

// Set a default "from" address in the proper format. If MAILGUN_FROM_EMAIL is not set,
// use a default that matches the sample: "Excited User <mailgun@{domain}>"
const defaultFrom =
  process.env.MAILGUN_FROM_EMAIL ||
  `Excited User <mailgun@${domain}>`;

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

const buildNotificationHtml = (heading: string, intro: string, rows: EmailRow[], footer: string) => {
  const introHtml = intro.trim() ? renderHtmlParagraphs(intro) : '';
  const rowsHtml = rows
    .map((row) => {
      if (row.preformatted) {
        return `<div><strong>${escapeHtml(row.label)}:</strong><pre style="margin:6px 0 0;padding:12px;background:#f7f2ea;border-radius:10px;white-space:pre-wrap;">${escapeHtml(
          row.value
        )}</pre></div>`;
      }

      const renderedValue = escapeHtml(row.value).replace(/\n/g, '<br/>');
      return `<p><strong>${escapeHtml(row.label)}:</strong> ${renderedValue}</p>`;
    })
    .join('');
  const footerHtml = footer.trim() ? renderHtmlParagraphs(footer) : '';

  return `
<h2>${escapeHtml(heading)}</h2>
${introHtml}
${rowsHtml}
${footerHtml}
          `;
};

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get('content-type') || '';
    let messageData;
    const emailSettings = await fetchEmailSettings();

    if (contentType.includes('multipart/form-data')) {
      const form = await request.formData();

      if (form.has('canvasItems')) {
        const name = String(form.get('name') || '');
        const email = String(form.get('email') || '');
        const description = String(form.get('description') || '');
        const canvasItemsRaw = form.get('canvasItems');
        const effectiveTotal = Number(form.get('effectiveTotal') || 0);
        const upfrontCost = Number(form.get('upfrontCost') || 0);

        let canvasItems: unknown = [];
        if (typeof canvasItemsRaw === 'string') {
          try {
            canvasItems = JSON.parse(canvasItemsRaw);
          } catch (error) {
            console.error('Failed to parse canvasItems JSON:', error);
            return NextResponse.json({ error: 'Invalid commission data provided.' }, { status: 400 });
          }
        }

        const attachments = form
          .getAll('referenceImages')
          .filter((value): value is File => value instanceof File && value.size > 0);

        const attachmentsTotal = attachments.reduce((sum, file) => sum + file.size, 0);
        if (attachmentsTotal > MAX_ATTACHMENT_BYTES) {
          return NextResponse.json({ error: 'Attachments exceed the 25MB total limit.' }, { status: 400 });
        }

        const attachmentPayload = await Promise.all(
          attachments.map(async (file) => ({
            filename: file.name,
            data: Buffer.from(await file.arrayBuffer()),
            contentType: file.type || undefined,
          }))
        );

        const attachmentSummary = attachments
          .map((file) => `${file.name} (${(file.size / (1024 * 1024)).toFixed(2)} MB)`)
          .join(', ');
        const attachmentTotalMb = (attachmentsTotal / (1024 * 1024)).toFixed(2);
        const templateValues = {
          name,
          email,
          description,
          effectiveTotal,
          upfrontCost,
        };
        const subject = applyTemplate(emailSettings.commissionNotification.subjectTemplate, templateValues);
        const heading = applyTemplate(emailSettings.commissionNotification.heading, templateValues);
        const intro = applyTemplate(emailSettings.commissionNotification.intro, templateValues);
        const footer = applyTemplate(emailSettings.commissionNotification.footer, templateValues);
        const rows: EmailRow[] = [
          { label: 'Name', value: name || 'N/A' },
          { label: 'Email', value: email || 'N/A' },
          { label: 'Description', value: description || 'No additional notes provided.' },
          { label: 'Total', value: String(effectiveTotal) },
          { label: 'Upfront Cost', value: String(upfrontCost) },
          { label: 'Reference Images', value: attachmentSummary || 'None provided' },
          {
            label: 'Reference Images Total Size',
            value: attachmentPayload.length ? `${attachmentTotalMb} MB` : '0 MB',
          },
          {
            label: 'Canvas Items',
            value: JSON.stringify(canvasItems, null, 2),
            preformatted: true,
          },
        ];

        messageData = {
          from: defaultFrom,
          to: emailSettings.commissionNotification.recipientEmails,
          subject,
          text: buildNotificationText(heading, intro, rows, footer),
          html: buildNotificationHtml(heading, intro, rows, footer),
          attachment: attachmentPayload.length ? attachmentPayload : undefined,
        };
      } else {
        const firstName = String(form.get('firstName') || '');
        const lastName = String(form.get('lastName') || '');
        const email = String(form.get('email') || '');
        const subject = String(form.get('subject') || 'No Subject');
        const message = String(form.get('message') || '');
        const fullName = `${firstName} ${lastName}`.trim();
        const templateValues = {
          name: fullName,
          email,
          subject,
        };
        const heading = applyTemplate(emailSettings.contactNotification.heading, templateValues);
        const intro = applyTemplate(emailSettings.contactNotification.intro, templateValues);
        const footer = applyTemplate(emailSettings.contactNotification.footer, templateValues);
        const rows: EmailRow[] = [
          { label: 'Name', value: fullName || 'N/A' },
          { label: 'Email', value: email || 'N/A' },
          { label: 'Subject', value: subject || 'No Subject' },
          { label: 'Message', value: message || 'No message provided.' },
        ];

        messageData = {
          from: defaultFrom,
          to: emailSettings.contactNotification.recipientEmails,
          subject: applyTemplate(emailSettings.contactNotification.subjectTemplate, templateValues),
          text: buildNotificationText(heading, intro, rows, footer),
          html: buildNotificationHtml(heading, intro, rows, footer),
        };
      }
    } else {
      const data = await request.json();

      if ('canvasItems' in data) {
        const { name, email, description, canvasItems, effectiveTotal, upfrontCost } = data;
        const templateValues = {
          name,
          email,
          description,
          effectiveTotal,
          upfrontCost,
        };
        const heading = applyTemplate(emailSettings.commissionNotification.heading, templateValues);
        const intro = applyTemplate(emailSettings.commissionNotification.intro, templateValues);
        const footer = applyTemplate(emailSettings.commissionNotification.footer, templateValues);
        const rows: EmailRow[] = [
          { label: 'Name', value: String(name || 'N/A') },
          { label: 'Email', value: String(email || 'N/A') },
          { label: 'Description', value: String(description || 'No additional notes provided.') },
          { label: 'Total', value: String(effectiveTotal ?? '') },
          { label: 'Upfront Cost', value: String(upfrontCost ?? '') },
          {
            label: 'Canvas Items',
            value: JSON.stringify(canvasItems, null, 2),
            preformatted: true,
          },
        ];

        messageData = {
          from: defaultFrom,
          to: emailSettings.commissionNotification.recipientEmails,
          subject: applyTemplate(emailSettings.commissionNotification.subjectTemplate, templateValues),
          text: buildNotificationText(heading, intro, rows, footer),
          html: buildNotificationHtml(heading, intro, rows, footer),
        };
      } else {
        const { firstName, lastName, email, subject, message } = data;
        const fullName = `${firstName} ${lastName}`.trim();
        const templateValues = {
          name: fullName,
          email,
          subject,
        };
        const heading = applyTemplate(emailSettings.contactNotification.heading, templateValues);
        const intro = applyTemplate(emailSettings.contactNotification.intro, templateValues);
        const footer = applyTemplate(emailSettings.contactNotification.footer, templateValues);
        const rows: EmailRow[] = [
          { label: 'Name', value: fullName || 'N/A' },
          { label: 'Email', value: String(email || 'N/A') },
          { label: 'Subject', value: String(subject || 'No Subject') },
          { label: 'Message', value: String(message || 'No message provided.') },
        ];

        messageData = {
          from: defaultFrom,
          to: emailSettings.contactNotification.recipientEmails,
          subject: applyTemplate(emailSettings.contactNotification.subjectTemplate, templateValues),
          text: buildNotificationText(heading, intro, rows, footer),
          html: buildNotificationHtml(heading, intro, rows, footer),
        };
      }
    }

    if (!messageData) {
      return NextResponse.json({ error: 'Unable to process request.' }, { status: 400 });
    }

    const response = await mg.messages.create(domain, messageData);
    return NextResponse.json({ success: true, data: response });
  } catch (error) {
    console.error('Error sending email:', error);
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
  }
}
