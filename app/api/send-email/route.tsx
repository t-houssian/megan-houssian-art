// app/api/send-email/route.ts
import { NextResponse } from 'next/server';
import FormData from 'form-data';
import Mailgun from 'mailgun.js';

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
    const data = await request.json();
    let messageData;

    // If the payload contains canvasItems, treat it as a commission request.
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
        `
      };
    } else {
      // Otherwise, treat it as a contact form submission.
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
        `
      };
    }

    // Send the email using Mailgun
    const response = await mg.messages.create(domain, messageData);
    return NextResponse.json({ success: true, data: response });
  } catch (error) {
    console.error('Error sending email:', error);
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
  }
}
