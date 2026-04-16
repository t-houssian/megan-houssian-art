import Image from 'next/image';
import Link from 'next/link';
import type { OriginalArtworkSummary } from '../../lib/originals';
import { urlFor } from '../../sanity/lib/image';
import { cormorant, lora } from '../fonts';

type OriginalArtworkCardProps = {
  item: OriginalArtworkSummary;
  detailHref: string;
  collectionHref: (slug: string) => string;
};

function formatPrice(price?: number) {
  if (!Number.isFinite(price) || !price || price <= 0) {
    return 'Price available on request';
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(price);
}

export default function OriginalArtworkCard({
  item,
  detailHref,
  collectionHref,
}: OriginalArtworkCardProps) {
  const collections = item.collections ?? [];

  return (
    <article className="group h-full">
      <div className="h-full bg-white/80 backdrop-blur-sm border border-tan/30 overflow-hidden shadow-vintage hover:shadow-vintage-lg transition-all duration-500 transform hover:-translate-y-2">
        {item.mainImage?.asset && (
          <Link href={detailHref} className="block">
            <div className="relative w-full h-80 overflow-hidden bg-paper">
              <Image
                src={urlFor(item.mainImage).width(900).height(1100).fit('crop').url()}
                alt={item.title}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                sizes="(min-width: 1280px) 28vw, (min-width: 640px) 44vw, 92vw"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
              {item.sold && (
                <div className="absolute top-4 left-4 rounded-full bg-paper/95 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-brown shadow-vintage">
                  Sold
                </div>
              )}
            </div>
          </Link>
        )}

        <div className="flex h-[calc(100%-20rem)] min-h-56 flex-col p-6">
          <Link href={detailHref} className="block">
            <h2 className={`${cormorant.className} text-2xl font-medium mb-3 text-brown group-hover:text-olive transition-colors duration-300`}>
              {item.title}
            </h2>
          </Link>

          {collections.length > 0 && (
            <div className="mb-4">
              <p className={`${lora.className} text-xs uppercase tracking-[0.18em] text-warm-gray mb-1`}>
                Part of
              </p>
              <div className="flex flex-wrap gap-x-3 gap-y-1">
                {collections.map((collection) => (
                  <Link
                    key={collection._id}
                    href={collectionHref(collection.slug.current)}
                    className={`${lora.className} text-sm font-medium text-olive underline underline-offset-4 hover:text-brown transition-colors duration-200`}
                  >
                    {collection.title}
                  </Link>
                ))}
              </div>
            </div>
          )}

          <div className="mt-auto flex items-end justify-between gap-4">
            <div>
              <p className={`${lora.className} text-sm text-warm-gray mb-1`}>
                {item.sold ? 'Previously collected' : 'Original artwork · Free shipping'}
              </p>
              <p className={`${lora.className} text-lg font-medium text-brown`}>
                {item.sold ? 'Unavailable' : formatPrice(item.price)}
              </p>
            </div>

            <Link
              href={detailHref}
              className={`${lora.className} shrink-0 text-sm font-medium text-olive opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
            >
              View piece
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
