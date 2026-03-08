import { sanityClient } from './sanity';
import {
  createLinkedParagraphBlock,
  createParagraphBlock,
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

type LegacyAboutPageSettingsFields = {
  introParagraph?: unknown;
  instrumentsParagraph?: unknown;
  collegeParagraph?: unknown;
  motherhoodParagraph?: unknown;
  napTimeParagraph?: unknown;
  closingPrefix?: unknown;
  closingLinkText?: unknown;
  closingLinkHref?: unknown;
  closingSuffix?: unknown;
};

export type AboutPageSettings = {
  pageTitle: string;
  aboutPageImage?: SanityImageWithAlt;
  content: SanityRichTextBlock[];
};

const DEFAULT_ABOUT_CONTENT: SanityRichTextBlock[] = [
  createParagraphBlock("Hi, I'm Megan! I'm a Texas Hill Country landscape painter, wife, and mama."),
  createParagraphBlock(
    "I've loved creating all my life, and not just art. I learned to play three different instruments, and I've been making crepes for family breakfasts since I was eight."
  ),
  createParagraphBlock(
    'Fun fact: I actually started college as an art major... but I switched out on the very first day of class. I instinctively knew that turning art into an assignment would steal the joy from it.'
  ),
  createParagraphBlock(
    'Motherhood brought it all back in the best way. It inspired me to protect my time, get really honest about what I wanted, and build a life that makes room for creating. My faith in Jesus Christ is also a guiding light in my daily life.'
  ),
  createParagraphBlock(
    `During my daughter's nap time, you'll find me painting distant blue hills, wildflowers, and open skies. Or, on days that aren't 100 degrees (Texas summers are brutal), you'll find me "cooking" outside with my daughter, where we make leaf and dirt soup topped with flowers we find in our yard.`
  ),
  createLinkedParagraphBlock({
    beforeLink:
      "Whether you are drawn to the reverent landscapes, atmospheric skies, or the story of a happy mom who has found meaning in creation, welcome. If you'd like first access to new work, studio updates, and shop restocks, ",
    linkText: 'join my email list here',
    linkHref: '/#collector-early-access',
    afterLink: ' so we can stay in touch.',
  }),
];

const DEFAULT_ABOUT_PAGE_SETTINGS: AboutPageSettings = {
  pageTitle: 'About Megan',
  aboutPageImage: undefined,
  content: DEFAULT_ABOUT_CONTENT,
};

type PartialAboutPageSettings = (Partial<AboutPageSettings> & LegacyAboutPageSettingsFields) | null;

const aboutPageSettingsProjection = `{
  pageTitle,
  aboutPageImage{
    asset,
    alt
  },
  content,
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

const buildLegacyAboutContent = (settings: LegacyAboutPageSettingsFields | null): SanityRichTextBlock[] => {
  const introParagraph = normalizeNonEmptyString(
    settings?.introParagraph,
    "Hi, I'm Megan! I'm a Texas Hill Country landscape painter, wife, and mama."
  );
  const instrumentsParagraph = normalizeNonEmptyString(
    settings?.instrumentsParagraph,
    "I've loved creating all my life, and not just art. I learned to play three different instruments, and I've been making crepes for family breakfasts since I was eight."
  );
  const collegeParagraph = normalizeNonEmptyString(
    settings?.collegeParagraph,
    'Fun fact: I actually started college as an art major... but I switched out on the very first day of class. I instinctively knew that turning art into an assignment would steal the joy from it.'
  );
  const motherhoodParagraph = normalizeNonEmptyString(
    settings?.motherhoodParagraph,
    'Motherhood brought it all back in the best way. It inspired me to protect my time, get really honest about what I wanted, and build a life that makes room for creating. My faith in Jesus Christ is also a guiding light in my daily life.'
  );
  const napTimeParagraph = normalizeNonEmptyString(
    settings?.napTimeParagraph,
    `During my daughter's nap time, you'll find me painting distant blue hills, wildflowers, and open skies. Or, on days that aren't 100 degrees (Texas summers are brutal), you'll find me "cooking" outside with my daughter, where we make leaf and dirt soup topped with flowers we find in our yard.`
  );
  const closingPrefix = normalizeNonEmptyString(
    settings?.closingPrefix,
    "Whether you are drawn to the reverent landscapes, atmospheric skies, or the story of a happy mom who has found meaning in creation, welcome. If you'd like first access to new work, studio updates, and shop restocks, "
  );
  const closingLinkText = normalizeNonEmptyString(settings?.closingLinkText, 'join my email list here');
  const closingLinkHref = normalizeNonEmptyString(settings?.closingLinkHref, '/#collector-early-access');
  const closingSuffix = normalizeNonEmptyString(settings?.closingSuffix, ' so we can stay in touch.');

  return [
    createParagraphBlock(introParagraph),
    createParagraphBlock(instrumentsParagraph),
    createParagraphBlock(collegeParagraph),
    createParagraphBlock(motherhoodParagraph),
    createParagraphBlock(napTimeParagraph),
    createLinkedParagraphBlock({
      beforeLink: closingPrefix,
      linkText: closingLinkText,
      linkHref: closingLinkHref,
      afterLink: closingSuffix,
    }),
  ];
};

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
      pageTitle: normalizeNonEmptyString(settings?.pageTitle, DEFAULT_ABOUT_PAGE_SETTINGS.pageTitle),
      aboutPageImage: settings?.aboutPageImage ?? legacyImageSettings?.aboutPageImage,
      content: normalizeBlocks(settings?.content, buildLegacyAboutContent(settings)),
    };
  } catch (error) {
    console.error('Failed to load about page settings from Sanity', error);
    return DEFAULT_ABOUT_PAGE_SETTINGS;
  }
}
