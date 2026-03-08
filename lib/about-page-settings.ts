import { sanityClient } from './sanity';

type SanityImageWithAlt = {
  asset?: {
    _ref: string;
  };
  alt?: string;
};

export type AboutPageSettings = {
  pageTitle: string;
  aboutPageImage?: SanityImageWithAlt;
  introParagraph: string;
  instrumentsParagraph: string;
  collegeParagraph: string;
  motherhoodParagraph: string;
  napTimeParagraph: string;
  closingPrefix: string;
  closingLinkText: string;
  closingLinkHref: string;
  closingSuffix: string;
};

const DEFAULT_ABOUT_PAGE_SETTINGS: AboutPageSettings = {
  pageTitle: 'About Megan',
  aboutPageImage: undefined,
  introParagraph: "Hi, I'm Megan! I'm a Texas Hill Country landscape painter, wife, and mama.",
  instrumentsParagraph:
    "I've loved creating all my life, and not just art. I learned to play three different instruments, and I've been making crepes for family breakfasts since I was eight.",
  collegeParagraph:
    'Fun fact: I actually started college as an art major... but I switched out on the very first day of class. I instinctively knew that turning art into an assignment would steal the joy from it.',
  motherhoodParagraph:
    'Motherhood brought it all back in the best way. It inspired me to protect my time, get really honest about what I wanted, and build a life that makes room for creating. My faith in Jesus Christ is also a guiding light in my daily life.',
  napTimeParagraph:
    "During my daughter's nap time, you'll find me painting distant blue hills, wildflowers, and open skies. Or, on days that aren't 100 degrees (Texas summers are brutal), you'll find me \"cooking\" outside with my daughter, where we make leaf and dirt soup topped with flowers we find in our yard.",
  closingPrefix:
    "Whether you are drawn to the reverent landscapes, atmospheric skies, or the story of a happy mom who has found meaning in creation, welcome. If you'd like first access to new work, studio updates, and shop restocks,",
  closingLinkText: 'join my email list here',
  closingLinkHref: '/#collector-early-access',
  closingSuffix: 'so we can stay in touch.',
};

type PartialAboutPageSettings = Partial<AboutPageSettings> | null;

const aboutPageSettingsProjection = `{
  pageTitle,
  aboutPageImage{
    asset,
    alt
  },
  introParagraph,
  instrumentsParagraph,
  collegeParagraph,
  motherhoodParagraph,
  napTimeParagraph,
  closingPrefix,
  closingLinkText,
  closingLinkHref,
  closingSuffix
}`;

const aboutPageSettingsSingletonQuery = `*[
  _type == "aboutPageSettings" &&
  _id in ["aboutPageSettings", "drafts.aboutPageSettings"]
][0]${aboutPageSettingsProjection}`;

const aboutPageSettingsFallbackQuery = `*[_type == "aboutPageSettings"] | order(_updatedAt desc)[0]${aboutPageSettingsProjection}`;

const legacyAboutImageQuery = `*[
  _type == "heroSettings" &&
  _id in ["heroSettings", "drafts.heroSettings"]
][0]{
  aboutPageImage{
    asset,
    alt
  }
}`;

const normalizeString = (value: unknown, fallback: string) =>
  typeof value === 'string' && value.trim().length > 0 ? value.trim() : fallback;

export async function fetchAboutPageSettings(): Promise<AboutPageSettings> {
  try {
    const singletonSettings = await sanityClient.fetch<PartialAboutPageSettings>(
      aboutPageSettingsSingletonQuery,
      {},
      { next: { revalidate: 60 } }
    );

    const settings =
      singletonSettings ??
      (await sanityClient.fetch<PartialAboutPageSettings>(
        aboutPageSettingsFallbackQuery,
        {},
        { next: { revalidate: 60 } }
      ));

    const legacyImageSettings = await sanityClient.fetch<{ aboutPageImage?: SanityImageWithAlt } | null>(
      legacyAboutImageQuery,
      {},
      { next: { revalidate: 60 } }
    );

    return {
      pageTitle: normalizeString(settings?.pageTitle, DEFAULT_ABOUT_PAGE_SETTINGS.pageTitle),
      aboutPageImage: settings?.aboutPageImage ?? legacyImageSettings?.aboutPageImage,
      introParagraph: normalizeString(settings?.introParagraph, DEFAULT_ABOUT_PAGE_SETTINGS.introParagraph),
      instrumentsParagraph: normalizeString(
        settings?.instrumentsParagraph,
        DEFAULT_ABOUT_PAGE_SETTINGS.instrumentsParagraph
      ),
      collegeParagraph: normalizeString(settings?.collegeParagraph, DEFAULT_ABOUT_PAGE_SETTINGS.collegeParagraph),
      motherhoodParagraph: normalizeString(
        settings?.motherhoodParagraph,
        DEFAULT_ABOUT_PAGE_SETTINGS.motherhoodParagraph
      ),
      napTimeParagraph: normalizeString(settings?.napTimeParagraph, DEFAULT_ABOUT_PAGE_SETTINGS.napTimeParagraph),
      closingPrefix: normalizeString(settings?.closingPrefix, DEFAULT_ABOUT_PAGE_SETTINGS.closingPrefix),
      closingLinkText: normalizeString(settings?.closingLinkText, DEFAULT_ABOUT_PAGE_SETTINGS.closingLinkText),
      closingLinkHref: normalizeString(settings?.closingLinkHref, DEFAULT_ABOUT_PAGE_SETTINGS.closingLinkHref),
      closingSuffix: normalizeString(settings?.closingSuffix, DEFAULT_ABOUT_PAGE_SETTINGS.closingSuffix),
    };
  } catch (error) {
    console.error('Failed to load about page settings from Sanity', error);
    return DEFAULT_ABOUT_PAGE_SETTINGS;
  }
}
