import { describe, expect, it } from 'vitest';
import type { OriginalCollectionSummary } from '../lib/originals';
import { originalBackHref, originalCollectionHref, originalCollectionLinks, originalDetailHref, originalSlugFromParam } from '../lib/original-collections';
import { collectionSlugForTitle } from '../sanity/migrations/assign-original-collections.cjs';

const evening: OriginalCollectionSummary = { _id: 'evening', title: 'Evening Light', slug: { current: 'evening-light' } };
const hillside: OriginalCollectionSummary = { _id: 'hillside', title: 'Hillside Studies', slug: { current: 'hillside-studies' } };
const links = originalCollectionLinks([evening, hillside]);

describe('original collection navigation', () => {
  it('includes future CMS collections without adding a route or a navigation constant', () => {
    const future = { _id: 'future', title: 'Winter Light', slug: { current: 'winter-light' } };
    expect(originalCollectionLinks([evening, hillside, future])).toContainEqual({
      label: 'Winter Light', slug: 'winter-light', href: '/originals/collections/winter-light',
    });
  });

  it('encodes artwork slugs with spaces while preserving collection return context', () => {
    const href = originalDetailHref('Small original oil, painting ', links[1].href);
    const url = new URL(href, 'https://example.com');
    expect(decodeURIComponent(url.pathname.split('/').at(-1)!)).toBe('Small original oil, painting ');
    expect(url.searchParams.get('from')).toBe(links[1].href);
    expect(originalCollectionHref('a/b')).toBe('/originals/collections/a%2Fb');
  });

  it('resolves encoded artwork route parameters and tolerates a literal percent sign', () => {
    expect(originalSlugFromParam('Velvet%20Hills')).toBe('Velvet Hills');
    expect(originalSlugFromParam('Small%20landscape%20painting%20')).toBe('Small landscape painting ');
    expect(originalSlugFromParam('Sunset 50% glow')).toBe('Sunset 50% glow');
  });

  it('returns to the collection from which the visitor opened a piece', () => {
    expect(originalBackHref(links[0].href, links, [hillside])).toBe(links[0].href);
  });

  it('uses the artwork collection for direct links and keeps hidden artwork return paths', () => {
    expect(originalBackHref(undefined, links, [hillside])).toBe(links[1].href);
    expect(originalBackHref(undefined, links, [], true)).toBe('/hidden-originals');
  });

  it.each(['https://other.example', '//other.example', '/originals/collections/missing', '/originals/collections/../contact'])('rejects an unrecognized return path: %s', (from) => {
    expect(originalBackHref(from, links, [hillside])).toBe(links[1].href);
  });
});

describe('one-time collection assignment', () => {
  it.each(['Hillside Study I', 'Hillside Study IX', 'Hillside Study XX', ' hillside study IV '])('recognizes a roman-numeral study: %s', (title) => {
    expect(collectionSlugForTitle(title)).toBe('hillside-studies');
  });

  it.each(['Velvet Hills', 'Close to Him, I find Rest', 'Hill Country Trails'])('places the remaining original in Evening Light: %s', (title) => {
    expect(collectionSlugForTitle(title)).toBe('evening-light');
  });
});
