// components/NavBar.tsx
"use client";

import Link from 'next/link';
import { playfair } from '../fonts';

export default function NavBar() {
  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <nav className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className={`${playfair.className} text-2xl font-black text-gray-900 tracking-tight`}>
          <Link href="/">
            Megan Houssian Art
          </Link>
        </div>
        <ul className="flex space-x-6 text-gray-700 font-medium">
          <li>
            <Link href="/#about" className="hover:text-[#8a6d3b] transition-colors duration-200">
              About
            </Link>
          </li>
          <li>
            <Link href="/#gallery" className="hover:text-[#8a6d3b] transition-colors duration-200">
              Gallery
            </Link>
          </li>
          <li>
            <Link href="/commissions" className="hover:text-[#8a6d3b] transition-colors duration-200">
              Commissions
            </Link>
          </li>
          <li>
            <Link href="/contact" className="hover:text-[#8a6d3b] transition-colors duration-200">
              Contact
            </Link>
          </li>
          {/* NEW LINKS */}
          <li>
            <Link href="/originals" className="hover:text-[#8a6d3b] transition-colors duration-200">
              Originals
            </Link>
          </li>
          <li>
            <Link href="/prints" className="hover:text-[#8a6d3b] transition-colors duration-200">
              Print Shop
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  );
}
