"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { FaShoppingCart } from "react-icons/fa";
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
    <Link href="/cart" onClick={onClick} className={`${className} relative`}>
      <span className="sr-only">
        {label}
        {count > 0 ? `, ${count} item${count === 1 ? "" : "s"}` : ""}
      </span>
      <FaShoppingCart aria-hidden="true" className="h-5 w-5" />
      {count > 0 && (
        <span className="absolute -right-2 -top-2 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-olive/85 px-1.5 text-xs font-semibold leading-none text-paper">
          {count}
        </span>
      )}
    </Link>
  );
}
