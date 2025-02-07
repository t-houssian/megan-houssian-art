// app/prints/page.tsx
import { sanityClient } from '../../lib/sanity';
import ImageUrlBuilder from '@sanity/image-url';
import Link from 'next/link';
import Image from 'next/image';

const builder = ImageUrlBuilder(sanityClient);

function urlFor(source: any) {
  return builder.image(source);
}

// Adjust type to match your "print" schema
type PrintProduct = {
  _id: string;
  title: string;
  slug: { current: string };
  mainImage: {
    asset: { _ref: string };
  };
  price: number;
  soldOut: boolean; // If you track sold-out prints (or inventory)
};

async function fetchPrints(): Promise<PrintProduct[]> {
  const query = `
    *[_type == "print" && defined(slug.current)]{
      _id,
      title,
      "slug": slug,
      mainImage,
      price,
      soldOut
    } | order(_createdAt desc)
  `;
  return sanityClient.fetch(query);
}

export default async function PrintsPage() {
  const prints = await fetchPrints();

  return (
    <section className="max-w-7xl mx-auto py-16 px-4">
      <h1 className="text-3xl md:text-4xl font-bold mb-8">Print Shop</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
        {prints.map((item) => (
          <div 
            key={item._id}
            className="border border-gray-200 rounded-md overflow-hidden shadow-sm hover:shadow-md transition-shadow"
          >
            {item.mainImage?.asset && (
              <Link href={`/prints/${item.slug.current}`}>
                <div className="relative w-full h-64 overflow-hidden">
                  <Image
                    src={urlFor(item.mainImage).width(600).height(600).url()}
                    alt={item.title}
                    fill
                    style={{ objectFit: 'cover' }}
                  />
                </div>
              </Link>
            )}

            <div className="p-4">
              <Link href={`/prints/${item.slug.current}`}>
                <h2 className="text-xl font-semibold mb-2">{item.title}</h2>
              </Link>
              <p className="text-gray-700 mb-2">${item.price?.toLocaleString() || 0}</p>

              {item.soldOut ? (
                <span className="inline-block text-red-500 font-bold">
                  Sold Out
                </span>
              ) : (
                <button
                  onClick={() => alert(`Purchasing ${item.title}...`)}
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
