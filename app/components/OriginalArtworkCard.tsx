import Image from 'next/image';
import Link from 'next/link';
import { formatCurrency } from '../../lib/money';
import type { OriginalArtworkSummary } from '../../lib/originals';
import { bestQualityImageUrl, getImageAssetDimensions } from '../../sanity/lib/image';
import { cormorant, lora } from '../fonts';

type OriginalArtworkCardProps = {
  item: OriginalArtworkSummary;
  detailHref: string;
};

const CARD_IMAGE_WIDTH = 2400;
const CARD_IMAGE_QUALITY = 100;

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
  const imageDimensions = item.mainImage?.asset ? getImageAssetDimensions(item.mainImage) : undefined;
  const titleWithSize = item.artworkSize ? `${item.title}, ${item.artworkSize}` : item.title;

  return (
    <Link href={detailHref} className="group block h-full">
      <article className="h-full">
        {item.mainImage?.asset && (
          <div className="artwork-frame relative w-full bg-ivory sm:flex sm:h-96 sm:items-center sm:justify-center lg:h-[26rem]">
            <Image
              src={bestQualityImageUrl(item.mainImage, CARD_IMAGE_WIDTH, CARD_IMAGE_QUALITY)}
              alt={item.title}
              width={imageDimensions?.width ?? CARD_IMAGE_WIDTH}
              height={imageDimensions?.height ?? CARD_IMAGE_WIDTH}
              quality={CARD_IMAGE_QUALITY}
              unoptimized
              className={`artwork-image h-auto w-full transition-opacity duration-300 sm:h-full sm:object-contain ${
                hoverImage ? 'md:group-hover:opacity-0' : ''
              }`}
              sizes="(min-width: 1280px) 28vw, (min-width: 640px) 44vw, 100vw"
            />
            {hoverImage && (
              <Image
                src={bestQualityImageUrl(hoverImage, CARD_IMAGE_WIDTH, CARD_IMAGE_QUALITY)}
                alt={`${item.title} alternate view`}
                fill
                quality={CARD_IMAGE_QUALITY}
                unoptimized
                className="hidden object-contain opacity-0 transition-opacity duration-300 md:block md:group-hover:opacity-100"
                sizes="(min-width: 1280px) 28vw, (min-width: 640px) 44vw, 100vw"
              />
            )}
          </div>
        )}

        <div className="flex min-h-36 flex-col px-6 pt-4 sm:px-0">
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

          <p className={`${lora.className} pt-1 text-lg font-medium text-brown`}>
            {formatPrice(item.price)}
          </p>
        </div>
      </article>
    </Link>
  );
}
