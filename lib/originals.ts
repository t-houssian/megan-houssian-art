import { sanityClient } from './sanity';

export type OriginalArtworkSummary = {
  _id: string;
  title: string;
  slug: { current: string };
  mainImage?: {
    asset: { _ref: string };
  };
  price?: number;
  sold?: boolean;
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

const ORIGINALS_LIST_QUERY = `
  *[_type == "original" && defined(slug.current)]{
    _id,
    title,
    "slug": slug,
    mainImage,
    price,
    sold
  } | order(coalesce(sold, false) asc, _createdAt desc)
`;

const ORIGINAL_BY_SLUG_QUERY = `
  *[_type == "original" && slug.current == $slug][0]{
    _id,
    title,
    "slug": slug,
    mainImage,
    gallery,
    price,
    sold,
    description,
    shipping
  }
`;

export async function fetchOriginals(): Promise<OriginalArtworkSummary[]> {
  return sanityClient.fetch(ORIGINALS_LIST_QUERY, {}, { next: { revalidate: 60 } });
}

export async function fetchOriginalBySlug(slug: string): Promise<OriginalArtwork | null> {
  return sanityClient.fetch(ORIGINAL_BY_SLUG_QUERY, { slug });
}
