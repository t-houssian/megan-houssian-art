export type SanityRichTextLinkMarkDef = {
  _key?: string;
  _type: 'link';
  href?: string;
};

export type SanityRichTextMarkDef = SanityRichTextLinkMarkDef | { _key?: string; _type?: string };

export type SanityRichTextSpan = {
  _key?: string;
  _type: 'span';
  text?: string;
  marks?: string[];
};

export type SanityRichTextBlock = {
  _key?: string;
  _type: 'block';
  style?: string;
  children?: SanityRichTextSpan[];
  markDefs?: SanityRichTextMarkDef[];
};

type LinkedParagraphInput = {
  beforeLink: string;
  linkText: string;
  linkHref: string;
  afterLink: string;
};

const normalizeString = (value: unknown) => (typeof value === 'string' ? value : '').trim();

export const isSanityRichTextBlocks = (value: unknown): value is SanityRichTextBlock[] => {
  if (!Array.isArray(value) || value.length === 0) {
    return false;
  }

  return value.every((item) => {
    if (!item || typeof item !== 'object') {
      return false;
    }

    const block = item as Partial<SanityRichTextBlock>;
    return block._type === 'block' && Array.isArray(block.children);
  });
};

export const createParagraphBlock = (text: string): SanityRichTextBlock => ({
  _type: 'block',
  style: 'normal',
  children: [
    {
      _type: 'span',
      text,
      marks: [],
    },
  ],
  markDefs: [],
});

export const createLinkedParagraphBlock = ({
  beforeLink,
  linkText,
  linkHref,
  afterLink,
}: LinkedParagraphInput): SanityRichTextBlock => {
  const linkMarkKey = 'inline-link';
  const beforeText =
    beforeLink.length > 0 && !/\s$/.test(beforeLink) ? `${beforeLink} ` : beforeLink;
  const afterText =
    afterLink.length > 0 && !/^\s/.test(afterLink) ? ` ${afterLink}` : afterLink;

  return {
    _type: 'block',
    style: 'normal',
    children: [
      {
        _type: 'span',
        text: beforeText,
        marks: [],
      },
      {
        _type: 'span',
        text: linkText,
        marks: [linkMarkKey],
      },
      {
        _type: 'span',
        text: afterText,
        marks: [],
      },
    ],
    markDefs: [
      {
        _type: 'link',
        _key: linkMarkKey,
        href: linkHref,
      },
    ],
  };
};

export const normalizeBlocks = (
  value: unknown,
  fallback: SanityRichTextBlock[]
): SanityRichTextBlock[] => {
  if (isSanityRichTextBlocks(value)) {
    return value;
  }

  return fallback;
};

export const normalizeNonEmptyString = (value: unknown, fallback: string): string => {
  const normalized = normalizeString(value);
  return normalized.length > 0 ? normalized : fallback;
};
