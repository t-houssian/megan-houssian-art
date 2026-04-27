"use client";

import { useState } from "react";
import type { CartItem } from "../../lib/cart-types";
import { lora } from "../fonts";
import { addCartItem } from "./cart-storage";

type AddToCartButtonProps = {
  item: CartItem;
  disabled?: boolean;
  className?: string;
  label?: string;
};

export default function AddToCartButton({
  item,
  disabled = false,
  className = "",
  label = "Add to Cart",
}: AddToCartButtonProps) {
  const [message, setMessage] = useState<string | null>(null);

  const handleAddToCart = () => {
    if (disabled) return;
    addCartItem(item);
    setMessage("Added to cart");
    window.setTimeout(() => setMessage(null), 1800);
  };

  return (
    <div>
      <button
        type="button"
        onClick={handleAddToCart}
        disabled={disabled}
        className={`${lora.className} w-full border border-btn-brown px-8 py-4 text-lg font-medium text-btn-brown transition-colors duration-300 hover:bg-btn-brown hover:text-paper disabled:cursor-not-allowed disabled:border-warm-gray disabled:text-warm-gray ${className}`}
      >
        {label}
      </button>
      {message && (
        <p className={`${lora.className} mt-3 text-center text-sm text-olive`}>
          {message}
        </p>
      )}
    </div>
  );
}
