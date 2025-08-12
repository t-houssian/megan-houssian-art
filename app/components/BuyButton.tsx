"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { lora } from "../fonts";

type BuyButtonProps = {
  title: string;
  price: number; // base price from artwork (assumed to be in dollars)
};

export default function BuyButton({ title, price }: BuyButtonProps) {
  const router = useRouter();

  const handlePurchase = () => {
    // Redirect to the checkout page, passing product details via query parameters
    router.push(`/checkout?product=${encodeURIComponent(title)}&price=${price}`);
  };

  return (
    <button
      onClick={handlePurchase}
      className={`bg-gradient-to-r from-btn-brown to-btn-brown-hover text-paper px-8 py-4 rounded-lg hover:from-btn-brown-hover hover:to-brown transition-all duration-500 font-serif text-lg shadow-vintage hover:shadow-vintage-lg transform hover:-translate-y-1 border border-opacity-20 border-paper relative overflow-hidden group ${lora.className}`}
    >
      <span className="relative z-10">Purchase for ${price.toLocaleString()}</span>
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-paper to-transparent opacity-0 group-hover:opacity-10 transform -skew-x-12 group-hover:translate-x-full transition-all duration-700"></div>
    </button>
  );
}
