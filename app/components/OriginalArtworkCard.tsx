'use client';

import { useState } from 'react';
import ArtworkImage from './ArtworkImage';
import Link from 'next/link';
import { formatCurrency } from '../../lib/money';
import type { OriginalArtworkSummary } from '../../lib/originals';
import { getImageAssetDimensions, urlFor } from '../../sanity/lib/image';
import { cormorant, lora } from '../fonts';

type OriginalArtworkCardProps = {
  item: OriginalArtworkSummary;
  detailHref: string;
  preload?: boolean;
};

const CARD_SIZES = '(min-width: 1280px) 390px, (min-width: 1024px) calc((100vw - 112px) / 3), (min-width: 640px) calc((100vw - 80px) / 2), 100vw';

function formatPrice(price?: number) {
  if (!Number.isFinite(price) || !price || price <= 0) {
    return 'Price available on request';
  }

  return formatCurrency(price);
}

export default function OriginalArtworkCard({
  item,
  detailHref,
  preload,
}: OriginalArtworkCardProps) {
  const [loadAlternate, setLoadAlternate] = useState(false);
  const [alternateReady, setAlternateReady] = useState(false);
  const hoverImage = item.hoverImage?.asset ? item.hoverImage : null;
  const imageDimensions = item.mainImage?.asset ? getImageAssetDimensions(item.mainImage) : undefined;
  const titleWithSize = item.artworkSize ? `${item.title}, ${item.artworkSize}` : item.title;

  return (
    <Link
      href={detailHref}
      className="group block h-full"
      onPointerEnter={(event) => {
        if (event.pointerType === 'mouse' && window.matchMedia('(min-width: 768px)').matches) {
          setLoadAlternate(true);
        }
      }}
      onFocus={(event) => {
        if (event.currentTarget.matches(':focus-visible') && window.matchMedia('(min-width: 768px)').matches) {
          setLoadAlternate(true);
        }
      }}
    >
      <article className="h-full">
        {item.mainImage?.asset && (
          <div className="artwork-frame relative w-full bg-ivory sm:flex sm:h-96 sm:items-center sm:justify-center lg:h-[26rem]">
            <ArtworkImage
              src={urlFor(item.mainImage).url()}
              alt={item.title}
              width={imageDimensions?.width ?? 1200}
              height={imageDimensions?.height ?? 1200}
              preload={preload}
              className="artwork-image h-auto w-full sm:h-full sm:object-contain"
              sizes={CARD_SIZES}
            />
            {hoverImage && loadAlternate && (
              <ArtworkImage
                src={urlFor(hoverImage).url()}
                alt={`${item.title} alternate view`}
                fill
                loading="eager"
                onLoad={() => setAlternateReady(true)}
                className={`hidden bg-ivory object-contain opacity-0 transition-opacity duration-300 md:block ${
                  alternateReady ? 'md:group-hover:opacity-100 md:group-focus-visible:opacity-100' : ''
                }`}
                sizes={CARD_SIZES}
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
