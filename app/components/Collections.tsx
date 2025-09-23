// components/Collections.tsx
import { sanityClient } from '../../lib/sanity';
import ImageUrlBuilder from '@sanity/image-url';
import CollectionsClient from './CollectionsClient';

export type ArtPiece = {
  _id: string;
  title?: string;
  mainImage: {
    asset: {
      _ref: string;
      _type: string;
    };
  };
};

const builder = ImageUrlBuilder(sanityClient);

export function urlFor(source: ArtPiece["mainImage"]) {
  // Configure the builder (e.g., fit mode) as needed
  return builder.image(source);
}

async function fetchArtPieces(): Promise<ArtPiece[]> {
  // Fetch manually ordered entries and append any pieces not yet in the order doc.
  const query = `{
    "orderDoc": *[_type == "galleryOrder"][0]{
      items[]->{
        _id,
        title,
        mainImage
      },
      "orderedIds": items[]._ref
    },
    "all": *[_type == "gallery"] | order(_createdAt desc) {
      _id,
      title,
      mainImage
    }
  }`;

  const { orderDoc, all } = await sanityClient.fetch<{
    orderDoc?: {
      items?: ArtPiece[];
      orderedIds?: string[];
    };
    all?: ArtPiece[];
  }>(query, {}, { cache: 'no-store' });

  const orderedPieces = orderDoc?.items ?? [];
  const orderedIds = new Set(orderDoc?.orderedIds ?? []);
  const fallbackPieces = (all ?? []).filter((piece) => !orderedIds.has(piece._id));

  return [...orderedPieces, ...fallbackPieces];
}

export default async function Collections() {
  const artPieces = await fetchArtPieces();
  return <CollectionsClient artPieces={artPieces} />;
}
