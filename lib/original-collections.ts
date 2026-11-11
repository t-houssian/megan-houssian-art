import type { OriginalCollectionSummary } from './originals';

export type OriginalCollectionLink = {
  label: string;
  slug: string;
  href: string;
};

export function originalCollectionHref(slug: string) {
  return `/originals/collections/${encodeURIComponent(slug)}`;
}

export function originalCollectionLinks(collections: OriginalCollectionSummary[]): OriginalCollectionLink[] {
  return collections
    .filter((collection) => collection.title && collection.slug?.current)
    .map((collection) => ({
      label: collection.title,
      slug: collection.slug.current,
      href: originalCollectionHref(collection.slug.current),
    }));
}

export function originalDetailHref(slug: string, sourcePath: string) {
  const params = new URLSearchParams({ from: sourcePath });
  return `/originals/${encodeURIComponent(slug)}?${params.toString()}`;
}

export function originalSlugFromParam(slug: string) {
  try {
    return decodeURIComponent(slug);
  } catch {
    return slug;
  }
}

export function originalBackHref(
  from: string | undefined,
  collectionLinks: OriginalCollectionLink[],
  artworkCollections: OriginalCollectionSummary[],
  hiddenOriginal = false
) {
  const allowedPaths = new Set([
    '/originals',
    '/hidden-originals',
    '/originals-collectors-access',
    ...collectionLinks.map((collection) => collection.href),
  ]);

  if (from && allowedPaths.has(from)) return from;
  if (hiddenOriginal) return '/hidden-originals';

  return collectionLinks.find((link) =>
    artworkCollections.some((collection) => collection.slug.current === link.slug)
  )?.href ?? '/originals';
}
