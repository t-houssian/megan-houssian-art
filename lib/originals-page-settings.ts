import { sanityClient } from './sanity';
import {
  createLinkedParagraphBlock,
  normalizeBlocks,
  normalizeNonEmptyString,
  type SanityRichTextBlock,
} from './sanity-rich-text';

type SanityImageWithAlt = {
  asset?: {
    _ref: string;
  };
  alt?: string;
};

type LegacyOriginalsPageSettingsFields = {
  comingSoonTextBeforeLink?: unknown;
  comingSoonLinkText?: unknown;
  comingSoonTextAfterLink?: unknown;
};

export type OriginalsPageSettings = {
  pageTitle: string;
  pageIntro: string;
  availableOriginalsLabel: string;
  availableOriginalsAnnouncement: string;
  availableOriginalsDescription: string;
  availableOriginalsCardDescription: string;
  comingSoonImage?: SanityImageWithAlt;
  comingSoonContent: SanityRichTextBlock[];
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
  comingSoonContent: [
    createLinkedParagraphBlock({
      beforeLink: 'A new collection is coming soon! Join my ',
      linkText: 'collector list',
      linkHref: '/#collector-early-access',
      afterLink: ' for updates and first access to new originals.',
    }),
  ],
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

type PartialOriginalsPageSettings =
  | (Partial<OriginalsPageSettings> & LegacyOriginalsPageSettingsFields)
  | null;

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
  comingSoonContent,
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

const buildLegacyComingSoonContent = (
  settings: LegacyOriginalsPageSettingsFields | null
): SanityRichTextBlock[] => {
  const beforeLink = normalizeNonEmptyString(settings?.comingSoonTextBeforeLink, 'A new collection is coming soon! Join my ');
  const linkText = normalizeNonEmptyString(settings?.comingSoonLinkText, 'collector list');
  const afterLink = normalizeNonEmptyString(
    settings?.comingSoonTextAfterLink,
    ' for updates and first access to new originals.'
  );

  return [
    createLinkedParagraphBlock({
      beforeLink,
      linkText,
      linkHref: '/#collector-early-access',
      afterLink,
    }),
  ];
};

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
      pageTitle: normalizeNonEmptyString(settings?.pageTitle, DEFAULT_ORIGINALS_PAGE_SETTINGS.pageTitle),
      pageIntro: normalizeNonEmptyString(settings?.pageIntro, DEFAULT_ORIGINALS_PAGE_SETTINGS.pageIntro),
      availableOriginalsLabel: normalizeNonEmptyString(
        settings?.availableOriginalsLabel,
        DEFAULT_ORIGINALS_PAGE_SETTINGS.availableOriginalsLabel
      ),
      availableOriginalsAnnouncement: normalizeNonEmptyString(
        settings?.availableOriginalsAnnouncement,
        DEFAULT_ORIGINALS_PAGE_SETTINGS.availableOriginalsAnnouncement
      ),
      availableOriginalsDescription: normalizeNonEmptyString(
        settings?.availableOriginalsDescription,
        DEFAULT_ORIGINALS_PAGE_SETTINGS.availableOriginalsDescription
      ),
      availableOriginalsCardDescription: normalizeNonEmptyString(
        settings?.availableOriginalsCardDescription,
        DEFAULT_ORIGINALS_PAGE_SETTINGS.availableOriginalsCardDescription
      ),
      comingSoonImage: settings?.comingSoonImage,
      comingSoonContent: normalizeBlocks(settings?.comingSoonContent, buildLegacyComingSoonContent(settings)),
      showCollections:
        typeof settings?.showCollections === 'boolean'
          ? settings.showCollections
          : DEFAULT_ORIGINALS_PAGE_SETTINGS.showCollections,
      collectionsLabel: normalizeNonEmptyString(
        settings?.collectionsLabel,
        DEFAULT_ORIGINALS_PAGE_SETTINGS.collectionsLabel
      ),
      collectionsDescription: normalizeNonEmptyString(
        settings?.collectionsDescription,
        DEFAULT_ORIGINALS_PAGE_SETTINGS.collectionsDescription
      ),
      showPrints:
        typeof settings?.showPrints === 'boolean'
          ? settings.showPrints
          : DEFAULT_ORIGINALS_PAGE_SETTINGS.showPrints,
      printsLabel: normalizeNonEmptyString(settings?.printsLabel, DEFAULT_ORIGINALS_PAGE_SETTINGS.printsLabel),
      printsDescription: normalizeNonEmptyString(
        settings?.printsDescription,
        DEFAULT_ORIGINALS_PAGE_SETTINGS.printsDescription
      ),
      earlyAccessHeading: normalizeNonEmptyString(
        settings?.earlyAccessHeading,
        DEFAULT_ORIGINALS_PAGE_SETTINGS.earlyAccessHeading
      ),
      homeCollectorSubhead: normalizeNonEmptyString(
        settings?.homeCollectorSubhead,
        DEFAULT_ORIGINALS_PAGE_SETTINGS.homeCollectorSubhead
      ),
      earlyAccessSubhead: normalizeNonEmptyString(
        settings?.earlyAccessSubhead,
        DEFAULT_ORIGINALS_PAGE_SETTINGS.earlyAccessSubhead
      ),
      earlyAccessButtonLabel: normalizeNonEmptyString(
        settings?.earlyAccessButtonLabel,
        DEFAULT_ORIGINALS_PAGE_SETTINGS.earlyAccessButtonLabel
      ),
      earlyAccessFinePrint: normalizeNonEmptyString(
        settings?.earlyAccessFinePrint,
        DEFAULT_ORIGINALS_PAGE_SETTINGS.earlyAccessFinePrint
      ),
    };
  } catch (error) {
    console.error('Failed to load originals page settings from Sanity', error);
    return DEFAULT_ORIGINALS_PAGE_SETTINGS;
  }
}
