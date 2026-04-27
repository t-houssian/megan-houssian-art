"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CART_UPDATED_EVENT, readCart } from "./cart-storage";

type CartLinkProps = {
  className: string;
  onClick?: () => void;
  label?: string;
};

export default function CartLink({ className, onClick, label = "Cart" }: CartLinkProps) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const updateCount = () => {
      setCount(readCart().reduce((total, item) => total + (item.quantity ?? 1), 0));
    };

    updateCount();
    window.addEventListener(CART_UPDATED_EVENT, updateCount);
    window.addEventListener("storage", updateCount);
    return () => {
      window.removeEventListener(CART_UPDATED_EVENT, updateCount);
      window.removeEventListener("storage", updateCount);
    };
  }, []);

  return (
    <Link href="/cart" onClick={onClick} className={className}>
      {label}
      {count > 0 ? ` (${count})` : ""}
    </Link>
  );
}
