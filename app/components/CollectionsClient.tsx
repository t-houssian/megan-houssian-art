// components/CollectionsClient.tsx
'use client';

import Image from 'next/image';
import { useState } from 'react';
import { cormorant, lora } from "../fonts";
import { ArtPiece, urlFor } from './Collections';

type CollectionsClientProps = {
  artPieces: ArtPiece[];
};

export default function CollectionsClient({ artPieces }: CollectionsClientProps) {
  const [selectedImage, setSelectedImage] = useState<ArtPiece | null>(null);

  const handleImageClick = (piece: ArtPiece) => {
    setSelectedImage(piece);
  };

  const handleCloseModal = () => {
    setSelectedImage(null);
  };

  return (
    <section id="gallery" className="max-w-7xl mx-auto py-16 px-4 bg-ivory">
      <h2 className={`${cormorant.className} text-3xl md:text-4xl font-bold text-brown mb-8 text-center`}>
        Gallery
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
        {artPieces && artPieces.length > 0 ? (
          artPieces.map((piece) => (
            <div 
              key={piece._id} 
              className="group overflow-hidden rounded-sm shadow-md hover:shadow-lg transition-shadow duration-200 cursor-pointer border border-tan bg-paper"
              onClick={() => handleImageClick(piece)}
            >
              {piece.mainImage?.asset && (
                <div className="relative w-full aspect-square bg-paper">
                  <Image
                    src={urlFor(piece.mainImage).width(800).fit('max').url()}
                    alt={"Gallery image"}
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
          ))
        ) : (
          <p className={`${lora.className} col-span-full text-center text-brown`}>
            No art pieces found.
          </p>
        )}
      </div>

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
                  alt={"Gallery image enlarged"}
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
