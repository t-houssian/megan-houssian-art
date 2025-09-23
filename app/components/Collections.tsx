// components/Collections.tsx
import { sanityClient } from '../../lib/sanity';
import ImageUrlBuilder from '@sanity/image-url';
import CollectionsClient from './CollectionsClient';

export type ArtPiece = {
  _id: string;
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
  const query = `*[_type == "gallery"] | order(_createdAt desc) {
    _id,
    mainImage
  }`;
  return await sanityClient.fetch(query, {}, { cache: 'no-store' });
}

export default async function Collections() {
  const artPieces = await fetchArtPieces();
  return <CollectionsClient artPieces={artPieces} />;
}
