// components/CollectionsClient.tsx
'use client';

import Image from 'next/image';
import { useState } from 'react';
import { cormorant, lora } from "../fonts";
import { bestQualityImageUrl } from '../../sanity/lib/image';
import type { ArtPiece } from './Collections';

type CollectionsClientProps = {
  artPieces: ArtPiece[];
};

const GALLERY_IMAGE_WIDTH = 2200;
const GALLERY_MODAL_IMAGE_WIDTH = 4200;
const GALLERY_IMAGE_QUALITY = 100;

function getImageDimensions(piece: ArtPiece) {
  const match = piece.mainImage?.asset?._ref?.match(/-(\d+)x(\d+)-/);
  const width = match ? Number(match[1]) : 1200;
  const height = match ? Number(match[2]) : 1200;

  return {
    width: Number.isFinite(width) && width > 0 ? width : 1200,
    height: Number.isFinite(height) && height > 0 ? height : 1200,
  };
}

export default function CollectionsClient({ artPieces }: CollectionsClientProps) {
  const [selectedImage, setSelectedImage] = useState<ArtPiece | null>(null);

  // Used to center only the final row in a 3-col grid
  const remainder = artPieces.length % 3;

  const handleImageClick = (piece: ArtPiece) => {
    setSelectedImage(piece);
  };

  const handleCloseModal = () => {
    setSelectedImage(null);
  };

  return (
    <section id="gallery" className="max-w-7xl mx-auto py-16 px-0 bg-ivory sm:px-4">
  <h2 className={`${cormorant.className} px-4 text-3xl md:text-4xl font-light text-brown mb-8 text-center sm:px-0`}>
        Gallery
      </h2>
  <div className="grid grid-cols-1 sm:grid-cols-6 gap-8">
        {artPieces.length > 0 ? (
          artPieces.map((piece, idx) => {
            const lastIdx = artPieces.length - 1;
            let positionClass = '';
            if (remainder === 1 && idx === lastIdx) {
              // Single item on last row -> center over columns 3-4 (since each card spans 2 cols)
              positionClass = 'sm:col-start-3';
            } else if (remainder === 2) {
              // Two items on last row -> center them as cols 2-3 and 4-5
              if (idx === lastIdx - 1) positionClass = 'sm:col-start-2';
              if (idx === lastIdx) positionClass = 'sm:col-start-4';
            }
            return (
              <div 
                key={piece._id} 
                className={`artwork-frame group cursor-pointer sm:col-span-2 ${positionClass}`}
                onClick={() => handleImageClick(piece)}
              >
              {piece.mainImage?.asset && (
                <Image
                  src={bestQualityImageUrl(piece.mainImage, GALLERY_IMAGE_WIDTH, GALLERY_IMAGE_QUALITY)}
                  alt={piece.title || 'Gallery image'}
                  width={getImageDimensions(piece).width}
                  height={getImageDimensions(piece).height}
                  quality={GALLERY_IMAGE_QUALITY}
                  unoptimized
                  className="artwork-image h-auto w-full"
                  sizes="(min-width: 1024px) 30vw, (min-width: 640px) 44vw, 100vw"
                />
              )}
              {/* Title removed per request; images only */}
            </div>
            );
          })
        ) : (
          <p className={`${lora.className} col-span-full px-4 text-center text-brown sm:px-0`}>
            No art pieces found.
          </p>
        )}
      </div>

      {/* Modal for enlarged image */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4"
          onClick={handleCloseModal}
        >
          <div
            className="relative inline-block"
            onClick={(event) => event.stopPropagation()}
          >
            <button 
              className="absolute right-3 top-3 z-50 flex h-10 w-10 items-center justify-center bg-ivory/90 text-brown shadow-sm transition-colors duration-200 hover:bg-paper focus:outline-none focus:ring-2 focus:ring-olive/50"
              onClick={handleCloseModal}
              aria-label="Close"
              type="button"
            >
              <span className="sr-only">Close</span>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path fillRule="evenodd" d="M5.47 5.47a.75.75 0 0 1 1.06 0L12 10.94l5.47-5.47a.75.75 0 1 1 1.06 1.06L13.06 12l5.47 5.47a.75.75 0 1 1-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 0 1-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
              </svg>
            </button>
            {selectedImage.mainImage?.asset && (
              <Image
                src={bestQualityImageUrl(
                  selectedImage.mainImage,
                  GALLERY_MODAL_IMAGE_WIDTH,
                  GALLERY_IMAGE_QUALITY
                )}
                alt={selectedImage.title || 'Gallery image enlarged'}
                width={getImageDimensions(selectedImage).width}
                height={getImageDimensions(selectedImage).height}
                quality={GALLERY_IMAGE_QUALITY}
                unoptimized
                className="block h-auto max-h-[88vh] w-auto max-w-[92vw] object-contain"
              />
            )}
          </div>
        </div>
      )}
    </section>
  );
}
