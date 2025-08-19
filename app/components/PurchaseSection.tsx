"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { lora } from "../fonts";

type PurchaseSectionProps = {
  title: string;
  basePrice: number;
  shipping?: {
    weight?: number;
    dimensions?: {
      length?: number;
      width?: number;
      height?: number;
    };
  };
};

export default function PurchaseSection({ title, basePrice, shipping }: PurchaseSectionProps) {
  const router = useRouter();

  const handlePurchase = () => {
    // Build the checkout URL with product details and shipping information
    const params = new URLSearchParams({
      product: title,
      price: basePrice.toString(),
    });

    // Add shipping parameters if available, with fallback defaults
    if (shipping?.weight) {
      params.append('weight', shipping.weight.toString());
    }
    if (shipping?.dimensions?.length) {
      params.append('length', shipping.dimensions.length.toString());
    }
    if (shipping?.dimensions?.width) {
      params.append('width', shipping.dimensions.width.toString());
    }
    if (shipping?.dimensions?.height) {
      params.append('height', shipping.dimensions.height.toString());
    }

    router.push(`/checkout?${params.toString()}`);
  };

  return (
    <div>
      <p className={`${lora.className} text-brown mb-6 text-lg font-light tracking-wide`}>Price: ${basePrice.toLocaleString()}</p>
      <button
        onClick={handlePurchase}
        className={`bg-gradient-to-r from-btn-brown to-btn-brown-hover text-paper px-8 py-4 rounded-lg hover:from-btn-brown-hover hover:to-brown transition-all duration-500 font-serif text-lg shadow-vintage hover:shadow-vintage-lg transform hover:-translate-y-1 border border-opacity-20 border-paper relative overflow-hidden group ${lora.className}`}
      >
        <span className="relative z-10">Purchase This Piece</span>
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-paper to-transparent opacity-0 group-hover:opacity-10 transform -skew-x-12 group-hover:translate-x-full transition-all duration-700"></div>
      </button>
    </div>
  );
}
