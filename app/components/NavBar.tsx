// components/NavBar.tsx
"use client";

import Link from 'next/link';
import { useState } from 'react';
import { cormorant, lora } from '../fonts';

export default function NavBar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="bg-gradient-to-r from-ivory via-paper to-ivory border-b border-tan/30 backdrop-blur-sm">
      <nav className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className={`${cormorant.className} text-3xl font-light text-brown tracking-wide hover:text-olive transition-colors duration-300`}>
          <Link href="/" className="flex items-center space-x-2">
            <span>Megan Houssian Art</span>
          </Link>
        </div>
        
        <button
          className="md:hidden focus:outline-none p-2 rounded-lg hover:bg-olive/10 transition-colors duration-200"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle Menu"
        >
          {isOpen ? (
            <svg className="h-6 w-6 text-brown" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="h-6 w-6 text-brown" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
        
        <ul className={`hidden md:flex space-x-8 text-brown font-medium ${lora.className}`}>
          <li>
            <Link href="/#gallery" className="relative group py-2 px-1 hover:text-olive transition-colors duration-300">
              Gallery
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-olive transition-all duration-300 group-hover:w-full"></span>
            </Link>
          </li>
          <li>
            <Link href="/about" className="relative group py-2 px-1 hover:text-olive transition-colors duration-300">
              About
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-olive transition-all duration-300 group-hover:w-full"></span>
            </Link>
          </li>
          <li>
            <Link href="/originals" className="relative group py-2 px-1 hover:text-olive transition-colors duration-300">
              Originals
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-olive transition-all duration-300 group-hover:w-full"></span>
            </Link>
          </li>
          {/* <li>
            <Link href="/prints" className="relative group py-2 px-1 hover:text-olive transition-colors duration-300">
              Prints
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-olive transition-all duration-300 group-hover:w-full"></span>
            </Link>
          </li> */}
          <li>
            <Link href="/commissions" className="relative group py-2 px-1 hover:text-olive transition-colors duration-300">
              Commissions
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-olive transition-all duration-300 group-hover:w-full"></span>
            </Link>
          </li>
          <li>
            <Link href="/contact" className="relative group py-2 px-1 hover:text-olive transition-colors duration-300">
              Contact
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-olive transition-all duration-300 group-hover:w-full"></span>
            </Link>
          </li>
        </ul>
      </nav>
      
      {isOpen && (
        <div className="md:hidden px-6 pb-4 bg-gradient-to-b from-paper to-ivory border-t border-tan/20">
          <ul className={`flex flex-col space-y-3 text-brown font-medium ${lora.className} pt-4`}>
            <li>
              <Link 
                href="/about" 
                onClick={() => setIsOpen(false)} 
                className="block py-3 px-4 rounded-lg hover:bg-olive/10 hover:text-olive transition-all duration-200 border-l-4 border-transparent hover:border-olive"
              >
                About
              </Link>
            </li>
            <li>
              <Link 
                href="/#gallery" 
                onClick={() => setIsOpen(false)} 
                className="block py-3 px-4 rounded-lg hover:bg-olive/10 hover:text-olive transition-all duration-200 border-l-4 border-transparent hover:border-olive"
              >
                Gallery
              </Link>
            </li>
            <li>
              <Link 
                href="/originals" 
                onClick={() => setIsOpen(false)} 
                className="block py-3 px-4 rounded-lg hover:bg-olive/10 hover:text-olive transition-all duration-200 border-l-4 border-transparent hover:border-olive"
              >
                Originals
              </Link>
            </li>
            {/* <li>
              <Link 
                href="/prints" 
                onClick={() => setIsOpen(false)} 
                className="block py-3 px-4 rounded-lg hover:bg-olive/10 hover:text-olive transition-all duration-200 border-l-4 border-transparent hover:border-olive"
              >
                Prints
              </Link>
            </li> */}
            <li>
              <Link 
                href="/commissions" 
                onClick={() => setIsOpen(false)} 
                className="block py-3 px-4 rounded-lg hover:bg-olive/10 hover:text-olive transition-all duration-200 border-l-4 border-transparent hover:border-olive"
              >
                Commissions
              </Link>
            </li>
            <li>
              <Link 
                href="/contact" 
                onClick={() => setIsOpen(false)} 
                className="block py-3 px-4 rounded-lg hover:bg-olive/10 hover:text-olive transition-all duration-200 border-l-4 border-transparent hover:border-olive"
              >
                Contact
              </Link>
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}
