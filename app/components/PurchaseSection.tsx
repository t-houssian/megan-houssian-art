"use client";
import React from "react";
import { usePathname, useRouter } from "next/navigation";
import { lora } from "../fonts";
import { formatDollars, roundUpToNearestTenDollars } from "../../lib/money";

type PurchaseSectionProps = {
  title: string;
  basePrice: number;
  originalSlug: string;
  isTestProduct?: boolean;
};

export default function PurchaseSection({
  title,
  basePrice,
  originalSlug,
  isTestProduct = false,
}: PurchaseSectionProps) {
  const router = useRouter();
  const pathname = usePathname();
  const checkoutPrice = isTestProduct ? basePrice : roundUpToNearestTenDollars(basePrice);

  const handlePurchase = () => {
    // Build the checkout URL with product details
    const params = new URLSearchParams({
      product: title,
      price: checkoutPrice.toString(),
      originalSlug,
      returnTo: pathname,
    });

    if (isTestProduct) {
      params.set('testProduct', '1');
    }

    router.push(`/checkout?${params.toString()}`);
  };

  return (
    <div>
      <p className={`${lora.className} text-brown mb-6 text-lg font-light tracking-wide`}>
        Price: {formatDollars(checkoutPrice)}
      </p>
      <p className={`${lora.className} text-olive mb-6 text-sm tracking-wide`}>
        Free shipping included
      </p>
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
