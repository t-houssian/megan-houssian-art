// app/originals/[slug]/page.tsx
import { sanityClient } from '../../../lib/sanity';
import ImageUrlBuilder from '@sanity/image-url';
import Image from 'next/image';

const builder = ImageUrlBuilder(sanityClient);

function urlFor(source: any) {
  return builder.image(source);
}

type OriginalArtwork = {
  _id: string;
  title: string;
  mainImage: {
    asset: { _ref: string };
  };
  price: number;
  sold: boolean;
  description?: string;
};

async function fetchOriginalBySlug(slug: string): Promise<OriginalArtwork | null> {
  const query = `
    *[_type == "original" && slug.current == $slug][0]{
      _id,
      title,
      mainImage,
      price,
      sold,
      description
    }
  `;
  const data = await sanityClient.fetch(query, { slug });
  return data;
}

export default async function OriginalDetailPage({ params }: { params: { slug: string } }) {
  const artwork = await fetchOriginalBySlug(params.slug);

  if (!artwork) {
    return (
      <div className="max-w-7xl mx-auto py-16 px-4">
        <h1 className="text-2xl font-bold">Artwork Not Found</h1>
      </div>
    );
  }

  return (
    <section className="max-w-5xl mx-auto py-16 px-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* IMAGE */}
        {artwork.mainImage?.asset && (
          <div className="relative w-full h-96 bg-gray-100">
            <Image
              src={urlFor(artwork.mainImage).width(800).height(800).url()}
              alt={artwork.title}
              fill
              style={{ objectFit: 'cover' }}
            />
          </div>
        )}

        {/* DETAILS */}
        <div>
          <h1 className="text-3xl font-bold mb-4">{artwork.title}</h1>
          <p className="text-gray-700 mb-2">
            Price: ${artwork.price?.toLocaleString()}
          </p>
          {artwork.sold ? (
            <span className="inline-block text-red-500 font-bold">
              SOLD
            </span>
          ) : (
            <button
              onClick={() => alert(`Purchasing ${artwork.title}...`)}
              className="bg-gray-900 text-white px-6 py-2 rounded-md hover:bg-gray-700 transition-colors"
            >
              Buy Now
            </button>
          )}

          {artwork.description && (
            <div className="mt-6 text-gray-800">
              {artwork.description}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
