// components/CollectionsClient.tsx
'use client';

import ArtworkImage, { ArtworkEnlargement } from './ArtworkImage';
import { useState } from 'react';
import { cormorant, lora } from "../fonts";
import { getImageAssetDimensions, urlFor } from '../../sanity/lib/image';
import type { ArtPiece } from './Collections';

type CollectionsClientProps = {
  artPieces: ArtPiece[];
};

const GALLERY_SIZES = '(min-width: 1280px) 395px, (min-width: 640px) calc((100vw - 96px) / 3), 100vw';

export default function CollectionsClient({ artPieces }: CollectionsClientProps) {
  const [selectedImage, setSelectedImage] = useState<ArtPiece | null>(null);

  const selectedDimensions = selectedImage?.mainImage?.asset && getImageAssetDimensions(selectedImage.mainImage);

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
            const dimensions = piece.mainImage?.asset && getImageAssetDimensions(piece.mainImage);
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
                <ArtworkImage
                  src={urlFor(piece.mainImage).url()}
                  alt={piece.title || 'Gallery image'}
                  width={dimensions?.width ?? 1200}
                  height={dimensions?.height ?? 1200}
                  className="artwork-image h-auto w-full"
                  sizes={GALLERY_SIZES}
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
            className="relative max-w-[92vw]"
            style={selectedDimensions && {
              width: `min(${selectedDimensions.width}px, ${88 * selectedDimensions.width / selectedDimensions.height}vh)`,
            }}
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
              <>
                <ArtworkImage
                  src={urlFor(selectedImage.mainImage).url()}
                  alt={selectedImage.title || 'Gallery image enlarged'}
                  width={selectedDimensions?.width ?? 1200}
                  height={selectedDimensions?.height ?? 1200}
                  sizes={GALLERY_SIZES}
                  className="block h-auto max-h-[88vh] w-full object-contain"
                />
                <ArtworkEnlargement image={selectedImage.mainImage} />
              </>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
