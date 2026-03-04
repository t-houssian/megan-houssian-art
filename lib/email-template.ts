type EmailCta = {
  label: string;
  href: string;
};

type RenderBrandEmailInput = {
  preheader: string;
  title: string;
  greeting?: string;
  intro?: string;
  bodyHtml: string;
  cta?: EmailCta;
  outro?: string;
};

type DetailRow = {
  label: string;
  value: string;
};

type EmailLinks = {
  homeUrl: string;
  originalsUrl: string;
  printsUrl: string;
  collectorUrl: string;
  contactUrl: string;
  pinterestUrl?: string;
  facebookUrl?: string;
  instagramUrl?: string;
};

const DEFAULT_SITE_URL = 'https://meganhoussianart.com';
const DEFAULT_PINTEREST_URL = 'https://pin.it/1Scq2kp48';
const DEFAULT_FACEBOOK_URL = 'https://www.facebook.com/marketplace/profile/61550348800548/?ref=permalink&mibextid=6ojiHh';

const normalizeBaseUrl = (raw?: string | null) => {
  const candidate = raw?.trim() || DEFAULT_SITE_URL;
  try {
    return new URL(candidate).toString().replace(/\/$/, '');
  } catch {
    return DEFAULT_SITE_URL;
  }
};

const makeUrl = (baseUrl: string, path: string) => {
  try {
    return new URL(path, baseUrl).toString();
  } catch {
    return baseUrl;
  }
};

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

export const getEmailLinks = (): EmailLinks => {
  const baseUrl = normalizeBaseUrl(process.env.NEXT_PUBLIC_BASE_URL);
  const pinterestUrl = process.env.EMAIL_SOCIAL_PINTEREST_URL?.trim() || DEFAULT_PINTEREST_URL;
  const facebookUrl = process.env.EMAIL_SOCIAL_FACEBOOK_URL?.trim() || DEFAULT_FACEBOOK_URL;
  const instagramUrl = process.env.EMAIL_SOCIAL_INSTAGRAM_URL?.trim() || undefined;

  return {
    homeUrl: baseUrl,
    originalsUrl: makeUrl(baseUrl, '/originals'),
    printsUrl: makeUrl(baseUrl, '/prints'),
    collectorUrl: makeUrl(baseUrl, '/#collector-early-access'),
    contactUrl: makeUrl(baseUrl, '/contact'),
    pinterestUrl,
    facebookUrl,
    instagramUrl,
  };
};

const renderInstagramIcon = () =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none" role="img" aria-label="Instagram">
  <rect x="1.5" y="1.5" width="13" height="13" rx="4" stroke="currentColor" stroke-width="1.5"/>
  <circle cx="8" cy="8" r="3" stroke="currentColor" stroke-width="1.5"/>
  <circle cx="11.5" cy="4.5" r="1" fill="currentColor"/>
</svg>`;

const renderPinterestIcon = () =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" role="img" aria-label="Pinterest">
  <path d="M12.04 2C6.58 2 2 6.58 2 12.04c0 4.2 2.58 7.86 6.27 9.36-.09-.8-.17-2.03.03-2.9.18-.8 1.17-5.08 1.17-5.08s-.3-.6-.3-1.5c0-1.4.81-2.45 1.82-2.45.86 0 1.27.65 1.27 1.42 0 .87-.55 2.18-.83 3.4-.24 1.02.51 1.85 1.52 1.85 1.82 0 3.22-1.92 3.22-4.68 0-2.45-1.76-4.16-4.27-4.16-2.91 0-4.62 2.18-4.62 4.43 0 .87.34 1.8.75 2.3.08.1.09.2.07.31-.07.34-.23 1.09-.26 1.24-.04.2-.14.24-.33.14-1.23-.57-2-2.36-2-3.8 0-3.1 2.25-5.95 6.5-5.95 3.41 0 6.06 2.43 6.06 5.68 0 3.39-2.14 6.12-5.12 6.12-1 0-1.94-.52-2.26-1.13l-.62 2.36c-.22.86-.82 1.93-1.22 2.58.92.28 1.9.43 2.93.43 5.46 0 10.04-4.58 10.04-10.04C22.08 6.58 17.5 2 12.04 2z"/>
</svg>`;

const renderFacebookIcon = () =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" role="img" aria-label="Facebook">
  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
</svg>`;

const renderSocialLinks = (links: EmailLinks) => {
  const socialItems = [
    links.instagramUrl
      ? {
          label: 'Instagram',
          url: links.instagramUrl,
          icon: renderInstagramIcon(),
        }
      : null,
    links.pinterestUrl
      ? {
          label: 'Pinterest',
          url: links.pinterestUrl,
          icon: renderPinterestIcon(),
        }
      : null,
    links.facebookUrl
      ? {
          label: 'Facebook',
          url: links.facebookUrl,
          icon: renderFacebookIcon(),
        }
      : null,
  ].filter((item): item is { label: string; url: string; icon: string } => Boolean(item));

  if (socialItems.length === 0) return '';

  const items = socialItems
    .map(
      (item) => `<a href="${escapeHtml(item.url)}" style="color:#6b4f3a;text-decoration:none;display:inline-block;">
  <span style="display:inline-block;vertical-align:middle;line-height:1;margin-right:4px;color:#8b4513;">${item.icon}</span>
  <span style="display:inline-block;vertical-align:middle;">${escapeHtml(item.label)}</span>
</a>`
    )
    .join('&nbsp;|&nbsp;');

  return `<p style="margin:0;font-size:13px;line-height:1.5;color:#8b7765;">${items}</p>`;
};

export const renderDetailTable = (rows: DetailRow[]) => {
  const validRows = rows.filter((row) => row.value.trim().length > 0);
  if (validRows.length === 0) return '';

  const tableRows = validRows
    .map(
      (row) => `
<tr>
  <td style="padding:10px 12px;border-bottom:1px solid #eadfce;font-weight:600;color:#5f4735;width:170px;">${escapeHtml(row.label)}</td>
  <td style="padding:10px 12px;border-bottom:1px solid #eadfce;color:#4a3a2d;">${escapeHtml(row.value)}</td>
</tr>`
    )
    .join('');

  return `
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;background:#fffdf8;border:1px solid #eadfce;border-radius:12px;overflow:hidden;">
  ${tableRows}
</table>`;
};

export const renderBrandEmail = (input: RenderBrandEmailInput) => {
  const links = getEmailLinks();
  const greetingBlock = input.greeting
    ? `<p style="margin:0 0 12px;font-size:16px;line-height:1.6;color:#4a3a2d;">${escapeHtml(input.greeting)}</p>`
    : '';
  const introBlock = input.intro
    ? `<p style="margin:0 0 18px;font-size:16px;line-height:1.6;color:#4a3a2d;">${escapeHtml(input.intro)}</p>`
    : '';
  const ctaBlock = input.cta
    ? `<table role="presentation" cellspacing="0" cellpadding="0" style="margin:22px 0 0;"><tr><td style="border-radius:999px;background:#6b4f3a;">
<a href="${escapeHtml(input.cta.href)}" style="display:inline-block;padding:12px 22px;font-size:15px;font-weight:600;color:#fffaf2;text-decoration:none;border-radius:999px;">${escapeHtml(input.cta.label)}</a>
</td></tr></table>`
    : '';
  const outroBlock = input.outro
    ? `<p style="margin:20px 0 0;font-size:15px;line-height:1.6;color:#4a3a2d;">${escapeHtml(input.outro)}</p>`
    : '';

  return `<!doctype html>
<html>
  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escapeHtml(input.title)}</title>
  </head>
  <body style="margin:0;padding:0;background:#f7f2ea;font-family:Georgia,'Times New Roman',serif;color:#4a3a2d;">
    <span style="display:none!important;visibility:hidden;opacity:0;color:transparent;height:0;width:0;overflow:hidden;">${escapeHtml(
      input.preheader
    )}</span>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f7f2ea;padding:24px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:640px;border-collapse:collapse;">
            <tr>
              <td style="background:#fffdf8;border:1px solid #eadfce;border-radius:16px;overflow:hidden;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">
                  <tr>
                    <td style="padding:26px 30px;background:linear-gradient(135deg,#f4ebde 0%,#fbf7ef 100%);border-bottom:1px solid #eadfce;">
                      <p style="margin:0;font-size:13px;letter-spacing:.08em;text-transform:uppercase;color:#8b7765;">Megan Houssian Art</p>
                      <h1 style="margin:8px 0 0;font-size:30px;line-height:1.2;color:#3f3126;font-weight:500;">${escapeHtml(input.title)}</h1>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:28px 30px 18px;">
                      ${greetingBlock}
                      ${introBlock}
                      <div style="font-size:15px;line-height:1.7;color:#4a3a2d;">${input.bodyHtml}</div>
                      ${ctaBlock}
                      ${outroBlock}
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:18px 30px 26px;border-top:1px solid #eadfce;background:#faf5ec;">
                      <p style="margin:0 0 10px;font-size:13px;line-height:1.5;color:#8b7765;">
                        <a href="${escapeHtml(links.homeUrl)}" style="color:#6b4f3a;text-decoration:none;">Website</a>
                        &nbsp;|&nbsp;
                        <a href="${escapeHtml(links.originalsUrl)}" style="color:#6b4f3a;text-decoration:none;">Originals</a>
                        &nbsp;|&nbsp;
                        <a href="${escapeHtml(links.printsUrl)}" style="color:#6b4f3a;text-decoration:none;">Print Shop</a>
                        &nbsp;|&nbsp;
                        <a href="${escapeHtml(links.contactUrl)}" style="color:#6b4f3a;text-decoration:none;">Contact</a>
                      </p>
                      ${renderSocialLinks(links)}
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
};
