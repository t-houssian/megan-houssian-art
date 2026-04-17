import { revalidatePath } from 'next/cache';
import { sanityClient } from './sanity';

export type OriginalCollectionSummary = {
  _id: string;
  title: string;
  slug: { current: string };
  description?: string;
  pieceCount?: number;
  sampleOriginals?: OriginalArtworkSample[];
};

export type OriginalArtworkSample = {
  _id: string;
  title: string;
  slug: { current: string };
  mainImage?: {
    asset: { _ref: string };
  };
};

export type OriginalArtworkSummary = {
  _id: string;
  title: string;
  slug: { current: string };
  mainImage?: {
    asset: { _ref: string };
  };
  price?: number;
  sold?: boolean;
  testProduct?: boolean;
  collections: OriginalCollectionSummary[];
};

export type OriginalArtwork = OriginalArtworkSummary & {
  gallery?: Array<{ asset: { _ref: string } }>;
  description?: string;
  shipping?: {
    weight?: number;
    dimensions?: {
      length?: number;
      width?: number;
      height?: number;
    };
  };
};

export type OriginalCollection = OriginalCollectionSummary & {
  originals: OriginalArtworkSummary[];
};

export type OriginalCheckoutPricing = {
  _id: string;
  title: string;
  slug: { current: string };
  price?: number;
  sold?: boolean;
  testProduct?: boolean;
};

type RawOriginalArtworkSummary = Omit<OriginalArtworkSummary, 'collections'> & {
  directCollections?: OriginalCollectionSummary[];
  reverseCollections?: OriginalCollectionSummary[];
};

type RawOriginalArtwork = RawOriginalArtworkSummary & Omit<OriginalArtwork, keyof OriginalArtworkSummary>;

type RawOriginalCollection = OriginalCollectionSummary & {
  originals?: RawOriginalArtworkSummary[];
};

const COLLECTION_SUMMARY_PROJECTION = `
  _id,
  title,
  "slug": slug,
  description
`;

const ORIGINAL_SUMMARY_PROJECTION = `
  _id,
  title,
  "slug": slug,
  mainImage,
  price,
  sold,
  testProduct,
  "directCollections": collections[]->{
    ${COLLECTION_SUMMARY_PROJECTION}
  },
  "reverseCollections": *[_type == "originalCollection" && ^._id in pieces[]._ref]{
    ${COLLECTION_SUMMARY_PROJECTION}
  }
`;

const ORIGINALS_LIST_QUERY = `
  *[_type == "original" && defined(slug.current)]{
    ${ORIGINAL_SUMMARY_PROJECTION}
  } | order(coalesce(sold, false) asc, _createdAt desc)
`;

const ORIGINAL_BY_SLUG_QUERY = `
  *[_type == "original" && slug.current == $slug][0]{
    ${ORIGINAL_SUMMARY_PROJECTION},
    gallery,
    description,
    shipping
  }
`;

const ORIGINAL_COLLECTIONS_LIST_QUERY = `
  *[_type == "originalCollection" && defined(slug.current)]{
    ${COLLECTION_SUMMARY_PROJECTION},
    "pieceCount": count(*[
      _type == "original" &&
      defined(slug.current) &&
      (
        _id in coalesce(^.pieces[]._ref, []) ||
        ^._id in coalesce(collections[]._ref, [])
      )
    ]),
    "sampleOriginals": *[
      _type == "original" &&
      defined(slug.current) &&
      defined(mainImage.asset) &&
      (
        _id in coalesce(^.pieces[]._ref, []) ||
        ^._id in coalesce(collections[]._ref, [])
      )
    ] | order(coalesce(sold, false) asc, _createdAt desc)[0...4]{
      _id,
      title,
      "slug": slug,
      mainImage
    }
  } | order(title asc)
`;

const ORIGINAL_COLLECTION_BY_SLUG_QUERY = `
  *[_type == "originalCollection" && slug.current == $slug][0]{
    ${COLLECTION_SUMMARY_PROJECTION},
    "originals": *[
      _type == "original" &&
      defined(slug.current) &&
      (
        _id in coalesce(^.pieces[]._ref, []) ||
        ^._id in coalesce(collections[]._ref, [])
      )
    ]{
      ${ORIGINAL_SUMMARY_PROJECTION}
    } | order(coalesce(sold, false) asc, _createdAt desc)
  }
`;

const ORIGINAL_CHECKOUT_PRICING_QUERY = `
  *[_type == "original" && slug.current == $slug && !(_id in path("drafts.**"))][0]{
    _id,
    title,
    "slug": slug,
    price,
    sold,
    testProduct
  }
`;

function isValidCollection(
  collection: OriginalCollectionSummary | null | undefined
): collection is OriginalCollectionSummary {
  return Boolean(collection?._id && collection.title && collection.slug?.current);
}

function normalizeCollections(
  ...collectionGroups: Array<OriginalCollectionSummary[] | undefined>
): OriginalCollectionSummary[] {
  const collectionsById = new Map<string, OriginalCollectionSummary>();

  for (const collectionGroup of collectionGroups) {
    for (const collection of collectionGroup ?? []) {
      if (!isValidCollection(collection) || collectionsById.has(collection._id)) {
        continue;
      }

      collectionsById.set(collection._id, collection);
    }
  }

  return Array.from(collectionsById.values()).sort((a, b) => a.title.localeCompare(b.title));
}

function normalizeOriginal<T extends RawOriginalArtworkSummary>(
  original: T
): Omit<T, 'directCollections' | 'reverseCollections'> & OriginalArtworkSummary {
  const { directCollections, reverseCollections, ...rest } = original;

  return {
    ...rest,
    collections: normalizeCollections(directCollections, reverseCollections),
  };
}

function normalizeCollection(collection: RawOriginalCollection): OriginalCollection {
  return {
    ...collection,
    originals: (collection.originals ?? []).map(normalizeOriginal),
  };
}

export async function fetchOriginals(): Promise<OriginalArtworkSummary[]> {
  const originals = await sanityClient.fetch<RawOriginalArtworkSummary[]>(
    ORIGINALS_LIST_QUERY,
    {},
    { next: { revalidate: 60 } }
  );

  return originals.map(normalizeOriginal);
}

export async function fetchOriginalBySlug(slug: string): Promise<OriginalArtwork | null> {
  const original = await sanityClient.fetch<RawOriginalArtwork | null>(ORIGINAL_BY_SLUG_QUERY, { slug });

  return original ? normalizeOriginal(original) : null;
}

export async function fetchOriginalCollections(): Promise<OriginalCollectionSummary[]> {
  return sanityClient.fetch<OriginalCollectionSummary[]>(
    ORIGINAL_COLLECTIONS_LIST_QUERY,
    {},
    { next: { revalidate: 60 } }
  );
}

export async function fetchOriginalCollectionBySlug(slug: string): Promise<OriginalCollection | null> {
  const collection = await sanityClient.fetch<RawOriginalCollection | null>(
    ORIGINAL_COLLECTION_BY_SLUG_QUERY,
    { slug },
    { next: { revalidate: 60 } }
  );

  return collection ? normalizeCollection(collection) : null;
}

export async function fetchOriginalCheckoutPricing(slug: string): Promise<OriginalCheckoutPricing | null> {
  return sanityClient.withConfig({ useCdn: false }).fetch<OriginalCheckoutPricing | null>(
    ORIGINAL_CHECKOUT_PRICING_QUERY,
    { slug },
    { cache: 'no-store' }
  );
}

export type MarkOriginalSoldResult =
  | { status: 'updated'; id: string; title?: string }
  | { status: 'already_sold'; id: string; title?: string }
  | { status: 'not_found'; slug: string }
  | { status: 'skipped'; reason: 'missing_slug' | 'missing_token'; slug?: string };

const ORIGINAL_FOR_SALE_BY_SLUG_QUERY = `
  *[_type == "original" && slug.current == $slug && !(_id in path("drafts.**"))][0]{
    _id,
    _rev,
    title,
    sold
  }
`;

const getSanityWriteToken = () =>
  process.env.SANITY_WRITE_TOKEN ||
  process.env.SANITY_AUTH_TOKEN ||
  process.env.SANITY_API_WRITE_TOKEN;

const revalidateOriginalSoldPaths = (slug: string) => {
  try {
    revalidatePath('/originals');
    revalidatePath('/hidden-originals');
    revalidatePath('/originals-collectors-access');
    revalidatePath('/originals/collections');
    revalidatePath(`/originals/${slug}`);
  } catch (error) {
    console.error('Failed to revalidate original sold paths:', error);
  }
};

export async function markOriginalSoldBySlug(slug: unknown): Promise<MarkOriginalSoldResult> {
  if (typeof slug !== 'string' || !slug.trim()) {
    return { status: 'skipped', reason: 'missing_slug' };
  }

  const normalizedSlug = slug.trim();
  const token = getSanityWriteToken();

  if (!token) {
    return { status: 'skipped', reason: 'missing_token', slug: normalizedSlug };
  }

  const writeClient = sanityClient.withConfig({
    useCdn: false,
    token,
  });

  const original = await writeClient.fetch<{
    _id: string;
    _rev: string;
    title?: string;
    sold?: boolean;
  } | null>(
    ORIGINAL_FOR_SALE_BY_SLUG_QUERY,
    { slug: normalizedSlug },
    { cache: 'no-store' }
  );

  if (!original?._id) {
    return { status: 'not_found', slug: normalizedSlug };
  }

  if (original.sold) {
    return { status: 'already_sold', id: original._id, title: original.title };
  }

  await writeClient
    .patch(original._id)
    .set({ sold: true })
    .commit({ visibility: 'sync' });

  revalidateOriginalSoldPaths(normalizedSlug);

  return { status: 'updated', id: original._id, title: original.title };
}
