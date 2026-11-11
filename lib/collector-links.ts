import type { SanityRichTextBlock } from './sanity-rich-text';

const COLLECTOR_HREF = '/#collector-list';
const COLLECTOR_HASHES = new Set(['#collector-list', '#collector-early-access']);
const SITE_HOSTS = new Set(['meganhoussianart.com', 'www.meganhoussianart.com']);

export function normalizeCollectorHref(href: string): string {
  try {
    const url = new URL(href, 'https://meganhoussianart.com');
    if (
      (url.protocol === 'https:' || url.protocol === 'http:') &&
      SITE_HOSTS.has(url.hostname) &&
      !url.username && !url.password &&
      url.pathname === '/' &&
      COLLECTOR_HASHES.has(url.hash)
    ) {
      return COLLECTOR_HREF;
    }
  } catch {
    // Preserve unrelated or invalid values for the rich-text renderer to handle.
  }
  return href;
}

export function normalizeCollectorBlockLinks(blocks: SanityRichTextBlock[]): SanityRichTextBlock[] {
  return blocks.map((block) => {
    if (!block.markDefs) return block;

    let changed = false;
    const markDefs = block.markDefs.map((mark) => {
      if (mark._type !== 'link' || !('href' in mark) || typeof mark.href !== 'string') return mark;
      const href = normalizeCollectorHref(mark.href);
      if (href === mark.href) return mark;
      changed = true;
      return { ...mark, href };
    });
    return changed ? { ...block, markDefs } : block;
  });
}
