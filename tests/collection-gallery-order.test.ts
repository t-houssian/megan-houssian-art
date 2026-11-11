import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { OriginalArtworkSummary, OriginalCollectionSummary } from '../lib/originals';

const mocks = vi.hoisted(() => ({ fetchOriginals: vi.fn() }));

vi.mock('../lib/originals', () => ({ fetchOriginals: mocks.fetchOriginals }));
vi.mock('../app/fonts', () => ({ cormorant: { className: 'heading' }, lora: { className: 'body' } }));
vi.mock('../app/components/OriginalArtworkCard', () => ({
  default: ({ item }: { item: OriginalArtworkSummary }) =>
    createElement('article', { 'data-id': item._id }),
}));

import OriginalsGalleryPage from '../app/components/OriginalsGalleryPage';

const evening: OriginalCollectionSummary = {
  _id: 'evening', title: 'Evening Light Collection', slug: { current: 'evening-light' },
  orderedOriginalIds: ['hillside-only', 'shared', 'deleted', 'evening-only'],
};
const hillside: OriginalCollectionSummary = {
  _id: 'hillside', title: 'Hillside Studies', slug: { current: 'hillside-studies' },
  orderedOriginalIds: ['hillside-only', 'shared'],
};

function artwork(_id: string, collections: OriginalCollectionSummary[]): OriginalArtworkSummary {
  return { _id, title: _id, slug: { current: _id }, collections };
}

const globalOrder = [
  artwork('evening-only', [evening]),
  artwork('shared', [evening, hillside]),
  artwork('hillside-only', [hillside]),
  artwork('new-evening', [evening]),
];

async function renderedIds(props: Parameters<typeof OriginalsGalleryPage>[0]) {
  const markup = renderToStaticMarkup(await OriginalsGalleryPage(props));
  return Array.from(markup.matchAll(/<article data-id="([^"]+)"/g), (match) => match[1]);
}

beforeEach(() => {
  mocks.fetchOriginals.mockReset();
  mocks.fetchOriginals.mockResolvedValue(globalOrder);
});

describe('collection gallery ordering', () => {
  it('uses saved collection order, ignores foreign references, and appends new members', async () => {
    expect(await renderedIds({ sourcePath: '/originals/collections/evening-light', collection: evening }))
      .toEqual(['shared', 'evening-only', 'new-evening']);
    expect(mocks.fetchOriginals).toHaveBeenCalledExactlyOnceWith('public');
  });

  it('renders independent orders for collections sharing the same artwork and source list', async () => {
    const eveningIds = await renderedIds({
      sourcePath: '/originals/collections/evening-light', collection: evening,
    });
    const hillsideIds = await renderedIds({
      sourcePath: '/originals/collections/hillside-studies', collection: hillside,
    });

    expect(eveningIds).toEqual(['shared', 'evening-only', 'new-evening']);
    expect(hillsideIds).toEqual(['hillside-only', 'shared']);
    expect(mocks.fetchOriginals.mock.calls).toEqual([['public'], ['public']]);
    expect(globalOrder.map((item) => item._id))
      .toEqual(['evening-only', 'shared', 'hillside-only', 'new-evening']);
  });

  it('keeps the hidden listing on its existing order and requests hidden originals', async () => {
    const hidden = [
      { ...artwork('hidden-second', [evening]), hiddenOriginal: true },
      { ...artwork('hidden-first', [hillside]), hiddenOriginal: true },
    ];
    mocks.fetchOriginals.mockResolvedValue(hidden);

    expect(await renderedIds({ sourcePath: '/hidden-originals' }))
      .toEqual(['hidden-second', 'hidden-first']);
    expect(mocks.fetchOriginals).toHaveBeenCalledExactlyOnceWith('hidden');
  });
});
