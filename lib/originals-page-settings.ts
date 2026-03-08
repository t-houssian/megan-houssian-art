import { sanityClient } from './sanity';

type SanityImageWithAlt = {
  asset?: {
    _ref: string;
  };
  alt?: string;
};

export type OriginalsPageSettings = {
  pageTitle: string;
  pageIntro: string;
  availableOriginalsLabel: string;
  availableOriginalsAnnouncement: string;
  availableOriginalsDescription: string;
  availableOriginalsCardDescription: string;
  comingSoonImage?: SanityImageWithAlt;
  comingSoonTextBeforeLink: string;
  comingSoonLinkText: string;
  comingSoonTextAfterLink: string;
  showCollections: boolean;
  collectionsLabel: string;
  collectionsDescription: string;
  showPrints: boolean;
  printsLabel: string;
  printsDescription: string;
  earlyAccessHeading: string;
  homeCollectorSubhead: string;
  earlyAccessSubhead: string;
  earlyAccessButtonLabel: string;
  earlyAccessFinePrint: string;
};

const DEFAULT_ORIGINALS_PAGE_SETTINGS: OriginalsPageSettings = {
  pageTitle: 'Originals',
  pageIntro: 'Explore what is available now, what is coming next, and how to get first access.',
  availableOriginalsLabel: 'Available Originals',
  availableOriginalsAnnouncement: 'Texas Hill Country Landscapes Collection coming soon',
  availableOriginalsDescription:
    'Join the Collector List below to get early access before this collection is released.',
  availableOriginalsCardDescription:
    'Original works are released in curated drops. New pieces will appear here when they become available.',
  comingSoonImage: undefined,
  comingSoonTextBeforeLink: 'A new collection is coming soon! Join my',
  comingSoonLinkText: 'collector list',
  comingSoonTextAfterLink: 'for updates and first access to new originals.',
  showCollections: false,
  collectionsLabel: 'Collections',
  collectionsDescription: 'Curated series and seasonal releases.',
  showPrints: false,
  printsLabel: 'Prints',
  printsDescription: 'Museum-quality prints of select works.',
  earlyAccessHeading: 'Collector Early Access',
  homeCollectorSubhead:
    "Join my Collector List and I'll email you a private early access link 24 hours before new originals go live.",
  earlyAccessSubhead:
    "Join my Collector List and I'll email you a private early access link 24 hours before new originals go live.",
  earlyAccessButtonLabel: 'Get early access',
  earlyAccessFinePrint:
    "By signing up, you'll receive emails about new paintings and releases. Unsubscribe anytime.",
};

type PartialOriginalsPageSettings = Partial<OriginalsPageSettings> | null;

const originalsPageSettingsProjection = `{
  pageTitle,
  pageIntro,
  availableOriginalsLabel,
  availableOriginalsAnnouncement,
  availableOriginalsDescription,
  availableOriginalsCardDescription,
  comingSoonImage{
    asset,
    alt
  },
  comingSoonTextBeforeLink,
  comingSoonLinkText,
  comingSoonTextAfterLink,
  showCollections,
  collectionsLabel,
  collectionsDescription,
  showPrints,
  printsLabel,
  printsDescription,
  earlyAccessHeading,
  homeCollectorSubhead,
  earlyAccessSubhead,
  earlyAccessButtonLabel,
  earlyAccessFinePrint
}`;

const originalsPageSettingsSingletonQuery = `*[
  _type == "originalsPageSettings" &&
  _id in ["originalsPageSettings", "drafts.originalsPageSettings"]
][0]${originalsPageSettingsProjection}`;

const originalsPageSettingsFallbackQuery = `*[_type == "originalsPageSettings"] | order(_updatedAt desc)[0]${originalsPageSettingsProjection}`;

const normalizeString = (value: unknown, fallback: string) =>
  typeof value === 'string' && value.trim().length > 0 ? value.trim() : fallback;

export async function fetchOriginalsPageSettings(): Promise<OriginalsPageSettings> {
  try {
    const singletonSettings = await sanityClient.fetch<PartialOriginalsPageSettings>(
      originalsPageSettingsSingletonQuery,
      {},
      { next: { revalidate: 60 } }
    );

    const settings =
      singletonSettings ??
      (await sanityClient.fetch<PartialOriginalsPageSettings>(
        originalsPageSettingsFallbackQuery,
        {},
        { next: { revalidate: 60 } }
      ));

    return {
      pageTitle: normalizeString(settings?.pageTitle, DEFAULT_ORIGINALS_PAGE_SETTINGS.pageTitle),
      pageIntro: normalizeString(settings?.pageIntro, DEFAULT_ORIGINALS_PAGE_SETTINGS.pageIntro),
      availableOriginalsLabel: normalizeString(
        settings?.availableOriginalsLabel,
        DEFAULT_ORIGINALS_PAGE_SETTINGS.availableOriginalsLabel
      ),
      availableOriginalsAnnouncement: normalizeString(
        settings?.availableOriginalsAnnouncement,
        DEFAULT_ORIGINALS_PAGE_SETTINGS.availableOriginalsAnnouncement
      ),
      availableOriginalsDescription: normalizeString(
        settings?.availableOriginalsDescription,
        DEFAULT_ORIGINALS_PAGE_SETTINGS.availableOriginalsDescription
      ),
      availableOriginalsCardDescription: normalizeString(
        settings?.availableOriginalsCardDescription,
        DEFAULT_ORIGINALS_PAGE_SETTINGS.availableOriginalsCardDescription
      ),
      comingSoonImage: settings?.comingSoonImage,
      comingSoonTextBeforeLink: normalizeString(
        settings?.comingSoonTextBeforeLink,
        DEFAULT_ORIGINALS_PAGE_SETTINGS.comingSoonTextBeforeLink
      ),
      comingSoonLinkText: normalizeString(
        settings?.comingSoonLinkText,
        DEFAULT_ORIGINALS_PAGE_SETTINGS.comingSoonLinkText
      ),
      comingSoonTextAfterLink: normalizeString(
        settings?.comingSoonTextAfterLink,
        DEFAULT_ORIGINALS_PAGE_SETTINGS.comingSoonTextAfterLink
      ),
      showCollections:
        typeof settings?.showCollections === 'boolean'
          ? settings.showCollections
          : DEFAULT_ORIGINALS_PAGE_SETTINGS.showCollections,
      collectionsLabel: normalizeString(
        settings?.collectionsLabel,
        DEFAULT_ORIGINALS_PAGE_SETTINGS.collectionsLabel
      ),
      collectionsDescription: normalizeString(
        settings?.collectionsDescription,
        DEFAULT_ORIGINALS_PAGE_SETTINGS.collectionsDescription
      ),
      showPrints:
        typeof settings?.showPrints === 'boolean'
          ? settings.showPrints
          : DEFAULT_ORIGINALS_PAGE_SETTINGS.showPrints,
      printsLabel: normalizeString(settings?.printsLabel, DEFAULT_ORIGINALS_PAGE_SETTINGS.printsLabel),
      printsDescription: normalizeString(
        settings?.printsDescription,
        DEFAULT_ORIGINALS_PAGE_SETTINGS.printsDescription
      ),
      earlyAccessHeading: normalizeString(
        settings?.earlyAccessHeading,
        DEFAULT_ORIGINALS_PAGE_SETTINGS.earlyAccessHeading
      ),
      homeCollectorSubhead: normalizeString(
        settings?.homeCollectorSubhead,
        DEFAULT_ORIGINALS_PAGE_SETTINGS.homeCollectorSubhead
      ),
      earlyAccessSubhead: normalizeString(
        settings?.earlyAccessSubhead,
        DEFAULT_ORIGINALS_PAGE_SETTINGS.earlyAccessSubhead
      ),
      earlyAccessButtonLabel: normalizeString(
        settings?.earlyAccessButtonLabel,
        DEFAULT_ORIGINALS_PAGE_SETTINGS.earlyAccessButtonLabel
      ),
      earlyAccessFinePrint: normalizeString(
        settings?.earlyAccessFinePrint,
        DEFAULT_ORIGINALS_PAGE_SETTINGS.earlyAccessFinePrint
      ),
    };
  } catch (error) {
    console.error('Failed to load originals page settings from Sanity', error);
    return DEFAULT_ORIGINALS_PAGE_SETTINGS;
  }
}
