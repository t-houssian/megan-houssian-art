// app/api/send-email/route.ts
import { NextResponse } from 'next/server';
import FormData from 'form-data';
import Mailgun from 'mailgun.js';

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

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get('content-type') || '';
    let messageData;

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

        messageData = {
          from: defaultFrom,
          to: [process.env.MAILGUN_TO_EMAIL || 'tylerhoussian@gmail.com'],
          subject: 'New Commission Request',
          text: `
Commission Request:
Name: ${name}
Email: ${email}
Description: ${description}
Total: ${effectiveTotal}
Upfront Cost: ${upfrontCost}
Canvas Items: ${JSON.stringify(canvasItems, null, 2)}
Reference Images: ${attachmentSummary || 'None provided'}
Reference Images Total Size: ${attachmentPayload.length ? `${attachmentTotalMb} MB` : '0 MB'}
          `,
          html: `
<h2>Commission Request</h2>
<p><strong>Name:</strong> ${name}</p>
<p><strong>Email:</strong> ${email}</p>
<p><strong>Description:</strong> ${description || '<em>No additional notes provided.</em>'}</p>
<p><strong>Total:</strong> ${effectiveTotal}</p>
<p><strong>Upfront Cost:</strong> ${upfrontCost}</p>
<p><strong>Reference Images:</strong> ${attachmentSummary || 'None provided'}</p>
<p><strong>Reference Images Total Size:</strong> ${
            attachmentPayload.length ? `${attachmentTotalMb} MB` : '0 MB'
          }</p>
<p><strong>Canvas Items:</strong><br/><pre>${JSON.stringify(canvasItems, null, 2)}</pre></p>
          `,
          attachment: attachmentPayload.length ? attachmentPayload : undefined,
        };
      } else {
        const firstName = String(form.get('firstName') || '');
        const lastName = String(form.get('lastName') || '');
        const email = String(form.get('email') || '');
        const subject = String(form.get('subject') || 'No Subject');
        const message = String(form.get('message') || '');
        const fullName = `${firstName} ${lastName}`.trim();

        messageData = {
          from: defaultFrom,
          to: [process.env.MAILGUN_TO_EMAIL || 'meganhoussianart@gmail.com'],
          subject: `New Contact Request: ${subject}`,
          text: `
Contact Request:
Name: ${fullName}
Email: ${email}
Subject: ${subject}
Message: ${message}
          `,
          html: `
<h2>Contact Request</h2>
<p><strong>Name:</strong> ${fullName}</p>
<p><strong>Email:</strong> ${email}</p>
<p><strong>Subject:</strong> ${subject}</p>
<p><strong>Message:</strong> ${message}</p>
          `,
        };
      }
    } else {
      const data = await request.json();

      if ('canvasItems' in data) {
        const { name, email, description, canvasItems, effectiveTotal, upfrontCost } = data;
        messageData = {
          from: defaultFrom,
          to: [process.env.MAILGUN_TO_EMAIL || 'tylerhoussian@gmail.com'],
          subject: 'New Commission Request',
          text: `
Commission Request:
Name: ${name}
Email: ${email}
Description: ${description}
Total: ${effectiveTotal}
Upfront Cost: ${upfrontCost}
Canvas Items: ${JSON.stringify(canvasItems, null, 2)}
          `,
          html: `
<h2>Commission Request</h2>
<p><strong>Name:</strong> ${name}</p>
<p><strong>Email:</strong> ${email}</p>
<p><strong>Description:</strong> ${description}</p>
<p><strong>Total:</strong> ${effectiveTotal}</p>
<p><strong>Upfront Cost:</strong> ${upfrontCost}</p>
<p><strong>Canvas Items:</strong><br/><pre>${JSON.stringify(canvasItems, null, 2)}</pre></p>
          `,
        };
      } else {
        const { firstName, lastName, email, subject, message } = data;
        const fullName = `${firstName} ${lastName}`;
        messageData = {
          from: defaultFrom,
          to: [process.env.MAILGUN_TO_EMAIL || 'meganhoussianart@gmail.com'],
          subject: `New Contact Request: ${subject}`,
          text: `
Contact Request:
Name: ${fullName}
Email: ${email}
Subject: ${subject}
Message: ${message}
          `,
          html: `
<h2>Contact Request</h2>
<p><strong>Name:</strong> ${fullName}</p>
<p><strong>Email:</strong> ${email}</p>
<p><strong>Subject:</strong> ${subject}</p>
<p><strong>Message:</strong> ${message}</p>
          `,
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
