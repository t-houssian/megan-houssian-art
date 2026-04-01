import { sanityClient } from './sanity';
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
    };
  } catch (error) {
    console.error('Failed to load site settings from Sanity', error);
    return {
      theme: DEFAULT_SITE_THEME,
    };
  }
}
