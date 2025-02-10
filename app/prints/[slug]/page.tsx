// app/prints/[slug]/page.tsx
import { sanityClient } from '../../../lib/sanity';
import ImageUrlBuilder from '@sanity/image-url';
import Image from 'next/image';

const builder = ImageUrlBuilder(sanityClient);
function urlFor(source: { asset: { _ref: string } }) {
  return builder.image(source);
}

type PrintProduct = {
  _id: string;
  title: string;
  mainImage?: {
    asset: { _ref: string };
  };
  price?: number;
  soldOut?: boolean;
  description?: string;
};

async function fetchPrintBySlug(slug: string): Promise<PrintProduct | null> {
  const query = `
    *[_type == "print" && slug.current == $slug][0]{
      _id,
      title,
      mainImage,
      price,
      soldOut,
      description
    }
  `;
  return sanityClient.fetch(query, { slug });
}

// Note the typed definition for params
export default async function PrintDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const printItem = await fetchPrintBySlug(params.slug);

  if (!printItem) {
    return (
      <div className="max-w-7xl mx-auto py-16 px-4">
        <h1 className="text-2xl font-bold">Print Not Found</h1>
      </div>
    );
  }

  return (
    <section className="max-w-5xl mx-auto py-16 px-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {printItem.mainImage?.asset && (
          <div className="relative w-full h-96 bg-gray-100">
            <Image
              src={urlFor(printItem.mainImage).width(800).height(800).url()}
              alt={printItem.title}
              fill
              style={{ objectFit: 'cover' }}
            />
          </div>
        )}

        <div>
          <h1 className="text-3xl font-bold mb-4">{printItem.title}</h1>
          <p className="text-gray-700 mb-2">
            Price: ${printItem.price?.toLocaleString()}
          </p>
          {printItem.soldOut ? (
            <span className="inline-block text-red-500 font-bold">Sold Out</span>
          ) : (
            <button
              onClick={() => alert(`Purchasing ${printItem.title}...`)}
              className="bg-gray-900 text-white px-6 py-2 rounded-md hover:bg-gray-700 transition-colors"
            >
              Buy Now
            </button>
          )}

          {printItem.description && (
            <div className="mt-6 text-gray-800">
              {printItem.description}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
