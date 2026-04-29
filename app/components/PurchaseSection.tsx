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
  const [accessPassword, setAccessPassword] = React.useState("");
  const [accessError, setAccessError] = React.useState<string | null>(null);
  const isEarlyAccess = earlyAccess?.status === "early_access";
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

    if (isEarlyAccess && !accessPassword.trim()) {
      setAccessError("Enter the collector password to purchase during early access.");
      return;
    }

    if (isEarlyAccess && typeof window !== "undefined") {
      window.sessionStorage.setItem(
        `mha-early-access-password:${originalSlug}`,
        accessPassword.trim()
      );
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
      {earlyAccess?.status !== "open" && (
        <div className="mb-6 border-y border-tan/50 py-5">
          <p className={`${lora.className} text-sm uppercase tracking-[0.18em] text-olive mb-2`}>
            {isEarlyAccess ? "Collector early access" : "Coming soon"}
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
          {isEarlyAccess && (
            <div className="mt-5">
              <label htmlFor="collector-access-password" className={`${lora.className} block text-brown font-medium mb-2`}>
                Collector Password
              </label>
              <input
                id="collector-access-password"
                type="password"
                value={accessPassword}
                onChange={(event) => setAccessPassword(event.target.value)}
                className="block w-full border-0 border-b border-tan/60 bg-transparent px-0 py-3 text-brown placeholder-warm-gray/60 focus:border-olive focus:outline-none focus:ring-0 transition-all duration-200"
                placeholder="Enter password"
              />
              <a
                href="/#collector-early-access"
                className={`${lora.className} mt-3 inline-block text-sm text-olive underline underline-offset-4`}
              >
                Join the Collector List to receive the password
              </a>
            </div>
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
