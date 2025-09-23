// components/CollectionsClient.tsx
'use client';

import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { cormorant, lora } from "../fonts";
import { ArtPiece, urlFor } from './Collections';

type CollectionsClientProps = {
  artPieces: ArtPiece[];
};

export default function CollectionsClient({ artPieces }: CollectionsClientProps) {
  const [selectedImage, setSelectedImage] = useState<ArtPiece | null>(null);
  const PAGE_SIZE = 15;

  // Pagination state with URL sync (?g=<page>)
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const initialPage = Math.max(1, Number(searchParams.get('g') || '1'));
  const [currentPage, setCurrentPage] = useState<number>(initialPage);

  useEffect(() => {
    // Keep URL in sync without scrolling
    const params = new URLSearchParams(searchParams?.toString());
    if (currentPage > 1) {
      params.set('g', String(currentPage));
    } else {
      params.delete('g');
    }
    router.replace(`${pathname}?${params.toString()}#gallery`, { scroll: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  const totalPages = Math.max(1, Math.ceil((artPieces?.length || 0) / PAGE_SIZE));
  const pagedPieces = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return (artPieces || []).slice(start, start + PAGE_SIZE);
  }, [artPieces, currentPage]);

  // Used to center only the final row in a 3-col grid
  const remainder = pagedPieces.length % 3;

  const handleImageClick = (piece: ArtPiece) => {
    setSelectedImage(piece);
  };

  const handleCloseModal = () => {
    setSelectedImage(null);
  };

  return (
    <section id="gallery" className="max-w-7xl mx-auto py-16 px-4 bg-ivory">
  <h2 className={`${cormorant.className} text-3xl md:text-4xl font-light text-brown mb-8 text-center`}>
        Gallery
      </h2>
  <div className="grid grid-cols-1 sm:grid-cols-6 gap-8">
        {pagedPieces && pagedPieces.length > 0 ? (
          pagedPieces.map((piece, idx) => {
            const lastIdx = pagedPieces.length - 1;
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
                className={`group overflow-hidden rounded-sm shadow-md hover:shadow-lg transition-shadow duration-200 cursor-pointer border border-tan bg-paper sm:col-span-2 ${positionClass}`}
                onClick={() => handleImageClick(piece)}
              >
              {piece.mainImage?.asset && (
                <div className="relative w-full aspect-square bg-paper">
                  <Image
                    src={urlFor(piece.mainImage).width(800).fit('max').url()}
                    alt={piece.title || 'Gallery image'}
                    fill
                    style={{ 
                      objectFit: 'contain',
                      objectPosition: 'center'
                    }}
                    className="transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
              )}
              {/* Title removed per request; images only */}
            </div>
            );
          })
        ) : (
          <p className={`${lora.className} col-span-full text-center text-brown`}>
            No art pieces found.
          </p>
        )}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="mt-10 flex items-center justify-center gap-4">
          <button
            type="button"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className={`px-4 py-2 rounded-lg border text-sm ${lora.className} transition-colors
                       ${currentPage === 1 ? 'border-tan/40 text-warm-gray/60 bg-white/40 cursor-not-allowed' : 'border-tan text-brown hover:bg-olive/10 hover:border-olive/60'}`}
            aria-label="Previous page"
          >
            ← Previous
          </button>
          <span className={`${lora.className} text-warm-gray text-sm`}>
            Page <span className="text-brown font-medium">{currentPage}</span> of <span className="text-brown font-medium">{totalPages}</span>
          </span>
          <button
            type="button"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className={`px-4 py-2 rounded-lg border text-sm ${lora.className} transition-colors
                       ${currentPage === totalPages ? 'border-tan/40 text-warm-gray/60 bg-white/40 cursor-not-allowed' : 'border-tan text-brown hover:bg-olive/10 hover:border-olive/60'}`}
            aria-label="Next page"
          >
            Next →
          </button>
        </div>
      )}

      {/* Modal for enlarged image */}
      {selectedImage && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-75 z-50">
          <div className="relative max-w-3xl w-full p-4">
            <button 
              className="absolute top-4 right-4 z-50 w-10 h-10 rounded-full flex items-center justify-center 
                         bg-tan/80 text-brown hover:bg-tan focus:outline-none focus:ring-2 focus:ring-olive/50 
                         transition-colors"
              onClick={handleCloseModal}
              aria-label="Close"
            >
              <span className="sr-only">Close</span>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path fillRule="evenodd" d="M5.47 5.47a.75.75 0 0 1 1.06 0L12 10.94l5.47-5.47a.75.75 0 1 1 1.06 1.06L13.06 12l5.47 5.47a.75.75 0 1 1-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 0 1-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
              </svg>
            </button>
            <div className="relative w-full h-[80vh] bg-paper rounded border border-tan">
              {selectedImage.mainImage?.asset && (
                <Image
                  src={urlFor(selectedImage.mainImage).width(1200).fit('max').url()}
                  alt={selectedImage.title || 'Gallery image enlarged'}
                  fill
                  style={{ 
                    objectFit: 'contain',
                    objectPosition: 'center'
                  }}
                  className="rounded"
                />
              )}
            </div>
            {/* Title removed per request */}
          </div>
        </div>
      )}
    </section>
  );
}
