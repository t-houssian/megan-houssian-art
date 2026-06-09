import createImageUrlBuilder from '@sanity/image-url'
import { SanityImageSource } from "@sanity/image-url/lib/types/types";

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

export function getOriginalImageUrl(source: SanityImageSource) {
  const ref = getAssetRef(source)
  const match = ref?.match(SANITY_IMAGE_REF_PATTERN)
  if (!match) return undefined

  const [, assetId, width, height, extension] = match
  return `https://cdn.sanity.io/images/${projectId}/${dataset}/${assetId}-${width}x${height}.${extension}`
}

export function getImageAssetDimensions(source: SanityImageSource) {
  const ref = getAssetRef(source)
  const match = ref?.match(SANITY_IMAGE_REF_PATTERN)
  if (!match) return undefined

  return {
    width: Number(match[2]),
    height: Number(match[3]),
  }
}

export function bestQualityImageUrl(source: SanityImageSource, width: number, quality = 100) {
  const originalUrl = getOriginalImageUrl(source)
  const dimensions = getImageAssetDimensions(source)

  if (originalUrl && dimensions && dimensions.width <= width) {
    return originalUrl
  }

  return urlFor(source).width(width).fit('max').quality(quality).url()
}
