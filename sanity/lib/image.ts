import createImageUrlBuilder from '@sanity/image-url'
import type { ImageLoaderProps } from "next/image";
import type { SanityImageSource } from "@sanity/image-url/lib/types/types";

import { dataset, projectId } from '../env'

// https://www.sanity.io/docs/image-url
const builder = createImageUrlBuilder({ projectId, dataset })
const SANITY_IMAGE_REF_PATTERN = /^image-([^-]+)-(\d+)x(\d+)-([a-z0-9]+)$/i

export const urlFor = (source: SanityImageSource) => {
  return builder.image(source)
}

function getAssetRef(source: unknown) {
  if (!source || typeof source !== 'object' || !('asset' in source)) return undefined

  const asset = (source as { asset?: unknown }).asset
  if (!asset || typeof asset !== 'object' || !('_ref' in asset)) return undefined

  const ref = (asset as { _ref?: unknown })._ref
  return typeof ref === 'string' ? ref : undefined
}

export function getImageAssetDimensions(source: SanityImageSource) {
  const ref = getAssetRef(source)
  const match = ref?.match(SANITY_IMAGE_REF_PATTERN)
  if (!match) return undefined

  const width = Number(match[2])
  const height = Number(match[3])
  const crop = typeof source === 'object' && 'crop' in source ? source.crop : undefined
  if (!crop) return { width, height }

  return {
    width: Math.round(width * (1 - crop.left - crop.right)),
    height: Math.round(height * (1 - crop.top - crop.bottom)),
  }
}

// Keep the Studio crop already present in src. Let the browser pick the width
// and Sanity encode it once in a format supported by that browser.
export function sanityImageLoader({ src, width, quality }: ImageLoaderProps) {
  const url = new URL(src);
  url.searchParams.set('w', String(width));
  url.searchParams.set('q', String(quality ?? 90));
  url.searchParams.set('fit', 'max');
  url.searchParams.set('auto', 'format');
  return url.href;
}
