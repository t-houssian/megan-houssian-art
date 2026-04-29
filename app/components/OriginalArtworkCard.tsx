import Image from 'next/image';
import Link from 'next/link';
import { formatCurrency } from '../../lib/money';
import type { OriginalArtworkSummary } from '../../lib/originals';
import { urlFor } from '../../sanity/lib/image';
import { cormorant, lora } from '../fonts';

type OriginalArtworkCardProps = {
  item: OriginalArtworkSummary;
  detailHref: string;
};

function formatPrice(price?: number) {
  if (!Number.isFinite(price) || !price || price <= 0) {
    return 'Price available on request';
  }

  return formatCurrency(price);
}

export default function OriginalArtworkCard({
  item,
  detailHref,
}: OriginalArtworkCardProps) {
  const hoverImage = item.hoverImage?.asset ? item.hoverImage : null;
  const titleWithSize = item.artworkSize ? `${item.title}, ${item.artworkSize}` : item.title;

  return (
    <Link href={detailHref} className="group block h-full">
      <article className="h-full">
        {item.mainImage?.asset && (
          <div className="relative flex h-80 w-full items-center justify-center overflow-hidden bg-ivory sm:h-96 lg:h-[26rem]">
            <Image
              src={urlFor(item.mainImage).width(1200).fit('max').quality(92).url()}
              alt={item.title}
              fill
              className={`object-contain transition-opacity duration-300 ${
                hoverImage ? 'md:group-hover:opacity-0' : ''
              }`}
              sizes="(min-width: 1280px) 28vw, (min-width: 640px) 44vw, 92vw"
            />
            {hoverImage && (
              <Image
                src={urlFor(hoverImage).width(1200).fit('max').quality(92).url()}
                alt={`${item.title} alternate view`}
                fill
                className="hidden object-contain opacity-0 transition-opacity duration-300 md:block md:group-hover:opacity-100"
                sizes="(min-width: 1280px) 28vw, (min-width: 640px) 44vw, 92vw"
              />
            )}
          </div>
        )}

        <div className="flex min-h-36 flex-col pt-4">
          <div className="mb-3 flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h2 className={`${cormorant.className} text-2xl font-medium text-brown`}>
                {titleWithSize}
              </h2>
            </div>
            {item.sold && (
              <span className={`${cormorant.className} shrink-0 text-2xl font-medium text-warm-gray`}>
                Sold
              </span>
            )}
          </div>

          <div className="flex items-end justify-between gap-4 pt-1">
            <div>
              <p className={`${lora.className} text-lg font-medium text-brown`}>
                {formatPrice(item.price)}
              </p>
            </div>

            <span
              className={`${lora.className} shrink-0 text-sm font-medium text-olive opacity-100 transition-opacity duration-300 md:opacity-0 md:group-hover:opacity-100`}
            >
              View piece
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}
