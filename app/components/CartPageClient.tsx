"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { CartItem } from "../../lib/cart-types";
import { formatCurrency } from "../../lib/money";
import { cormorant, lora } from "../fonts";
import { readCart, writeCart } from "./cart-storage";

function getItemHref(item: CartItem) {
  if (item.type === "original" && item.originalSlug) {
    return `/originals/${encodeURIComponent(item.originalSlug)}`;
  }

  if (item.type === "print" && item.printSlug) {
    return `/prints/${encodeURIComponent(item.printSlug)}`;
  }

  return null;
}

export default function CartPageClient() {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    setItems(readCart());
  }, []);

  useEffect(() => {
    const itemsMissingImages = items.filter(
      (item) => !item.imageUrl && ((item.type === "original" && item.originalSlug) || (item.type === "print" && item.printSlug))
    );

    if (itemsMissingImages.length === 0) return;

    const controller = new AbortController();

    async function resolveMissingImages() {
      try {
        const response = await fetch("/api/cart-item-media", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            items: itemsMissingImages.map((item) => ({
              id: item.id,
              type: item.type,
              originalSlug: item.originalSlug,
              printSlug: item.printSlug,
            })),
          }),
          signal: controller.signal,
        });

        if (!response.ok) return;

        const payload = await response.json();
        const imageUrlsById = new Map<string, string>(
          Array.isArray(payload?.items)
            ? payload.items
                .filter((item: { id?: unknown; imageUrl?: unknown }) => typeof item.id === "string" && typeof item.imageUrl === "string")
                .map((item: { id: string; imageUrl: string }) => [item.id, item.imageUrl])
            : []
        );

        if (imageUrlsById.size === 0) return;

        setItems((currentItems) => {
          let changed = false;
          const nextItems = currentItems.map((item) => {
            if (item.imageUrl) return item;
            const imageUrl = imageUrlsById.get(item.id);
            if (!imageUrl) return item;
            changed = true;
            return { ...item, imageUrl };
          });

          if (changed) writeCart(nextItems);
          return changed ? nextItems : currentItems;
        });
      } catch (error) {
        if (!controller.signal.aborted) {
          console.error("Failed to load cart item images", error);
        }
      }
    }

    resolveMissingImages();

    return () => controller.abort();
  }, [items]);

  const total = useMemo(
    () => items.reduce((sum, item) => sum + item.price * (item.quantity ?? 1), 0),
    [items]
  );

  const removeItem = (id: string) => {
    const nextItems = items.filter((item) => item.id !== id);
    setItems(nextItems);
    writeCart(nextItems);
  };

  const updateQuantity = (id: string, quantity: number) => {
    const nextItems = items.map((item) =>
      item.id === id ? { ...item, quantity: Math.max(1, quantity) } : item
    );
    setItems(nextItems);
    writeCart(nextItems);
  };

  return (
    <section className="min-h-screen bg-ivory">
      <div className="mx-auto max-w-5xl px-6 py-14">
        <h1 className={`${cormorant.className} mb-8 text-4xl font-light text-brown md:text-5xl`}>
          Shopping Cart
        </h1>

        {items.length === 0 ? (
          <div className="border-y border-tan/40 py-10">
            <p className={`${lora.className} mb-6 text-warm-gray`}>Your cart is empty.</p>
            <Link
              href="/originals"
              className={`${lora.className} inline-block border border-btn-brown bg-btn-brown px-8 py-3 text-paper transition-colors duration-300 hover:bg-btn-brown-hover`}
            >
              Browse Originals
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,1fr)_300px]">
            <div className="space-y-6">
              {items.map((item) => {
                const itemHref = getItemHref(item);
                const imageContent = (
                  <div className="relative h-24 w-20 bg-ivory">
                    {item.imageUrl ? (
                      <Image src={item.imageUrl} alt={item.title} fill className="object-contain" sizes="80px" />
                    ) : (
                      <div className="h-full w-full border border-tan/30" />
                    )}
                  </div>
                );

                return (
                  <div key={item.id} className="grid grid-cols-[88px_minmax(0,1fr)] gap-5 border-t border-tan/40 pt-6">
                    {itemHref ? (
                      <Link href={itemHref} className="block" aria-label={`View ${item.title}`}>
                        {imageContent}
                      </Link>
                    ) : (
                      imageContent
                    )}
                    <div>
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          {itemHref ? (
                            <Link href={itemHref} className="group block">
                              <h2 className={`${cormorant.className} text-2xl font-medium text-brown group-hover:text-olive transition-colors duration-200`}>
                                {item.title}
                              </h2>
                              <p className={`${lora.className} mt-1 text-sm text-warm-gray group-hover:text-brown transition-colors duration-200`}>
                                {item.type === "original"
                                  ? "Original artwork"
                                  : `${item.printProductName || "Print"}${item.printSizeName ? `, ${item.printSizeName}` : ""}`}
                              </p>
                            </Link>
                          ) : (
                            <>
                              <h2 className={`${cormorant.className} text-2xl font-medium text-brown`}>
                                {item.title}
                              </h2>
                              <p className={`${lora.className} mt-1 text-sm text-warm-gray`}>
                                {item.type === "original"
                                  ? "Original artwork"
                                  : `${item.printProductName || "Print"}${item.printSizeName ? `, ${item.printSizeName}` : ""}`}
                              </p>
                            </>
                          )}
                        </div>
                        <p className={`${lora.className} shrink-0 font-medium text-brown`}>
                          {formatCurrency(item.price * (item.quantity ?? 1))}
                        </p>
                      </div>

                      <div className="mt-4 flex items-center justify-between gap-4">
                        {item.type === "print" ? (
                          <label className={`${lora.className} text-sm text-warm-gray`}>
                            Qty{" "}
                            <input
                              type="number"
                              min={1}
                              value={item.quantity ?? 1}
                              onChange={(event) => updateQuantity(item.id, Number(event.target.value))}
                              className="ml-2 w-16 border border-tan/50 bg-transparent px-2 py-1 text-brown"
                            />
                          </label>
                        ) : (
                          <span className={`${lora.className} text-sm text-warm-gray`}>Qty 1</span>
                        )}
                        <button
                          type="button"
                          onClick={() => removeItem(item.id)}
                          className={`${lora.className} text-sm text-warm-gray underline underline-offset-4 hover:text-brown`}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <aside className="border-t border-tan/40 pt-6">
              <h2 className={`${cormorant.className} mb-5 text-2xl font-medium text-brown`}>Summary</h2>
              <div className="mb-5 flex justify-between border-b border-tan/30 pb-4">
                <span className={`${lora.className} text-warm-gray`}>Subtotal</span>
                <span className={`${lora.className} font-medium text-brown`}>{formatCurrency(total)}</span>
              </div>
              <Link
                href="/checkout?cart=1"
                className={`${lora.className} block w-full border border-btn-brown bg-btn-brown px-8 py-4 text-center text-lg font-medium text-paper transition-colors duration-300 hover:bg-btn-brown-hover`}
              >
                Checkout
              </Link>
            </aside>
          </div>
        )}
      </div>
    </section>
  );
}
