"use client";

import { useEffect } from "react";
import { clearCart } from "./cart-storage";

export default function ClearCartOnSuccess() {
  useEffect(() => {
    clearCart();
  }, []);

  return null;
}
