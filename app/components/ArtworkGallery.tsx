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

function getImageDimensions(image?: GalleryImage) {
  const match = image?.asset?._ref?.match(/-(\d+)x(\d+)-/);
  const width = match ? Number(match[1]) : 1200;
  const height = match ? Number(match[2]) : 1500;

  return {
    width: Number.isFinite(width) && width > 0 ? width : 1200,
    height: Number.isFinite(height) && height > 0 ? height : 1500,
  };
}

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
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  const selectedImage = images[selectedIndex];
  const selectedDimensions = getImageDimensions(selectedImage);

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

  const handleTouchEnd = (touchEndX: number) => {
    if (touchStartX === null || images.length < 2) return;

    const distance = touchStartX - touchEndX;
    if (Math.abs(distance) > 40) {
      if (distance > 0) {
        nextImage();
      } else {
        prevImage();
      }
    }

    setTouchStartX(null);
  };

  return (
    <div className="space-y-6">
      {/* Main image */}
      <div
        className="relative w-full cursor-pointer overflow-hidden bg-ivory min-h-[420px] sm:min-h-[560px] lg:min-h-[720px]"
        onClick={openModal}
        onTouchStart={(event) => setTouchStartX(event.touches[0]?.clientX ?? null)}
        onTouchEnd={(event) => handleTouchEnd(event.changedTouches[0]?.clientX ?? 0)}
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
        <div className="hidden justify-center gap-4 md:flex">
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
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4"
          onClick={closeModal}
        >
          <div
            className="relative inline-block"
            onClick={(event) => event.stopPropagation()}
            onTouchStart={(event) => setTouchStartX(event.touches[0]?.clientX ?? null)}
            onTouchEnd={(event) => handleTouchEnd(event.changedTouches[0]?.clientX ?? 0)}
          >
            {selectedImage && (
              <Image
                src={urlFor(selectedImage).width(2400).fit("max").quality(95).url()}
                alt={`${title} enlarged image`}
                width={selectedDimensions.width}
                height={selectedDimensions.height}
                className="block h-auto max-h-[88vh] w-auto max-w-[92vw] object-contain"
              />
            )}
            {/* Left and Right Navigation Arrows in modal */}
            <button
              onClick={prevImage}
              className="absolute top-1/2 left-4 z-10 hidden -translate-y-1/2 transform text-3xl text-white md:block"
            >
              ❮
            </button>
            <button
              onClick={nextImage}
              className="absolute top-1/2 right-4 z-10 hidden -translate-y-1/2 transform text-3xl text-white md:block"
            >
              ❯
            </button>
            {/* Close Button */}
            <button
              onClick={closeModal}
              className="absolute right-3 top-3 z-10 flex h-10 w-10 items-center justify-center bg-ivory/90 text-2xl text-brown shadow-sm transition-colors duration-200 hover:bg-paper"
              aria-label="Close enlarged image"
              type="button"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
