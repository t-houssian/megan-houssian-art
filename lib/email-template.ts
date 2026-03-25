export type EmailLinkItem = {
  label: string;
  href: string;
};

export type EmailSocialPlatform = 'instagram' | 'pinterest' | 'facebook';

export type EmailSocialLink = {
  platform: EmailSocialPlatform;
  label: string;
  href: string;
};

export type EmailBrandingColors = {
  pageBackground: string;
  cardBackground: string;
  borderColor: string;
  headerGradientFrom: string;
  headerGradientTo: string;
  footerBackground: string;
  titleColor: string;
  bodyTextColor: string;
  mutedTextColor: string;
  linkColor: string;
  buttonBackground: string;
  buttonTextColor: string;
  detailTableBackground: string;
  detailTableLabelColor: string;
};

export type EmailBranding = {
  brandName: string;
  imageUrl?: string;
  imageAlt: string;
  imageLinkHref: string;
  footerLinks: EmailLinkItem[];
  socialLinks: EmailSocialLink[];
  colors: EmailBrandingColors;
};

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
  hidePrintsLink?: boolean;
  branding?: EmailBranding;
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
  footerLinks: EmailLinkItem[];
  socialLinks: EmailSocialLink[];
};

const DEFAULT_SITE_URL = 'https://meganhoussianart.com';
const DEFAULT_PINTEREST_URL = 'https://pin.it/1Scq2kp48';
const DEFAULT_FACEBOOK_URL =
  'https://www.facebook.com/marketplace/profile/61550348800548/?ref=permalink&mibextid=6ojiHh';
const DEFAULT_BRAND_NAME = 'Megan Houssian Art';
const DEFAULT_FALLBACK_IMAGE_PATH = '/images/image.png';

export const DEFAULT_EMAIL_COLORS: EmailBrandingColors = {
  pageBackground: '#f7f2ea',
  cardBackground: '#fffdf8',
  borderColor: '#eadfce',
  headerGradientFrom: '#f4ebde',
  headerGradientTo: '#fbf7ef',
  footerBackground: '#faf5ec',
  titleColor: '#3f3126',
  bodyTextColor: '#4a3a2d',
  mutedTextColor: '#8b7765',
  linkColor: '#6b4f3a',
  buttonBackground: '#fffdf8',
  buttonTextColor: '#6b4f3a',
  detailTableBackground: '#fffdf8',
  detailTableLabelColor: '#5f4735',
};

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

const resolveHref = (baseUrl: string, href: string, fallback: string) => {
  try {
    return new URL(href, baseUrl).toString();
  } catch {
    return fallback;
  }
};

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const getDefaultFooterLinks = (baseUrl: string): EmailLinkItem[] => [
  { label: 'Website', href: makeUrl(baseUrl, '/') },
  { label: 'Originals', href: makeUrl(baseUrl, '/originals') },
  { label: 'Print Shop', href: makeUrl(baseUrl, '/prints') },
  { label: 'Contact', href: makeUrl(baseUrl, '/contact') },
];

const getDefaultSocialLinks = (): EmailSocialLink[] => {
  const pinterestUrl = process.env.EMAIL_SOCIAL_PINTEREST_URL?.trim() || DEFAULT_PINTEREST_URL;
  const facebookUrl = process.env.EMAIL_SOCIAL_FACEBOOK_URL?.trim() || DEFAULT_FACEBOOK_URL;
  const instagramUrl = process.env.EMAIL_SOCIAL_INSTAGRAM_URL?.trim() || undefined;

  return [
    instagramUrl
      ? {
          platform: 'instagram',
          label: 'Instagram',
          href: instagramUrl,
        }
      : null,
    pinterestUrl
      ? {
          platform: 'pinterest',
          label: 'Pinterest',
          href: pinterestUrl,
        }
      : null,
    facebookUrl
      ? {
          platform: 'facebook',
          label: 'Facebook',
          href: facebookUrl,
        }
      : null,
  ].filter((item): item is EmailSocialLink => Boolean(item));
};

const normalizeFooterLinks = (baseUrl: string, links?: EmailLinkItem[]) => {
  const defaults = getDefaultFooterLinks(baseUrl);
  if (!Array.isArray(links) || links.length === 0) {
    return defaults;
  }

  const normalized = links
    .map((link) => ({
      label: link.label.trim(),
      href: resolveHref(baseUrl, link.href, defaults[0]?.href || baseUrl),
    }))
    .filter((link) => link.label.length > 0 && link.href.length > 0);

  return normalized.length > 0 ? normalized : defaults;
};

const normalizeSocialLinks = (baseUrl: string, links?: EmailSocialLink[]) => {
  const defaults = getDefaultSocialLinks();
  if (!Array.isArray(links) || links.length === 0) {
    return defaults;
  }

  const normalized = links
    .map((link) => ({
      platform: link.platform,
      label: link.label.trim(),
      href: resolveHref(baseUrl, link.href, defaults[0]?.href || baseUrl),
    }))
    .filter((link) => link.label.length > 0 && link.href.length > 0);

  return normalized.length > 0 ? normalized : defaults;
};

export const getEmailLinks = (branding?: Pick<EmailBranding, 'footerLinks' | 'socialLinks'>): EmailLinks => {
  const baseUrl = normalizeBaseUrl(process.env.NEXT_PUBLIC_BASE_URL);

  return {
    homeUrl: baseUrl,
    originalsUrl: makeUrl(baseUrl, '/originals'),
    printsUrl: makeUrl(baseUrl, '/prints'),
    collectorUrl: makeUrl(baseUrl, '/#collector-early-access'),
    contactUrl: makeUrl(baseUrl, '/contact'),
    footerLinks: normalizeFooterLinks(baseUrl, branding?.footerLinks),
    socialLinks: normalizeSocialLinks(baseUrl, branding?.socialLinks),
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

const renderSocialIcon = (platform: EmailSocialPlatform) => {
  if (platform === 'instagram') return renderInstagramIcon();
  if (platform === 'facebook') return renderFacebookIcon();
  return renderPinterestIcon();
};

const renderSocialLinks = (links: EmailSocialLink[], colors: EmailBrandingColors) => {
  if (links.length === 0) return '';

  const items = links
    .map(
      (item) => `<a href="${escapeHtml(item.href)}" style="color:${colors.linkColor};text-decoration:none;display:inline-block;">
  <span style="display:inline-block;vertical-align:middle;line-height:1;margin-right:4px;color:${colors.linkColor};">${renderSocialIcon(
    item.platform
  )}</span>
  <span style="display:inline-block;vertical-align:middle;">${escapeHtml(item.label)}</span>
</a>`
    )
    .join('&nbsp;|&nbsp;');

  return `<p style="margin:0;font-size:13px;line-height:1.5;color:${colors.mutedTextColor};text-align:center;">${items}</p>`;
};

export const renderDetailTable = (rows: DetailRow[], colors: EmailBrandingColors = DEFAULT_EMAIL_COLORS) => {
  const validRows = rows.filter((row) => row.value.trim().length > 0);
  if (validRows.length === 0) return '';

  const tableRows = validRows
    .map(
      (row) => `
<tr>
  <td style="padding:10px 12px;border-bottom:1px solid ${colors.borderColor};font-weight:600;color:${colors.detailTableLabelColor};width:170px;">${escapeHtml(
        row.label
      )}</td>
  <td style="padding:10px 12px;border-bottom:1px solid ${colors.borderColor};color:${colors.bodyTextColor};">${escapeHtml(
        row.value
      )}</td>
</tr>`
    )
    .join('');

  return `
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;background:${colors.detailTableBackground};border:1px solid ${colors.borderColor};border-radius:12px;overflow:hidden;">
  ${tableRows}
</table>`;
};

export const renderBrandEmail = (input: RenderBrandEmailInput) => {
  const colors = {
    ...DEFAULT_EMAIL_COLORS,
    ...input.branding?.colors,
  };
  const links = getEmailLinks(input.branding);
  const brandName = input.branding?.brandName?.trim() || DEFAULT_BRAND_NAME;
  const greetingBlock = input.greeting
    ? `<p style="margin:0 0 12px;font-size:16px;line-height:1.6;color:${colors.bodyTextColor};">${escapeHtml(
        input.greeting
      )}</p>`
    : '';
  const introBlock = input.intro
    ? `<p style="margin:0 0 18px;font-size:16px;line-height:1.6;color:${colors.bodyTextColor};">${escapeHtml(
        input.intro
      )}</p>`
    : '';
  const ctaBlock = input.cta
    ? `<table role="presentation" cellspacing="0" cellpadding="0" style="margin:26px auto 0;"><tr><td style="border-radius:999px;background:${colors.buttonBackground};border:2px solid ${colors.titleColor};">
<a href="${escapeHtml(input.cta.href)}" style="display:inline-block;padding:13px 28px;font-size:15px;font-weight:600;letter-spacing:.01em;color:${colors.buttonTextColor};text-decoration:none;border-radius:999px;">${escapeHtml(
        input.cta.label
      )}</a>
</td></tr></table>`
    : '';
  const outroBlock = input.outro
    ? `<p style="margin:20px 0 0;font-size:15px;line-height:1.6;color:${colors.bodyTextColor};">${escapeHtml(
        input.outro
      )}</p>`
    : '';
  const imageSrc = input.branding?.imageUrl?.trim() || makeUrl(links.homeUrl, DEFAULT_FALLBACK_IMAGE_PATH);
  const imageAlt = input.branding?.imageAlt?.trim() || `${brandName} featured artwork`;
  const imageHref = resolveHref(links.homeUrl, input.branding?.imageLinkHref || '/', links.homeUrl);
  const footerLinks = input.hidePrintsLink
    ? links.footerLinks.filter((link) => link.href !== links.printsUrl)
    : links.footerLinks;
  const footerLinksHtml = footerLinks
    .map(
      (link) =>
        `<a href="${escapeHtml(link.href)}" style="color:${colors.linkColor};text-decoration:none;">${escapeHtml(link.label)}</a>`
    )
    .join('&nbsp;|&nbsp;');
  const imageBlock = imageSrc
    ? `<tr>
                    <td style="padding:0;background:${colors.cardBackground};">
                      <a href="${escapeHtml(imageHref)}" style="display:block;text-decoration:none;">
                        <img src="${escapeHtml(imageSrc)}" alt="${escapeHtml(
        imageAlt
      )}" width="640" style="display:block;width:100%;max-width:640px;height:auto;border:0;" />
                      </a>
                    </td>
                  </tr>`
    : '';

  return `<!doctype html>
<html>
  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escapeHtml(input.title)}</title>
  </head>
  <body style="margin:0;padding:0;background:${colors.pageBackground};font-family:Georgia,'Times New Roman',serif;color:${colors.bodyTextColor};">
    <span style="display:none!important;visibility:hidden;opacity:0;color:transparent;height:0;width:0;overflow:hidden;">${escapeHtml(
      input.preheader
    )}</span>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:${colors.pageBackground};padding:24px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:640px;border-collapse:collapse;">
            <tr>
              <td style="background:${colors.cardBackground};border:1px solid ${colors.borderColor};border-radius:22px;overflow:hidden;box-shadow:0 24px 60px -44px rgba(39,31,24,.55);">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">
                  <tr>
                    <td style="padding:24px 30px 22px;background:linear-gradient(180deg,${colors.headerGradientFrom} 0%,${colors.headerGradientTo} 100%);border-bottom:1px solid ${colors.borderColor};text-align:center;">
                      <p style="margin:0;font-size:12px;letter-spacing:.18em;text-transform:uppercase;color:${colors.mutedTextColor};">${escapeHtml(
                        brandName
                      )}</p>
                      <h1 style="margin:10px 0 0;font-size:30px;line-height:1.2;color:${colors.titleColor};font-weight:500;">${escapeHtml(
                        input.title
                      )}</h1>
                    </td>
                  </tr>
                  ${imageBlock}
                  <tr>
                    <td style="padding:34px 34px 24px;text-align:center;">
                      ${greetingBlock}
                      ${introBlock}
                      <div style="font-size:15px;line-height:1.8;color:${colors.bodyTextColor};text-align:left;">${input.bodyHtml}</div>
                      ${ctaBlock}
                      ${outroBlock}
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:20px 30px 28px;border-top:1px solid ${colors.borderColor};background:${colors.footerBackground};text-align:center;">
                      <p style="margin:0 0 10px;font-size:13px;line-height:1.6;color:${colors.mutedTextColor};text-align:center;">
                        ${footerLinksHtml}
                      </p>
                      ${renderSocialLinks(links.socialLinks, colors)}
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
