import { sanityClient } from './sanity';
import {
  DEFAULT_FOOTER_CONTENT,
  DEFAULT_HOMEPAGE_CONTENT,
  type FooterContent,
  type HomepageContent
} from '../sanity/lib/siteContent';
import { DEFAULT_SITE_THEME, HEX_COLOR_PATTERN, type SiteTheme } from '../sanity/lib/siteTheme';

export type SiteSettings = {
  favicon?: {
    asset?: {
      _ref?: string;
      _type?: string;
    };
    alt?: string;
  };
  theme: SiteTheme;
  homepageContent: HomepageContent;
  footerContent: FooterContent;
};

const siteSettingsProjection = `{
  favicon{
    alt,
    asset
  },
  theme{
    mainBackgroundColor,
    secondaryBackgroundColor,
    navBackgroundColor,
    textColor,
    buttonColor,
    buttonHoverColor,
    linkColor,
    mutedTextColor,
    accentColor,
    borderColor,
    heroOverlayColor,
    surfaceAccentColor
  },
  homepageContent{
    aboutHeading,
    aboutLocation,
    aboutDescription,
    aboutButtonLabel,
    commissionsHeading,
    commissionsDescription,
    commissionsButtonLabel,
    contactHeading,
    contactIntroText,
    contactEmail,
    contactButtonLabel
  },
  footerContent{
    brandTitle,
    brandDescription,
    exploreHeading,
    galleryLabel,
    originalsLabel,
    commissionsLabel,
    aboutLabel,
    connectHeading,
    instagramLabel,
    pinterestLabel,
    facebookLabel,
    contactLabel,
    copyrightName,
    location
  }
}`;

const siteSettingsSingletonQuery = `*[
  _type == "siteSettings" &&
  _id in ["siteSettings", "drafts.siteSettings"]
][0]${siteSettingsProjection}`;

const siteSettingsFallbackQuery = `*[_type == "siteSettings"] | order(_updatedAt desc)[0]${siteSettingsProjection}`;

const siteSettingsClient = sanityClient.withConfig({ useCdn: false });
const siteSettingsFetchOptions = { next: { revalidate: 60 } };

function normalizeHexColor(value: unknown, fallback: string): string {
  const normalized = typeof value === 'string' ? value.trim() : '';
  return HEX_COLOR_PATTERN.test(normalized) ? normalized.toUpperCase() : fallback;
}

function normalizeSiteTheme(value: Partial<SiteTheme> | null | undefined): SiteTheme {
  const theme = value || {};

  return {
    mainBackgroundColor: normalizeHexColor(theme.mainBackgroundColor, DEFAULT_SITE_THEME.mainBackgroundColor),
    secondaryBackgroundColor: normalizeHexColor(theme.secondaryBackgroundColor, DEFAULT_SITE_THEME.secondaryBackgroundColor),
    navBackgroundColor: normalizeHexColor(theme.navBackgroundColor, DEFAULT_SITE_THEME.navBackgroundColor),
    textColor: normalizeHexColor(theme.textColor, DEFAULT_SITE_THEME.textColor),
    buttonColor: normalizeHexColor(theme.buttonColor, DEFAULT_SITE_THEME.buttonColor),
    buttonHoverColor: normalizeHexColor(theme.buttonHoverColor, DEFAULT_SITE_THEME.buttonHoverColor),
    linkColor: normalizeHexColor(theme.linkColor, DEFAULT_SITE_THEME.linkColor),
    mutedTextColor: normalizeHexColor(theme.mutedTextColor, DEFAULT_SITE_THEME.mutedTextColor),
    accentColor: normalizeHexColor(theme.accentColor, DEFAULT_SITE_THEME.accentColor),
    borderColor: normalizeHexColor(theme.borderColor, DEFAULT_SITE_THEME.borderColor),
    heroOverlayColor: normalizeHexColor(theme.heroOverlayColor, DEFAULT_SITE_THEME.heroOverlayColor),
    surfaceAccentColor: normalizeHexColor(theme.surfaceAccentColor, DEFAULT_SITE_THEME.surfaceAccentColor),
  };
}

function normalizeNonEmptyString(value: unknown, fallback: string): string {
  const normalized = typeof value === 'string' ? value.trim() : '';
  return normalized.length > 0 ? normalized : fallback;
}

function normalizeHomepageContent(value: Partial<HomepageContent> | null | undefined): HomepageContent {
  const content = value || {};

  return {
    aboutHeading: normalizeNonEmptyString(content.aboutHeading, DEFAULT_HOMEPAGE_CONTENT.aboutHeading),
    aboutLocation: normalizeNonEmptyString(content.aboutLocation, DEFAULT_HOMEPAGE_CONTENT.aboutLocation),
    aboutDescription: normalizeNonEmptyString(content.aboutDescription, DEFAULT_HOMEPAGE_CONTENT.aboutDescription),
    aboutButtonLabel: normalizeNonEmptyString(content.aboutButtonLabel, DEFAULT_HOMEPAGE_CONTENT.aboutButtonLabel),
    commissionsHeading: normalizeNonEmptyString(content.commissionsHeading, DEFAULT_HOMEPAGE_CONTENT.commissionsHeading),
    commissionsDescription: normalizeNonEmptyString(
      content.commissionsDescription,
      DEFAULT_HOMEPAGE_CONTENT.commissionsDescription
    ),
    commissionsButtonLabel: normalizeNonEmptyString(
      content.commissionsButtonLabel,
      DEFAULT_HOMEPAGE_CONTENT.commissionsButtonLabel
    ),
    contactHeading: normalizeNonEmptyString(content.contactHeading, DEFAULT_HOMEPAGE_CONTENT.contactHeading),
    contactIntroText: normalizeNonEmptyString(content.contactIntroText, DEFAULT_HOMEPAGE_CONTENT.contactIntroText),
    contactEmail: normalizeNonEmptyString(content.contactEmail, DEFAULT_HOMEPAGE_CONTENT.contactEmail),
    contactButtonLabel: normalizeNonEmptyString(content.contactButtonLabel, DEFAULT_HOMEPAGE_CONTENT.contactButtonLabel),
  };
}

function normalizeFooterContent(value: Partial<FooterContent> | null | undefined): FooterContent {
  const content = value || {};

  return {
    brandTitle: normalizeNonEmptyString(content.brandTitle, DEFAULT_FOOTER_CONTENT.brandTitle),
    brandDescription: normalizeNonEmptyString(content.brandDescription, DEFAULT_FOOTER_CONTENT.brandDescription),
    exploreHeading: normalizeNonEmptyString(content.exploreHeading, DEFAULT_FOOTER_CONTENT.exploreHeading),
    galleryLabel: normalizeNonEmptyString(content.galleryLabel, DEFAULT_FOOTER_CONTENT.galleryLabel),
    originalsLabel: normalizeNonEmptyString(content.originalsLabel, DEFAULT_FOOTER_CONTENT.originalsLabel),
    commissionsLabel: normalizeNonEmptyString(content.commissionsLabel, DEFAULT_FOOTER_CONTENT.commissionsLabel),
    aboutLabel: normalizeNonEmptyString(content.aboutLabel, DEFAULT_FOOTER_CONTENT.aboutLabel),
    connectHeading: normalizeNonEmptyString(content.connectHeading, DEFAULT_FOOTER_CONTENT.connectHeading),
    instagramLabel: normalizeNonEmptyString(content.instagramLabel, DEFAULT_FOOTER_CONTENT.instagramLabel),
    pinterestLabel: normalizeNonEmptyString(content.pinterestLabel, DEFAULT_FOOTER_CONTENT.pinterestLabel),
    facebookLabel: normalizeNonEmptyString(content.facebookLabel, DEFAULT_FOOTER_CONTENT.facebookLabel),
    contactLabel: normalizeNonEmptyString(content.contactLabel, DEFAULT_FOOTER_CONTENT.contactLabel),
    copyrightName: normalizeNonEmptyString(content.copyrightName, DEFAULT_FOOTER_CONTENT.copyrightName),
    location: normalizeNonEmptyString(content.location, DEFAULT_FOOTER_CONTENT.location),
  };
}

export async function fetchSiteSettings(): Promise<SiteSettings> {
  try {
    const singletonSettings = await siteSettingsClient.fetch<SiteSettings | null>(
      siteSettingsSingletonQuery,
      {},
      siteSettingsFetchOptions
    );

    if (singletonSettings) {
      return {
        ...singletonSettings,
        theme: normalizeSiteTheme(singletonSettings.theme),
        homepageContent: normalizeHomepageContent(singletonSettings.homepageContent),
        footerContent: normalizeFooterContent(singletonSettings.footerContent),
      };
    }

    const fallbackSettings =
      (await siteSettingsClient.fetch<SiteSettings | null>(
        siteSettingsFallbackQuery,
        {},
        siteSettingsFetchOptions
      )) || null;

    return {
      ...(fallbackSettings || {}),
      theme: normalizeSiteTheme(fallbackSettings?.theme),
      homepageContent: normalizeHomepageContent(fallbackSettings?.homepageContent),
      footerContent: normalizeFooterContent(fallbackSettings?.footerContent),
    };
  } catch (error) {
    console.error('Failed to load site settings from Sanity', error);
    return {
      theme: DEFAULT_SITE_THEME,
      homepageContent: DEFAULT_HOMEPAGE_CONTENT,
      footerContent: DEFAULT_FOOTER_CONTENT,
    };
  }
}
