"use client";
import React, { useState } from "react";
import Image from "next/image";
import ImageUrlBuilder from "@sanity/image-url";
import { sanityClient } from "../../lib/sanity"; // Adjust the path as needed

const builder = ImageUrlBuilder(sanityClient);
function urlFor(source: { asset: { _ref: string } }) {
  return builder.image(source);
}

type GalleryImage = {
  asset: { _ref: string };
};

type ArtworkGalleryProps = {
  mainImage?: GalleryImage;
  gallery?: GalleryImage[];
  title: string;
};

export default function ArtworkGallery({ mainImage, gallery, title }: ArtworkGalleryProps) {
  // Combine the main image and additional gallery images into one array.
  const images: GalleryImage[] = mainImage ? [mainImage, ...(gallery || [])] : (gallery || []);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const selectedImage = images[selectedIndex];

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const prevImage = (e?: React.MouseEvent) => {
    e?.stopPropagation(); // Prevent triggering openModal
    setSelectedIndex((prevIndex) => (prevIndex > 0 ? prevIndex - 1 : images.length - 1));
  };

  const nextImage = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setSelectedIndex((prevIndex) => (prevIndex < images.length - 1 ? prevIndex + 1 : 0));
  };

  return (
    <div className="space-y-6">
      {/* Main image */}
      <div
        className="relative w-full cursor-pointer overflow-hidden bg-ivory min-h-[420px] sm:min-h-[560px] lg:min-h-[720px]"
        onClick={openModal}
      >
        <div className="absolute inset-0">
          {selectedImage && (
            <Image
              src={urlFor(selectedImage).width(1600).fit("max").quality(90).url()}
              alt={`${title} image ${selectedIndex + 1}`}
              fill
              className="object-contain"
              sizes="(min-width: 1280px) 40vw, (min-width: 1024px) 45vw, (min-width: 768px) 60vw, 90vw"
              priority
            />
          )}
        </div>
      </div>

      {/* Gallery navigation */}
      {images.length > 1 && (
        <div className="flex justify-center gap-4">
          <button
            onClick={() => prevImage()}
            className="inline-flex items-center gap-2 border-b border-tan/70 px-2 py-1 text-sm font-medium text-brown hover:border-olive hover:text-olive transition"
            aria-label="Previous image"
            type="button"
          >
            ❮
            <span className="hidden sm:inline">Previous</span>
          </button>
          <button
            onClick={() => nextImage()}
            className="inline-flex items-center gap-2 border-b border-tan/70 px-2 py-1 text-sm font-medium text-brown hover:border-olive hover:text-olive transition"
            aria-label="Next image"
            type="button"
          >
            <span className="hidden sm:inline">Next</span>
            ❯
          </button>
        </div>
      )}

      {/* Thumbnails */}
      <div className="flex gap-3 mt-6 overflow-x-auto pb-1">
        {images.map((img, index) => (
          <div
            key={index}
            className={`relative w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0 cursor-pointer border-b-2 transition ${
              index === selectedIndex ? "border-olive" : "border-transparent opacity-70 hover:opacity-100"
            } bg-ivory`}
            onClick={() => setSelectedIndex(index)}
          >
            <Image
              src={urlFor(img).width(400).fit("max").quality(80).url()}
              alt={`${title} thumbnail ${index + 1}`}
              fill
              className="object-contain"
            />
          </div>
        ))}
      </div>

      {/* Modal for enlarged view */}
      {isModalOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
          onClick={closeModal}
        >
          <div className="relative w-full max-w-3xl h-full max-h-screen" onClick={(e) => e.stopPropagation()}>
            {selectedImage && (
              <Image
                src={urlFor(selectedImage).width(2400).fit("max").quality(95).url()}
                alt={`${title} enlarged image`}
                fill
                className="object-contain"
                />
            )}
            {/* Left and Right Navigation Arrows in modal */}
            <button
              onClick={prevImage}
              className="absolute top-1/2 left-4 transform -translate-y-1/2 text-white text-3xl z-10"
            >
              ❮
            </button>
            <button
              onClick={nextImage}
              className="absolute top-1/2 right-4 transform -translate-y-1/2 text-white text-3xl z-10"
            >
              ❯
            </button>
            {/* Close Button */}
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 text-white text-2xl z-10"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
