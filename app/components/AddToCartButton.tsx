"use client";

import { useEffect, useState } from "react";
import type { CartItem } from "../../lib/cart-types";
import { lora } from "../fonts";
import { addCartItem, CART_UPDATED_EVENT, readCart } from "./cart-storage";

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
  const [isAdded, setIsAdded] = useState(false);

  useEffect(() => {
    const updateAddedState = () => {
      setIsAdded(readCart().some((cartItem) => cartItem.id === item.id));
    };

    updateAddedState();
    window.addEventListener(CART_UPDATED_EVENT, updateAddedState);
    window.addEventListener("storage", updateAddedState);

    return () => {
      window.removeEventListener(CART_UPDATED_EVENT, updateAddedState);
      window.removeEventListener("storage", updateAddedState);
    };
  }, [item.id]);

  const handleAddToCart = () => {
    if (disabled) return;

    const alreadyInCart = readCart().some((cartItem) => cartItem.id === item.id);

    if (alreadyInCart && item.type === "original") {
      setIsAdded(true);
      setMessage("Item already added to cart");
      window.setTimeout(() => setMessage(null), 1800);
      return;
    }

    addCartItem(item);
    setIsAdded(true);
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
        {isAdded ? "Added to Cart" : label}
      </button>
      {message && (
        <p className={`${lora.className} mt-3 text-center text-sm text-olive`}>
          {message}
        </p>
      )}
    </div>
  );
}
