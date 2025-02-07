// app/layout.tsx
import "./globals.css";
import { ReactNode } from 'react';
import type { Metadata } from "next";

export const metadata = {
  title: 'Megan Houssian Art',
  description: 'Official art portfolio of Megan Houssian',
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-white text-gray-800">
        {/* 
          You might add a header or navigation here 
          if you want it on every page 
        */}
        {children}
        {/* 
          You might add a footer here 
          if you want it on every page 
        */}
      </body>
    </html>
  );
}
