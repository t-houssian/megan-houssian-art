import { NextResponse } from "next/server";
import FormData from "form-data";
import Mailgun from "mailgun.js";
import { getEmailLinks, renderBrandEmail } from "../../../../lib/email-template";

const KIT_API_BASE_URL = "https://api.kit.com/v4";
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAILGUN_FALLBACK_DOMAIN = "sandboxa69135ee3d8a4b649d035d06cc9f7ac1.mailgun.org";

const mailgun = new Mailgun(FormData);

type KitSubscriberResponse = {
  subscriber?: {
    id?: number;
  };
  message?: string;
  error?: string;
  errors?: Array<{ message?: string }>;
};

const getErrorMessage = async (response: Response): Promise<string> => {
  const fallback = "Unable to subscribe right now. Please try again shortly.";

  try {
    const payload = (await response.json()) as KitSubscriberResponse;
    if (typeof payload?.error === "string" && payload.error.trim()) {
      return payload.error;
    }
    if (typeof payload?.message === "string" && payload.message.trim()) {
      return payload.message;
    }
    if (Array.isArray(payload?.errors) && payload.errors.length > 0) {
      const firstError = payload.errors.find((entry) => typeof entry?.message === "string" && entry.message.trim());
      if (firstError?.message) {
        return firstError.message;
      }
    }
  } catch {
    // Ignore parsing failures and use fallback.
  }

  return fallback;
};

const isNonEmptyString = (value: unknown): value is string => typeof value === "string" && value.trim().length > 0;

const isValidReferrer = (value: unknown): value is string => {
  if (!isNonEmptyString(value)) return false;
  try {
    new URL(value.trim());
    return true;
  } catch {
    return false;
  }
};

const sendCollectorWelcomeEmail = async (params: { email: string; firstName: string }) => {
  const mailgunApiKey = process.env.MAILGUN_API_KEY;
  if (!mailgunApiKey) {
    console.warn("MAILGUN_API_KEY is not set; skipping collector welcome email.");
    return;
  }

  const domain = process.env.MAILGUN_DOMAIN || MAILGUN_FALLBACK_DOMAIN;
  const from = process.env.MAILGUN_FROM_EMAIL || `Megan Houssian Art <mailgun@${domain}>`;
  const mg = mailgun.client({
    username: "api",
    key: mailgunApiKey,
  });

  const collectorName = params.firstName.trim() || "Collector";
  const links = getEmailLinks();
  const text = `Hi ${collectorName},

Thanks for joining my Collector List.

You are now on the list for:
- Private preview links before new originals go live
- New painting releases
- Studio updates

Explore:
- Originals: ${links.originalsUrl}
- Print Shop: ${links.printsUrl}
- Contact: ${links.contactUrl}
${links.pinterestUrl ? `- Pinterest: ${links.pinterestUrl}\n` : ''}${links.facebookUrl ? `- Facebook: ${links.facebookUrl}\n` : ''}${
    links.instagramUrl ? `- Instagram: ${links.instagramUrl}\n` : ''
  }

Grateful you are here.
Megan Houssian
`;

  const html = renderBrandEmail({
    preheader: "Welcome to Megan's Collector List",
    title: "Welcome to the Collector List",
    greeting: `Hi ${collectorName},`,
    intro: "Thanks for signing up.",
    bodyHtml: `
<p style="margin:0 0 12px;font-size:15px;line-height:1.7;color:#4a3a2d;">You are now on the list for:</p>
<ul style="margin:0 0 0 18px;padding:0;color:#4a3a2d;">
  <li style="margin:0 0 6px;">Private preview links before new originals go live</li>
  <li style="margin:0 0 6px;">New painting releases</li>
  <li style="margin:0 0 6px;">Studio updates</li>
</ul>
<p style="margin:16px 0 0;font-size:15px;line-height:1.7;color:#4a3a2d;">
I am so grateful you are here and I cannot wait to share new work with you.
</p>`,
    cta: {
      label: "Browse Originals",
      href: links.originalsUrl,
    },
    outro: "Thank you for supporting my work. - Megan",
  });

  await mg.messages.create(domain, {
    from,
    to: [params.email],
    subject: "You're on the Collector List",
    text,
    html,
  });
};

export async function POST(request: Request) {
  const apiKey = process.env.KIT_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ success: false, error: "Email signup is not configured yet." }, { status: 503 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: "Invalid request body." }, { status: 400 });
  }

  const email = isNonEmptyString((body as { email?: unknown })?.email)
    ? (body as { email: string }).email.trim().toLowerCase()
    : "";
  const firstName = isNonEmptyString((body as { firstName?: unknown })?.firstName)
    ? (body as { firstName: string }).firstName.trim()
    : "";
  const referrer = isValidReferrer((body as { referrer?: unknown })?.referrer)
    ? (body as { referrer: string }).referrer.trim()
    : undefined;

  if (!EMAIL_PATTERN.test(email)) {
    return NextResponse.json({ success: false, error: "Please enter a valid email address." }, { status: 400 });
  }

  if (!firstName) {
    return NextResponse.json({ success: false, error: "Please enter your first name." }, { status: 400 });
  }

  try {
    const createSubscriberResponse = await fetch(`${KIT_API_BASE_URL}/subscribers`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Kit-Api-Key": apiKey,
      },
      body: JSON.stringify({
        email_address: email,
        first_name: firstName,
        state: "active",
      }),
    });

    if (!createSubscriberResponse.ok) {
      const error = await getErrorMessage(createSubscriberResponse);
      return NextResponse.json({ success: false, error }, { status: createSubscriberResponse.status || 502 });
    }

    const createPayload = (await createSubscriberResponse.json()) as KitSubscriberResponse;
    const subscriberId = createPayload?.subscriber?.id;

    if (typeof subscriberId !== "number") {
      return NextResponse.json({ success: false, error: "Unable to subscribe right now. Please try again shortly." }, { status: 502 });
    }

    const formId = process.env.KIT_FORM_ID?.trim();
    if (formId) {
      if (!/^\d+$/.test(formId)) {
        console.error("Invalid KIT_FORM_ID configured. Expected a numeric form id.");
        return NextResponse.json({ success: false, error: "Email signup is temporarily unavailable." }, { status: 503 });
      }

      const addToFormResponse = await fetch(`${KIT_API_BASE_URL}/forms/${formId}/subscribers/${subscriberId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Kit-Api-Key": apiKey,
        },
        body: JSON.stringify({
          referrer,
        }),
      });

      if (!addToFormResponse.ok) {
        const error = await getErrorMessage(addToFormResponse);
        return NextResponse.json({ success: false, error }, { status: addToFormResponse.status || 502 });
      }
    }

    try {
      await sendCollectorWelcomeEmail({ email, firstName });
    } catch (error) {
      console.error("Failed to send collector welcome email:", error);
    }

    return NextResponse.json({
      success: true,
      message: "You're in. Watch your inbox for early access updates.",
    });
  } catch (error) {
    console.error("Kit subscribe error:", error);
    return NextResponse.json({ success: false, error: "Unable to subscribe right now. Please try again shortly." }, { status: 500 });
  }
}
