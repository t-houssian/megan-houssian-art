"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { CartItem } from "../../lib/cart-types";
import { formatCurrency } from "../../lib/money";
import { cormorant, lora } from "../fonts";
import { readCart, writeCart } from "./cart-storage";

export default function CartPageClient() {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    setItems(readCart());
  }, []);

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
              {items.map((item) => (
                <div key={item.id} className="grid grid-cols-[88px_minmax(0,1fr)] gap-5 border-t border-tan/40 pt-6">
                  <div className="relative h-24 w-20 bg-ivory">
                    {item.imageUrl ? (
                      <Image src={item.imageUrl} alt={item.title} fill className="object-contain" sizes="80px" />
                    ) : (
                      <div className="h-full w-full border border-tan/30" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h2 className={`${cormorant.className} text-2xl font-medium text-brown`}>
                          {item.title}
                        </h2>
                        <p className={`${lora.className} mt-1 text-sm text-warm-gray`}>
                          {item.type === "original"
                            ? "Original artwork"
                            : `${item.printProductName || "Print"}${item.printSizeName ? `, ${item.printSizeName}` : ""}`}
                        </p>
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
              ))}
            </div>

            <aside className="border-t border-tan/40 pt-6">
              <h2 className={`${cormorant.className} mb-5 text-2xl font-medium text-brown`}>Summary</h2>
              <div className="mb-5 flex justify-between border-b border-tan/30 pb-4">
                <span className={`${lora.className} text-warm-gray`}>Subtotal</span>
                <span className={`${lora.className} font-medium text-brown`}>{formatCurrency(total)}</span>
              </div>
              <p className={`${lora.className} mb-6 text-sm text-warm-gray`}>Shipping or pickup is selected at checkout.</p>
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
