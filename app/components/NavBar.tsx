// components/NavBar.tsx
"use client"; // If you want to do dynamic effects like onScroll or toggling classes

import Link from 'next/link';

export default function NavBar() {
  return (
    <header className="sticky top-0 z-50 bg-white/60 backdrop-blur-md border-b border-gray-200">
      <nav className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between transition-colors">
        <div className="text-xl md:text-2xl font-bold tracking-tight">
          <Link href="/">
            Megan Houssian Art
          </Link>
        </div>
        <ul className="flex space-x-6 text-gray-700 font-medium">
          <li>
            <a
              href="#about"
              className="hover:text-gray-900 transition-colors duration-200"
            >
              About
            </a>
          </li>
          <li>
            <a
              href="#gallery"
              className="hover:text-gray-900 transition-colors duration-200"
            >
              Gallery
            </a>
          </li>
          <li>
            <a
              href="#contact"
              className="hover:text-gray-900 transition-colors duration-200"
            >
              Contact
            </a>
          </li>
        </ul>
      </nav>
    </header>
  );
}
