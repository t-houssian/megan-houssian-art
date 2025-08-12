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
        Collections
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
                    alt={piece.title}
                    fill
                    style={{ 
                      objectFit: 'contain',
                      objectPosition: 'center'
                    }}
                    className="transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
              )}
              <h3 className={`${lora.className} text-lg font-semibold mt-4 text-brown px-4 pb-4`}>
                {piece.title}
              </h3>
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
              className="absolute top-4 right-4 text-white text-4xl font-bold z-50 bg-brown bg-opacity-75 hover:bg-opacity-90 rounded-full w-10 h-10 flex items-center justify-center transition-colors"
              onClick={handleCloseModal}
              aria-label="Close"
            >
              &times;
            </button>
            <div className="relative w-full h-[80vh] bg-paper rounded border border-tan">
              {selectedImage.mainImage?.asset && (
                <Image
                  src={urlFor(selectedImage.mainImage).width(1200).fit('max').url()}
                  alt={selectedImage.title}
                  fill
                  style={{ 
                    objectFit: 'contain',
                    objectPosition: 'center'
                  }}
                  className="rounded"
                />
              )}
            </div>
            <h3 className={`${cormorant.className} text-center text-paper mt-4 text-xl`}>{selectedImage.title}</h3>
          </div>
        </div>
      )}
    </section>
  );
}
