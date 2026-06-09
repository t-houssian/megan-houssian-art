"use client";
import React, { useCallback, useRef, useState } from "react";
import Image from "next/image";
import { bestQualityImageUrl, urlFor } from "../../sanity/lib/image";

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
  startTime: number;
  lastX: number;
  lastTime: number;
  velocityX: number;
  hasDragged: boolean;
};

const DRAG_START_THRESHOLD = 4;
const VERTICAL_SCROLL_THRESHOLD = 10;
const SWIPE_DISTANCE_RATIO = 0.09;
const MIN_SWIPE_DISTANCE = 26;
const MAX_SWIPE_DISTANCE = 42;
const SWIPE_VELOCITY_THRESHOLD = 0.24;
const PAGE_IMAGE_WIDTH = 3600;
const MODAL_IMAGE_WIDTH = 4200;
const PAGE_IMAGE_QUALITY = 100;
const MODAL_IMAGE_QUALITY = 100;
const THUMBNAIL_IMAGE_QUALITY = 90;

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
  const dragOffsetRef = useRef(0);
  const dragFrameRef = useRef<number | null>(null);
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

  const updateDragOffset = (offset: number) => {
    dragOffsetRef.current = offset;

    if (dragFrameRef.current !== null) return;

    dragFrameRef.current = window.requestAnimationFrame(() => {
      dragFrameRef.current = null;
      setDragOffset(dragOffsetRef.current);
    });
  };

  const resetDragOffset = () => {
    dragOffsetRef.current = 0;

    if (dragFrameRef.current !== null) {
      window.cancelAnimationFrame(dragFrameRef.current);
      dragFrameRef.current = null;
    }

    setDragOffset(0);
  };

  const finishDrag = useCallback((viewer: HTMLDivElement | null) => {
    const dragState = dragStateRef.current;
    if (!dragState) return;

    const distance = dragState.lastX - dragState.startX;
    const viewerWidth = viewer?.clientWidth ?? 0;
    const distanceThreshold = Math.min(
      MAX_SWIPE_DISTANCE,
      Math.max(MIN_SWIPE_DISTANCE, viewerWidth * SWIPE_DISTANCE_RATIO)
    );
    const elapsed = Math.max(1, dragState.lastTime - dragState.startTime);
    const averageVelocityX = distance / elapsed;
    const effectiveVelocityX =
      Math.abs(dragState.velocityX) > Math.abs(averageVelocityX)
        ? dragState.velocityX
        : averageVelocityX;
    const shouldAdvance =
      Math.abs(distance) > distanceThreshold || Math.abs(effectiveVelocityX) > SWIPE_VELOCITY_THRESHOLD;

    if (dragState.hasDragged) {
      suppressClickRef.current = true;
    }

    dragStateRef.current = null;
    setIsDragging(false);
    resetDragOffset();

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

    const now = performance.now();
    dragStateRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      startTime: now,
      lastX: event.clientX,
      lastTime: now,
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

    if (
      !dragState.hasDragged &&
      Math.abs(deltaY) > Math.abs(deltaX) &&
      Math.abs(deltaY) > VERTICAL_SCROLL_THRESHOLD
    ) {
      dragStateRef.current = null;
      setIsDragging(false);
      resetDragOffset();
      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }
      return;
    }

    if (Math.abs(deltaX) > DRAG_START_THRESHOLD) {
      dragState.hasDragged = true;
    }

    const now = performance.now();
    const elapsed = Math.max(1, now - dragState.lastTime);
    dragState.velocityX = (event.clientX - dragState.lastX) / elapsed;
    dragState.lastX = event.clientX;
    dragState.lastTime = now;

    if (dragState.hasDragged) {
      updateDragOffset(deltaX);
    }
  };

  const handlePointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    const viewer = event.currentTarget;
    finishDrag(viewer);
  };

  const handlePointerCancel = () => {
    dragStateRef.current = null;
    setIsDragging(false);
    resetDragOffset();
  };

  const renderImageTrack = (variant: "page" | "modal") => (
    <div
      className={`absolute inset-0 flex h-full ${isDragging ? "transition-none" : "transition-transform duration-[260ms] ease-out"}`}
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
            src={bestQualityImageUrl(
              image,
              variant === "modal" ? MODAL_IMAGE_WIDTH : PAGE_IMAGE_WIDTH,
              variant === "modal" ? MODAL_IMAGE_QUALITY : PAGE_IMAGE_QUALITY
            )}
            alt={`${title} image ${index + 1}`}
            fill
            quality={variant === "modal" ? MODAL_IMAGE_QUALITY : PAGE_IMAGE_QUALITY}
            draggable={false}
            className="select-none object-contain"
            sizes={
              variant === "modal"
                ? "92vw"
                : "(min-width: 1280px) 40vw, (min-width: 1024px) 45vw, (min-width: 768px) 60vw, 90vw"
            }
            priority={variant === "page" && index === 0}
            unoptimized
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
        className={`relative w-full cursor-pointer overflow-hidden bg-ivory min-h-[420px] sm:min-h-[560px] lg:min-h-[720px] [touch-action:pan-y_pinch-zoom] ${
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
              src={urlFor(img).width(400).fit("max").quality(THUMBNAIL_IMAGE_QUALITY).url()}
              alt={`${title} thumbnail ${index + 1}`}
              fill
              quality={THUMBNAIL_IMAGE_QUALITY}
              className="object-contain"
              sizes="(min-width: 640px) 96px, 80px"
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
          <button
            onClick={(event) => {
              event.stopPropagation();
              closeModal();
            }}
            className="fixed right-4 top-4 z-[60] flex h-12 w-12 items-center justify-center rounded-full border border-white/70 bg-black/70 text-white shadow-lg backdrop-blur-sm transition-colors duration-200 hover:bg-black/90 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black sm:right-6 sm:top-6 [touch-action:manipulation]"
            aria-label="Close enlarged image"
            type="button"
          >
            <svg
              aria-hidden="true"
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2.5"
              viewBox="0 0 24 24"
            >
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>

          <div
            ref={modalViewerRef}
            className="relative h-[88vh] w-[92vw] overflow-hidden [touch-action:pan-y_pinch-zoom]"
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
          </div>
        </div>
      )}
    </div>
  );
}
