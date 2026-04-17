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
        className={`w-full border border-btn-brown bg-btn-brown px-8 py-4 text-paper transition-colors duration-300 hover:bg-btn-brown-hover ${lora.className} text-lg font-medium`}
      >
        Purchase This Piece
      </button>
    </div>
  );
}
