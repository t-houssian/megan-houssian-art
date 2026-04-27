"use client";
import React, { useCallback, useRef, useState } from "react";
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

type DragState = {
  pointerId: number;
  startX: number;
  startY: number;
  lastX: number;
  lastTime: number;
  velocityX: number;
  hasDragged: boolean;
};

export default function ArtworkGallery({ mainImage, gallery, title }: ArtworkGalleryProps) {
  // Combine the main image and additional gallery images into one array.
  const images: GalleryImage[] = mainImage ? [mainImage, ...(gallery || [])] : (gallery || []);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const mainViewerRef = useRef<HTMLDivElement>(null);
  const modalViewerRef = useRef<HTMLDivElement>(null);
  const dragStateRef = useRef<DragState | null>(null);
  const suppressClickRef = useRef(false);

  const slideBasis = images.length > 0 ? 100 / images.length : 100;
  const trackTransform =
    images.length > 1
      ? `translate3d(calc(${-selectedIndex * slideBasis}% + ${dragOffset}px), 0, 0)`
      : "translate3d(0, 0, 0)";

  const openModal = () => {
    if (suppressClickRef.current) {
      suppressClickRef.current = false;
      return;
    }

    setIsModalOpen(true);
  };

  const closeModal = () => {
    suppressClickRef.current = false;
    setIsModalOpen(false);
  };

  const prevImage = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation(); // Prevent triggering openModal
    setSelectedIndex((prevIndex) => (prevIndex > 0 ? prevIndex - 1 : images.length - 1));
  }, [images.length]);

  const nextImage = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    setSelectedIndex((prevIndex) => (prevIndex < images.length - 1 ? prevIndex + 1 : 0));
  }, [images.length]);

  const finishDrag = useCallback((viewer: HTMLDivElement | null) => {
    const dragState = dragStateRef.current;
    if (!dragState) return;

    const distance = dragState.lastX - dragState.startX;
    const viewerWidth = viewer?.clientWidth ?? 0;
    const distanceThreshold = Math.max(48, viewerWidth * 0.16);
    const velocityThreshold = 0.45;
    const shouldAdvance =
      Math.abs(distance) > distanceThreshold || Math.abs(dragState.velocityX) > velocityThreshold;

    if (dragState.hasDragged) {
      suppressClickRef.current = true;
    }

    dragStateRef.current = null;
    setIsDragging(false);
    setDragOffset(0);

    if (shouldAdvance && images.length > 1) {
      if (distance < 0) {
        setSelectedIndex((prevIndex) => (prevIndex < images.length - 1 ? prevIndex + 1 : 0));
      } else {
        setSelectedIndex((prevIndex) => (prevIndex > 0 ? prevIndex - 1 : images.length - 1));
      }
    }
  }, [images.length]);

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (images.length < 2) return;

    dragStateRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      lastX: event.clientX,
      lastTime: performance.now(),
      velocityX: 0,
      hasDragged: false,
    };

    setIsDragging(true);
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const dragState = dragStateRef.current;
    if (!dragState || dragState.pointerId !== event.pointerId) return;

    const deltaX = event.clientX - dragState.startX;
    const deltaY = event.clientY - dragState.startY;

    if (!dragState.hasDragged && Math.abs(deltaY) > Math.abs(deltaX) && Math.abs(deltaY) > 8) {
      dragStateRef.current = null;
      setIsDragging(false);
      setDragOffset(0);
      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }
      return;
    }

    if (Math.abs(deltaX) > 6) {
      dragState.hasDragged = true;
    }

    const now = performance.now();
    const elapsed = Math.max(1, now - dragState.lastTime);
    dragState.velocityX = (event.clientX - dragState.lastX) / elapsed;
    dragState.lastX = event.clientX;
    dragState.lastTime = now;

    if (dragState.hasDragged) {
      setDragOffset(deltaX);
    }
  };

  const handlePointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    const viewer = event.currentTarget;
    finishDrag(viewer);
  };

  const handlePointerCancel = () => {
    dragStateRef.current = null;
    setIsDragging(false);
    setDragOffset(0);
  };

  const renderImageTrack = (variant: "page" | "modal") => (
    <div
      className={`absolute inset-0 flex h-full ${isDragging ? "transition-none" : "transition-transform duration-300 ease-out"}`}
      style={{
        width: `${images.length * 100}%`,
        transform: trackTransform,
        willChange: "transform",
      }}
    >
      {images.map((image, index) => (
        <div
          key={`${image.asset._ref}-${index}`}
          className="relative h-full min-w-0"
          style={{ flex: `0 0 ${slideBasis}%` }}
        >
          <Image
            src={urlFor(image)
              .width(variant === "modal" ? 2400 : 1600)
              .fit("max")
              .quality(variant === "modal" ? 95 : 90)
              .url()}
            alt={`${title} image ${index + 1}`}
            fill
            draggable={false}
            className="select-none object-contain"
            sizes={
              variant === "modal"
                ? "92vw"
                : "(min-width: 1280px) 40vw, (min-width: 1024px) 45vw, (min-width: 768px) 60vw, 90vw"
            }
            priority={index === 0}
          />
        </div>
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Main image */}
      <div
        ref={mainViewerRef}
        className={`relative w-full cursor-pointer overflow-hidden bg-ivory min-h-[420px] sm:min-h-[560px] lg:min-h-[720px] [touch-action:pan-y] ${
          isDragging ? "cursor-grabbing" : "cursor-grab"
        }`}
        onClick={openModal}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
        onPointerLeave={(event) => {
          if (dragStateRef.current?.pointerId === event.pointerId) {
            finishDrag(mainViewerRef.current);
          }
        }}
      >
        {images.length > 0 && renderImageTrack("page")}
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
            ref={modalViewerRef}
            className="relative h-[88vh] w-[92vw] overflow-hidden [touch-action:pan-y]"
            onClick={(event) => event.stopPropagation()}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerCancel}
            onPointerLeave={(event) => {
              if (dragStateRef.current?.pointerId === event.pointerId) {
                finishDrag(modalViewerRef.current);
              }
            }}
          >
            {images.length > 0 && renderImageTrack("modal")}
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
