import { describe, expect, it } from 'vitest';
import { orderCollectionOriginals } from '../lib/original-collection-order';

const a = { _id: 'a', title: 'Painting A' };
const b = { _id: 'b', title: 'Painting B' };
const c = { _id: 'c', title: 'Painting C' };
const ids = (items: Array<{ _id: string }>) => items.map((item) => item._id);

describe('collection artwork ordering', () => {
  it('follows the collection order and appends newly assigned pieces', () => {
    expect(ids(orderCollectionOriginals([a, b, c], ['c', 'a']))).toEqual(['c', 'a', 'b']);
  });

  it('allows the same piece to occupy different positions in separate collections', () => {
    expect(ids(orderCollectionOriginals([a, b], ['b', 'a']))).toEqual(['b', 'a']);
    expect(ids(orderCollectionOriginals([b, c], ['c', 'b']))).toEqual(['c', 'b']);
  });

  it('does not add pieces from another collection or duplicate deleted/repeated references', () => {
    expect(ids(orderCollectionOriginals([a, b], ['foreign', 'b', 'deleted', 'b', 'a']))).toEqual(['b', 'a']);
  });

  it('preserves the existing sequence when a collection has not been ordered yet', () => {
    expect(orderCollectionOriginals([c, a, b])).toEqual([c, a, b]);
    expect(orderCollectionOriginals([c, a, b], [])).toEqual([c, a, b]);
  });

  it('does not mutate artwork data or either input array', () => {
    const originals = Object.freeze([Object.freeze(a), Object.freeze(b)]);
    const orderedIds = Object.freeze(['b', 'a']);
    expect(orderCollectionOriginals(originals, orderedIds)).toEqual([b, a]);
    expect(originals).toEqual([a, b]);
    expect(orderedIds).toEqual(['b', 'a']);
  });

  it('handles empty collections and duplicate legacy artwork rows', () => {
    expect(orderCollectionOriginals([], ['a'])).toEqual([]);
    expect(orderCollectionOriginals([a, a, b], ['a', 'a'])).toEqual([a, b]);
  });
});
