"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { lora } from "../fonts";

type PurchaseSectionProps = {
  title: string;
  basePrice: number;
};

export default function PurchaseSection({ title, basePrice }: PurchaseSectionProps) {
  const router = useRouter();

  const handlePurchase = () => {
    // Redirect to the checkout page with product details in query parameters
    router.push(`/checkout?product=${encodeURIComponent(title)}&price=${basePrice}`);
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
