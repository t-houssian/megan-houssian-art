import { notFound } from 'next/navigation';
import { sanityClient } from '../../lib/sanity';
import ImageUrlBuilder from '@sanity/image-url';
import Link from 'next/link';
import Image from 'next/image';
import { cormorant, lora } from '../fonts';
import { formatRoundedDollars } from '../../lib/money';
import { fetchOriginalsPageSettings } from '../../lib/originals-page-settings';

export const revalidate = 60;

const builder = ImageUrlBuilder(sanityClient);
function urlFor(source: { asset: { _ref: string } }) {
  return builder.image(source);
}

type PrintProduct = {
  _id: string;
  title: string;
  slug: { current: string };
  mainImage?: {
    asset: { _ref: string };
  };
  soldOut?: boolean;
};

async function fetchPrints(): Promise<PrintProduct[]> {
  const query = `
    *[_type == "print" && defined(slug.current)]{
      _id,
      title,
      "slug": slug,
      mainImage,
      soldOut
    } | order(_createdAt desc)
  `;
  return sanityClient.fetch(query, {}, { next: { revalidate: 60 } });
}

export default async function PrintsPage() {
  const settings = await fetchOriginalsPageSettings();
  if (!settings.showPrints) {
    notFound();
  }

  const prints = await fetchPrints();

  return (
    <section className="min-h-screen bg-gradient-to-br from-ivory via-paper to-accent-cream">
      <div className="max-w-7xl mx-auto py-16 px-6">
        <div className="text-center mb-12">
          <h1 className={`${cormorant.className} text-4xl md:text-5xl font-light mb-6 text-brown tracking-wide`}>
            Print Shop
          </h1>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {prints.map((item) => (
            <Link
              key={item._id}
              href={`/prints/${item.slug.current}`}
            >
              <div className="group cursor-pointer">
                <div className="bg-white/80 backdrop-blur-sm border border-tan/30 rounded-2xl overflow-hidden shadow-vintage hover:shadow-vintage-lg transition-all duration-500 transform hover:-translate-y-2">
                  {item.mainImage?.asset && (
                    <div className="relative w-full h-80 overflow-hidden bg-paper">
                      <Image
                        src={urlFor(item.mainImage).width(600).height(600).url()}
                        alt={item.title}
                        fill
                        style={{ objectFit: 'cover' }}
                        className="transition-transform duration-700 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300"></div>
                      {item.soldOut && (
                        <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium shadow-lg">
                          SOLD OUT
                        </div>
                      )}
                    </div>
                  )}

                  <div className="p-6">
                    <h2 className={`${cormorant.className} text-2xl font-medium mb-3 text-brown group-hover:text-olive transition-colors duration-300`}>
                      {item.title}
                    </h2>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className={`${lora.className} text-sm text-warm-gray mb-1`}>
                          Multiple print options available · Free shipping
                        </p>
                        <p className={`${lora.className} text-lg font-medium text-brown`}>
                          Starting at {formatRoundedDollars(15)}
                        </p>
                      </div>

                      {!item.soldOut && (
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <span className="text-olive text-sm font-medium">View Options →</span>
                        </div>
                      )}
                    </div>

                    {item.soldOut && (
                      <div className="mt-2">
                        <span className="text-red-600 font-medium text-sm">
                          Currently unavailable
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
