// app/originals/page.tsx
import { sanityClient } from '../../lib/sanity';
import ImageUrlBuilder from '@sanity/image-url';
import Link from 'next/link';
import Image from 'next/image';

const builder = ImageUrlBuilder(sanityClient);

// Helper function to build URLs from Sanity image references
function urlFor(source: { asset: { _ref: string } }) {
  return builder.image(source);
}

// Adjust the type to match your schema fields
type OriginalArtwork = {
  _id: string;
  title: string;
  slug: { current: string };
  mainImage?: {
    asset: { _ref: string };
  };
  price?: number;
  sold?: boolean;
};

// Fetch all original artworks for sale
async function fetchOriginals(): Promise<OriginalArtwork[]> {
  const query = `
    *[_type == "original" && defined(slug.current)]{
      _id,
      title,
      "slug": slug,
      mainImage,
      price,
      sold
    } | order(_createdAt desc)
  `;
  return sanityClient.fetch(query);
}

export default async function OriginalsPage() {
  const originals = await fetchOriginals();

  return (
    <section className="max-w-7xl mx-auto py-16 px-4">
      <h1 className="text-3xl md:text-4xl font-bold mb-8">Originals for Sale</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
        {originals.map((art) => (
          <div
            key={art._id}
            className="border border-gray-200 rounded-md overflow-hidden shadow-sm hover:shadow-md transition-shadow"
          >
            {art.mainImage?.asset && (
              <Link href={`/originals/${art.slug.current}`}>
                <div className="relative w-full h-64 overflow-hidden">
                  <Image
                    src={urlFor(art.mainImage).width(600).height(600).url()}
                    alt={art.title}
                    fill
                    style={{ objectFit: 'cover' }}
                  />
                </div>
              </Link>
            )}

            <div className="p-4">
              <Link href={`/originals/${art.slug.current}`}>
                <h2 className="text-xl font-semibold mb-2">{art.title}</h2>
              </Link>
              <p className="text-gray-700 mb-2">${art.price?.toLocaleString() || 0}</p>

              {art.sold ? (
                <span className="inline-block text-red-500 font-bold">SOLD</span>
              ) : (
                <button
                  onClick={() => alert(`Placeholder purchase for ${art.title}!`)}
                  className="bg-gray-900 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors"
                >
                  Buy Now
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
