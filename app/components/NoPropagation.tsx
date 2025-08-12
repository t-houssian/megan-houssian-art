// components/NoPropagation.tsx
"use client";
import React from "react";

type NoPropagationProps = {
  children: React.ReactNode;
};

export default function NoPropagation({ children }: NoPropagationProps) {
  return <div onClick={(e) => e.stopPropagation()}>{children}</div>;
}
