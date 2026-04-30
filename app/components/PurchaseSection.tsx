"use client";
import React from "react";
import { usePathname, useRouter } from "next/navigation";
import { lora } from "../fonts";
import { formatDollars, roundUpToNearestTenDollars } from "../../lib/money";
import type { OriginalEarlyAccessState } from "../../lib/originals";
import AddToCartButton from "./AddToCartButton";

type PurchaseSectionProps = {
  title: string;
  basePrice: number;
  originalSlug: string;
  imageUrl?: string;
  isTestProduct?: boolean;
  earlyAccess?: OriginalEarlyAccessState;
  isSold?: boolean;
};

export default function PurchaseSection({
  title,
  basePrice,
  originalSlug,
  imageUrl,
  isTestProduct = false,
  earlyAccess,
  isSold = false,
}: PurchaseSectionProps) {
  const router = useRouter();
  const pathname = usePathname();
  const checkoutPrice = isTestProduct ? basePrice : roundUpToNearestTenDollars(basePrice);
  const [accessError, setAccessError] = React.useState<string | null>(null);
  const isUpcoming = earlyAccess?.status === "upcoming";

  const handlePurchase = () => {
    setAccessError(null);

    if (isSold) {
      return;
    }

    if (isUpcoming) {
      setAccessError(earlyAccess?.message || "This piece is not available for purchase yet.");
      return;
    }

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
      {isUpcoming && (
        <div className="mb-6 border-y border-tan/50 py-5">
          <p className={`${lora.className} text-sm uppercase tracking-[0.18em] text-olive mb-2`}>
            Coming soon
          </p>
          <p className={`${lora.className} text-warm-gray leading-relaxed`}>
            {earlyAccess?.message}
          </p>
          {earlyAccess?.sourceTitle && (
            <p className={`${lora.className} mt-3 text-sm text-warm-gray`}>
              {earlyAccess.sourceType === "collection" ? "Collection" : "Piece"}:{" "}
              <span className="text-brown">{earlyAccess.sourceTitle}</span>
            </p>
          )}
          {accessError && (
            <p className={`${lora.className} mt-4 text-sm text-red-700`}>{accessError}</p>
          )}
        </div>
      )}

      <p className={`${lora.className} text-brown mb-6 text-lg font-light tracking-wide`}>
        Price: {formatDollars(checkoutPrice)}
      </p>
      <p className={`${lora.className} text-olive mb-6 text-sm tracking-wide`}>
        Free shipping included
      </p>
      <button
        onClick={handlePurchase}
        disabled={isUpcoming || isSold}
        className={`w-full border px-8 py-4 text-paper transition-colors duration-300 disabled:cursor-not-allowed ${lora.className} text-lg font-medium ${
          isSold
            ? "border-warm-gray bg-warm-gray text-paper"
            : "border-btn-brown bg-btn-brown hover:bg-btn-brown-hover disabled:opacity-60"
        }`}
      >
        {isSold ? "Sold" : "Purchase Now"}
      </button>
      <div className="mt-4">
        <AddToCartButton
          disabled={isUpcoming || isSold}
          item={{
            id: `original:${originalSlug}`,
            type: "original",
            title,
            price: checkoutPrice,
            imageUrl,
            originalSlug,
            isTestProduct,
            quantity: 1,
          }}
        />
      </div>
    </div>
  );
}
