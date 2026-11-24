'use client';

import Image, { type ImageProps } from 'next/image';
import { sanityImageLoader, urlFor } from '../../sanity/lib/image';
import type { SanityImageSource } from '@sanity/image-url/lib/types/types';

type ArtworkImageProps = Omit<ImageProps, 'loader' | 'src'> & { src: string };

export default function ArtworkImage({ src, quality = 95, alt, ...props }: ArtworkImageProps) {
  return (
    <Image
      {...props}
      src={src}
      alt={alt}
      quality={quality}
      loader={src.startsWith('/') ? undefined : sanityImageLoader}
    />
  );
}

// The responsive preview stays visible while the visitor's enlargement loads.
export function ArtworkEnlargement({ image }: { image: SanityImageSource }) {
  return (
    <Image
      src={urlFor(image).width(4200).fit('max').quality(95).auto('format').url()}
      alt=""
      fill
      loading="eager"
      unoptimized
      draggable={false}
      className="pointer-events-none select-none object-contain"
    />
  );
}
