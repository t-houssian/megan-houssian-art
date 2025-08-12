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

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering openModal
    setSelectedIndex((prevIndex) => (prevIndex > 0 ? prevIndex - 1 : images.length - 1));
  };

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedIndex((prevIndex) => (prevIndex < images.length - 1 ? prevIndex + 1 : 0));
  };

  return (
    <div>
      {/* Main image container with arrows */}
      <div className="relative w-full h-96 bg-gray-100 cursor-pointer" onClick={openModal}>
        {selectedImage && (
          <Image
            src={urlFor(selectedImage).width(800).height(800).url()}
            alt={`${title} image ${selectedIndex + 1}`}
            fill
            style={{ objectFit: "cover" }}
          />
        )}
        {/* Left and Right arrows on the normal view */}
        <button
          onClick={prevImage}
          className="absolute top-1/2 left-4 transform -translate-y-1/2 text-white text-2xl z-10"
        >
          ❮
        </button>
        <button
          onClick={nextImage}
          className="absolute top-1/2 right-4 transform -translate-y-1/2 text-white text-2xl z-10"
        >
          ❯
        </button>
      </div>

      {/* Thumbnails */}
      <div className="flex space-x-2 mt-4 overflow-x-auto">
        {images.map((img, index) => (
          <div
            key={index}
            className={`relative w-24 h-24 flex-shrink-0 cursor-pointer border ${
              index === selectedIndex ? "border-blue-500" : "border-gray-300"
            }`}
            onClick={() => setSelectedIndex(index)}
          >
            <Image
              src={urlFor(img).width(200).height(200).url()}
              alt={`${title} thumbnail ${index + 1}`}
              fill
              style={{ objectFit: "cover" }}
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
                src={urlFor(selectedImage).width(1600).height(1600).url()}
                alt={`${title} enlarged image`}
                fill
                style={{ objectFit: "contain" }}
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
