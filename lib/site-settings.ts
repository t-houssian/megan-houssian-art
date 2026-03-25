import { sanityClient } from './sanity';

export type SiteSettings = {
  favicon?: {
    asset?: {
      _ref?: string;
      _type?: string;
    };
    alt?: string;
  };
};

const siteSettingsProjection = `{
  favicon{
    alt,
    asset
  }
}`;

const siteSettingsSingletonQuery = `*[
  _type == "siteSettings" &&
  _id in ["siteSettings", "drafts.siteSettings"]
][0]${siteSettingsProjection}`;

const siteSettingsFallbackQuery = `*[_type == "siteSettings"] | order(_updatedAt desc)[0]${siteSettingsProjection}`;

const siteSettingsClient = sanityClient.withConfig({ useCdn: false });

export async function fetchSiteSettings(): Promise<SiteSettings> {
  try {
    const singletonSettings = await siteSettingsClient.fetch<SiteSettings | null>(
      siteSettingsSingletonQuery,
      {},
      { cache: 'no-store', next: { revalidate: 0 } }
    );

    if (singletonSettings) {
      return singletonSettings;
    }

    return (
      (await siteSettingsClient.fetch<SiteSettings | null>(
        siteSettingsFallbackQuery,
        {},
        { cache: 'no-store', next: { revalidate: 0 } }
      )) || {}
    );
  } catch (error) {
    console.error('Failed to load site settings from Sanity', error);
    return {};
  }
}
