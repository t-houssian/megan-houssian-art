// components/Gallery.tsx

import { sanityClient } from '../../lib/sanity';
import ImageUrlBuilder from '@sanity/image-url';
import Image from 'next/image';

type ArtPiece = {
  _id: string;
  title: string;
  mainImage: {
    asset: {
      _ref: string;
      _type: string;
    };
  };
};

const builder = ImageUrlBuilder(sanityClient);

function urlFor(source: any) {
  return builder.image(source);
}

async function fetchArtPieces(): Promise<ArtPiece[]> {
  const query = `*[_type == "artPiece"] | order(_createdAt desc) {
    _id,
    title,
    mainImage
  }`;
  return await sanityClient.fetch(query);
}

export default async function Gallery() {
  const artPieces = await fetchArtPieces();

  return (
    <section
      id="gallery"
      className="max-w-7xl mx-auto py-16 px-4"
    >
      <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-8 text-center">
        Gallery
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
        {artPieces && artPieces.length > 0 ? (
          artPieces.map((piece) => (
            <div key={piece._id} className="group">
              {piece.mainImage?.asset && (
                <div className="relative w-full h-72 overflow-hidden rounded-md shadow-lg">
                  <Image
                    src={urlFor(piece.mainImage).width(800).height(800).url()}
                    alt={piece.title}
                    fill
                    style={{ objectFit: 'cover' }}
                    className="group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
              )}
              <h3 className="text-xl font-semibold mt-4 text-gray-800">
                {piece.title}
              </h3>
            </div>
          ))
        ) : (
          <p className="col-span-full text-center text-gray-500">
            No art pieces found.
          </p>
        )}
      </div>
    </section>
  );
}
