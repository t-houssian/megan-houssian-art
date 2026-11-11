import { describe, expect, it } from 'vitest';
import { normalizeCollectorBlockLinks, normalizeCollectorHref } from '../lib/collector-links';
import type { SanityRichTextBlock } from '../lib/sanity-rich-text';

describe('collector signup links', () => {
  it.each([
    '/#collector-early-access',
    '#collector-early-access',
    '#collector-list',
    '/#collector-list',
    'https://www.meganhoussianart.com/#collector-early-access',
    'https://meganhoussianart.com/#collector-list',
    'http://meganhoussianart.com/#collector-early-access',
    '//www.meganhoussianart.com/#collector-list',
  ])('keeps an existing signup link on the current site: %s', (href) => {
    expect(normalizeCollectorHref(href)).toBe('/#collector-list');
  });

  it.each([
    'https://other.example/#collector-early-access',
    'https://meganhoussianart.com.other.example/#collector-list',
    'https://www.meganhoussianart.com/about#collector-list',
    '/originals',
    '/about#collector-list',
    '#gallery',
    'mailto:megan@example.com',
  ])('preserves an unrelated URL: %s', (href) => {
    expect(normalizeCollectorHref(href)).toBe(href);
  });

  it('preserves biography text, annotations, and the stored CMS input while updating only the signup href', () => {
    const blocks: SanityRichTextBlock[] = [{
      _key: 'biography',
      _type: 'block',
      style: 'normal',
      children: [
        { _type: 'span', _key: 'intro', text: 'An unchanged biography. ', marks: [] },
        { _type: 'span', _key: 'signup', text: 'Join my list', marks: ['signup-link', 'em'] },
      ],
      markDefs: [
        { _type: 'link', _key: 'signup-link', href: 'https://www.meganhoussianart.com/#collector-early-access' },
        { _type: 'link', _key: 'other-link', href: 'https://other.example/gallery' },
      ],
    }];
    const result = normalizeCollectorBlockLinks(blocks);
    expect(result[0].children).toBe(blocks[0].children);
    expect(result[0].markDefs?.[0]).toEqual({ _type: 'link', _key: 'signup-link', href: '/#collector-list' });
    expect(result[0].markDefs?.[1]).toBe(blocks[0].markDefs?.[1]);
    expect(blocks[0].markDefs?.[0]).toHaveProperty('href', 'https://www.meganhoussianart.com/#collector-early-access');
  });
});
