import { sanityClient } from '../../lib/sanity';
import ImageUrlBuilder from '@sanity/image-url';
import Link from 'next/link';
import Image from 'next/image';
import { cormorant, lora } from '../fonts';
import { formatRoundedDollars } from '../../lib/money';

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

function getImageDimensions(image?: { asset: { _ref: string } }) {
  const match = image?.asset?._ref?.match(/-(\d+)x(\d+)-/);
  const width = match ? Number(match[1]) : 1200;
  const height = match ? Number(match[2]) : 1500;

  return {
    width: Number.isFinite(width) && width > 0 ? width : 1200,
    height: Number.isFinite(height) && height > 0 ? height : 1500,
  };
}

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
  const prints = await fetchPrints();

  return (
    <section className="min-h-screen bg-ivory">
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
                <div>
                  {item.mainImage?.asset && (
                    <div className="relative w-full overflow-hidden bg-ivory">
                      <Image
                        src={urlFor(item.mainImage).width(1200).fit('max').quality(92).url()}
                        alt={item.title}
                        width={getImageDimensions(item.mainImage).width}
                        height={getImageDimensions(item.mainImage).height}
                        className="h-auto w-full object-contain"
                        sizes="(min-width: 1280px) 28vw, (min-width: 640px) 44vw, 92vw"
                      />
                      {item.soldOut && (
                        <div className={`${lora.className} absolute left-0 top-0 bg-ivory/90 pr-4 pb-2 text-xs font-semibold uppercase tracking-[0.2em] text-warm-gray`}>
                          SOLD OUT
                        </div>
                      )}
                    </div>
                  )}

                  <div className="pt-4">
                    <h2 className={`${cormorant.className} text-2xl font-medium mb-3 text-brown`}>
                      {item.title}
                    </h2>

                    <div className="flex items-end justify-between gap-4">
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
