import { NextResponse } from "next/server";
import FormData from "form-data";
import Mailgun from "mailgun.js";
import { getEmailLinks, renderBrandEmail, renderDetailTable } from "../../../../lib/email-template";
import {
  applyTemplate,
  escapeHtml,
  fetchEmailSettings,
  renderHtmlParagraphs,
  resolveHref,
} from "../../../../lib/email-settings";
import {
  type CollectorSignupEarlyAccessContext,
  fetchCollectorSignupEarlyAccessContexts,
} from "../../../../lib/originals";

const KIT_API_BASE_URL = "https://api.kit.com/v4";
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAILGUN_FALLBACK_DOMAIN = "sandboxa69135ee3d8a4b649d035d06cc9f7ac1.mailgun.org";
const CURRENT_COLLECTION_EARLY_ACCESS: CollectorSignupEarlyAccessContext = {
  sourceType: "collection",
  sourceTitle: "Evening Light Collection",
  password: "HillCountry26",
  message: "The Evening Light Collection is in early access now.",
  accessHref: "/originals",
};

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

const buildEarlyAccessText = (contexts: CollectorSignupEarlyAccessContext[]) => {
  if (contexts.length === 0) return "";

  return [
    "Collector early access:",
    ...contexts.flatMap((context) => [
      `- ${context.sourceTitle}: password ${context.password}`,
      context.message ? `  ${context.message}` : "",
      `  Open: ${resolveHref(context.accessHref, getEmailLinks().homeUrl, getEmailLinks().originalsUrl)}`,
    ]),
  ]
    .filter(Boolean)
    .join("\n");
};

const buildEarlyAccessHtml = (contexts: CollectorSignupEarlyAccessContext[], colors: { bodyTextColor: string }) => {
  if (contexts.length === 0) return "";

  const rows = contexts.flatMap((context) => [
    { label: context.sourceType === "collection" ? "Collection" : "Piece", value: context.sourceTitle },
    { label: "Password", value: context.password },
  ]);

  const messages = contexts
    .map((context) => context.message?.trim())
    .filter((message): message is string => Boolean(message));

  return `
    <div style="margin:24px 0 0;">
      <h2 style="margin:0 0 12px;font-size:20px;line-height:1.3;color:${colors.bodyTextColor};">Collector early access</h2>
      ${
        messages.length > 0
          ? messages
              .map(
                (message) =>
                  `<p style="margin:0 0 12px;font-size:15px;line-height:1.7;color:${colors.bodyTextColor};">${escapeHtml(message)}</p>`
              )
              .join("")
          : `<p style="margin:0 0 12px;font-size:15px;line-height:1.7;color:${colors.bodyTextColor};">Your collector password is below. Use it on the artwork page to purchase during the early access window.</p>`
      }
      ${renderDetailTable(rows)}
    </div>
  `;
};

const getCollectorWelcomeEarlyAccessContexts = async (referrer?: string) => {
  const contexts = await fetchCollectorSignupEarlyAccessContexts(referrer);
  const hasCurrentCollectionPassword = contexts.some(
    (context) =>
      context.sourceType === CURRENT_COLLECTION_EARLY_ACCESS.sourceType &&
      context.sourceTitle.toLowerCase() === CURRENT_COLLECTION_EARLY_ACCESS.sourceTitle.toLowerCase() &&
      context.password === CURRENT_COLLECTION_EARLY_ACCESS.password
  );

  return hasCurrentCollectionPassword
    ? contexts
    : [CURRENT_COLLECTION_EARLY_ACCESS, ...contexts];
};

const sendCollectorWelcomeEmail = async (params: {
  email: string;
  firstName: string;
  earlyAccessContexts: CollectorSignupEarlyAccessContext[];
}) => {
  const mailgunApiKey = process.env.MAILGUN_API_KEY;
  if (!mailgunApiKey) {
    console.warn("MAILGUN_API_KEY is not set; skipping collector welcome email.");
    return;
  }

  const domain = process.env.MAILGUN_DOMAIN || MAILGUN_FALLBACK_DOMAIN;
  const from = process.env.MAILGUN_FROM_EMAIL || `Megan Houssian Art <welcome@${domain}>`;
  const mg = mailgun.client({
    username: "api",
    key: mailgunApiKey,
  });

  const collectorName = params.firstName.trim() || "Collector";
  const emailSettings = await fetchEmailSettings();
  const links = getEmailLinks(emailSettings.brandTemplate);
  const welcomeSettings = emailSettings.collectorWelcome;
  const templateValues = {
    firstName: collectorName,
  };
  const body = applyTemplate(welcomeSettings.body, templateValues).trim();
  const earlyAccessText = buildEarlyAccessText(params.earlyAccessContexts);
  const earlyAccessHtml = buildEarlyAccessHtml(params.earlyAccessContexts, {
    bodyTextColor: emailSettings.brandTemplate.colors.bodyTextColor,
  });
  const ctaHref = resolveHref(welcomeSettings.ctaHref, links.homeUrl, links.originalsUrl);
  const text = [
    body,
    earlyAccessText ? "\n" + earlyAccessText : "",
    "",
    "Explore:",
    ...links.footerLinks
      .filter((link) => link.href !== links.printsUrl)
      .map((link) => `- ${link.label}: ${link.href}`),
    ...links.socialLinks.map((link) => `- ${link.label}: ${link.href}`),
  ]
    .filter((line, index, all) => {
      if (line) return true;
      return index > 0 && all[index - 1] !== "";
    })
    .join("\n");

  const html = renderBrandEmail({
    preheader: applyTemplate(welcomeSettings.preheader, templateValues),
    title: applyTemplate(welcomeSettings.title, templateValues),
    bodyHtml: `${body ? renderHtmlParagraphs(body, emailSettings.brandTemplate.colors.bodyTextColor) : ''}${earlyAccessHtml}`,
    cta: {
      label: applyTemplate(welcomeSettings.ctaLabel, templateValues),
      href: ctaHref,
    },
    hidePrintsLink: true,
    branding: emailSettings.brandTemplate,
  });

  await mg.messages.create(domain, {
    from,
    to: [params.email],
    "h:Reply-To": process.env.MAILGUN_REPLY_TO_EMAIL?.trim() || emailSettings.supportEmail,
    subject: applyTemplate(welcomeSettings.subject, templateValues),
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
      const earlyAccessContexts = await getCollectorWelcomeEarlyAccessContexts(referrer);
      await sendCollectorWelcomeEmail({ email, firstName, earlyAccessContexts });
    } catch (error) {
      console.error("Failed to send collector welcome email:", error);
    }

    return NextResponse.json({
      success: true,
      message: "You're in. Check your inbox for the Evening Light Collection password.",
    });
  } catch (error) {
    console.error("Kit subscribe error:", error);
    return NextResponse.json({ success: false, error: "Unable to subscribe right now. Please try again shortly." }, { status: 500 });
  }
}
