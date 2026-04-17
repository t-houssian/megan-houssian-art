import Image from 'next/image';
import Link from 'next/link';
import { formatCurrency } from '../../lib/money';
import type { OriginalArtworkSummary } from '../../lib/originals';
import { urlFor } from '../../sanity/lib/image';
import { cormorant, lora } from '../fonts';

type SanityImage = {
  asset: { _ref: string };
};

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

function getImageDimensions(image?: SanityImage) {
  const match = image?.asset?._ref?.match(/-(\d+)x(\d+)-/);
  const width = match ? Number(match[1]) : 1200;
  const height = match ? Number(match[2]) : 1500;

  return {
    width: Number.isFinite(width) && width > 0 ? width : 1200,
    height: Number.isFinite(height) && height > 0 ? height : 1500,
  };
}

export default function OriginalArtworkCard({
  item,
  detailHref,
}: OriginalArtworkCardProps) {
  const mainDimensions = getImageDimensions(item.mainImage);
  const hoverImage = item.hoverImage?.asset ? item.hoverImage : null;

  return (
    <article className="group h-full">
      <div className="h-full">
        {item.mainImage?.asset && (
          <Link href={detailHref} className="block">
            <div
              className="relative w-full overflow-hidden bg-ivory"
              style={{ aspectRatio: `${mainDimensions.width} / ${mainDimensions.height}` }}
            >
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
              {item.sold && (
                <div className={`${lora.className} absolute left-0 top-0 bg-ivory/90 pr-4 pb-2 text-xs font-semibold uppercase tracking-[0.2em] text-warm-gray`}>
                  Sold
                </div>
              )}
            </div>
          </Link>
        )}

        <div className="flex min-h-36 flex-col pt-4">
          <Link href={detailHref} className="block">
            <h2 className={`${cormorant.className} text-2xl font-medium mb-3 text-brown`}>
              {item.title}
            </h2>
          </Link>

          <div className="flex items-end justify-between gap-4 pt-1">
            <div>
              <p className={`${lora.className} text-sm text-warm-gray mb-1`}>
                {item.artworkSize || 'Size available on request'}
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
