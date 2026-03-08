// components/NavBar.tsx
"use client";

import Link from 'next/link';
import { useState } from 'react';
import { cormorant, lora } from '../fonts';

export default function NavBar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isDesktopOriginalsOpen, setIsDesktopOriginalsOpen] = useState(false);
  const [isMobileOriginalsOpen, setIsMobileOriginalsOpen] = useState(false);

  const originalsLinks = [
    { label: 'Originals', href: '/originals' },
    { label: 'Prints', href: '/originals/prints' },
    // { label: 'Collections', href: '/originals/collections' },
  ];

  const closeMenus = () => {
    setIsOpen(false);
    setIsDesktopOriginalsOpen(false);
    setIsMobileOriginalsOpen(false);
  };

  return (
    <header className="relative z-50 border-b border-[color:rgba(212,196,168,0.35)] bg-[var(--bg-paper)]">
      <nav className="relative max-w-7xl mx-auto px-6 py-4 flex items-center justify-between overflow-visible">
        <div className={`${cormorant.className} text-3xl font-light text-[var(--text-brown)] tracking-wide hover:text-[var(--link-olive)] transition-colors duration-300`}>
          <Link href="/" className="flex items-center space-x-2">
            <span>Megan Houssian Art</span>
          </Link>
        </div>
        
        <button
          className="md:hidden focus:outline-none p-2 rounded-lg hover:bg-[rgba(107,91,71,0.08)] transition-colors duration-200"
          onClick={() => {
            setIsOpen((prev) => {
              const next = !prev;
              if (!next) {
                setIsMobileOriginalsOpen(false);
              }
              return next;
            });
          }}
          aria-label="Toggle Menu"
        >
          {isOpen ? (
            <svg className="h-6 w-6 text-[var(--text-brown)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="h-6 w-6 text-[var(--text-brown)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
        
        <ul className={`hidden md:flex space-x-8 text-[var(--text-brown)] font-medium ${lora.className}`}>
          <li>
            <Link
              href="/#gallery"
              onClick={() => setIsDesktopOriginalsOpen(false)}
              className="relative group inline-flex h-10 items-center px-1 hover:text-[var(--link-olive)] transition-colors duration-300"
            >
              Gallery
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[var(--link-olive)] transition-all duration-300 group-hover:w-full"></span>
            </Link>
          </li>
          <li>
            <Link
              href="/about"
              onClick={() => setIsDesktopOriginalsOpen(false)}
              className="relative group inline-flex h-10 items-center px-1 hover:text-[var(--link-olive)] transition-colors duration-300"
            >
              About
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[var(--link-olive)] transition-all duration-300 group-hover:w-full"></span>
            </Link>
          </li>
          <li className="relative">
            <button
              type="button"
              onClick={() => setIsDesktopOriginalsOpen((prev) => !prev)}
              aria-expanded={isDesktopOriginalsOpen}
              aria-haspopup="menu"
              className={`relative group inline-flex h-10 items-center gap-0.5 border transition-colors duration-300 ${
                isDesktopOriginalsOpen
                  ? '-mx-2 rounded-t-md border-[color:rgba(212,196,168,0.45)] border-b-[var(--bg-paper)] bg-[var(--bg-paper)] px-3 text-[var(--text-brown)] z-40'
                  : 'border-transparent px-1 hover:text-[var(--link-olive)]'
              }`}
            >
              Originals
              <svg
                className={`h-4 w-4 transition-transform duration-200 ${isDesktopOriginalsOpen ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
              <span
                className={`absolute bottom-0 left-0 h-0.5 bg-[var(--link-olive)] transition-all duration-300 ${
                  isDesktopOriginalsOpen ? 'w-full' : 'w-0 group-hover:w-full'
                }`}
              ></span>
            </button>
            <div
              className={`absolute left-1/2 top-full z-30 w-56 -translate-x-1/2 origin-top overflow-hidden rounded-b-md border border-t-0 border-[color:rgba(212,196,168,0.45)] bg-[var(--bg-paper)] shadow-md transition-all duration-150 ${
                isDesktopOriginalsOpen
                  ? 'visible translate-y-0 opacity-100'
                  : 'invisible -translate-y-1 opacity-0 pointer-events-none'
              }`}
            >
              {originalsLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsDesktopOriginalsOpen(false)}
                  className="block px-4 py-2.5 text-sm text-[var(--text-brown)] hover:bg-[rgba(107,91,71,0.08)] hover:text-[var(--link-olive)] transition-colors duration-200"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </li>
          {/* <li>
            <Link href="/prints" className="relative group py-2 px-1 hover:text-olive transition-colors duration-300">
              Prints
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-olive transition-all duration-300 group-hover:w-full"></span>
            </Link>
          </li> */}
          <li>
            <Link
              href="/commissions"
              onClick={() => setIsDesktopOriginalsOpen(false)}
              className="relative group inline-flex h-10 items-center px-1 hover:text-[var(--link-olive)] transition-colors duration-300"
            >
              Commissions
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[var(--link-olive)] transition-all duration-300 group-hover:w-full"></span>
            </Link>
          </li>
          <li>
            <Link
              href="/contact"
              onClick={() => setIsDesktopOriginalsOpen(false)}
              className="relative group inline-flex h-10 items-center px-1 hover:text-[var(--link-olive)] transition-colors duration-300"
            >
              Contact
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[var(--link-olive)] transition-all duration-300 group-hover:w-full"></span>
            </Link>
          </li>
        </ul>
      </nav>
      
      {isOpen && (
        <div className="md:hidden px-6 pb-4 bg-[var(--bg-paper)] border-t border-[color:rgba(212,196,168,0.35)]">
          <ul className={`flex flex-col space-y-3 text-[var(--text-brown)] font-medium ${lora.className} pt-4`}>
            <li>
              <Link 
                href="/about" 
                onClick={closeMenus}
                className="block py-3 px-4 rounded-lg hover:bg-[rgba(107,91,71,0.08)] hover:text-[var(--link-olive)] transition-all duration-200 border-l-4 border-transparent hover:border-[var(--link-olive)]"
              >
                About
              </Link>
            </li>
            <li>
              <Link 
                href="/#gallery" 
                onClick={closeMenus}
                className="block py-3 px-4 rounded-lg hover:bg-[rgba(107,91,71,0.08)] hover:text-[var(--link-olive)] transition-all duration-200 border-l-4 border-transparent hover:border-[var(--link-olive)]"
              >
                Gallery
              </Link>
            </li>
            <li>
              <button
                type="button"
                onClick={() => setIsMobileOriginalsOpen((prev) => !prev)}
                className="w-full text-left flex items-center justify-between py-3 px-4 rounded-lg hover:bg-[rgba(107,91,71,0.08)] hover:text-[var(--link-olive)] transition-all duration-200 border-l-4 border-transparent hover:border-[var(--link-olive)]"
                aria-expanded={isMobileOriginalsOpen}
              >
                Originals
                <svg
                  className={`h-4 w-4 transition-transform duration-200 ${isMobileOriginalsOpen ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {isMobileOriginalsOpen && (
                <ul className="mt-1 ml-4 space-y-1 rounded-md border border-[color:rgba(212,196,168,0.35)] bg-[var(--bg-paper)] p-2">
                  {originalsLinks.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        onClick={closeMenus}
                        className="block rounded-md py-2 px-3 text-sm hover:bg-[rgba(107,91,71,0.08)] hover:text-[var(--link-olive)] transition-colors duration-200"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </li>
            {/* <li>
              <Link 
                href="/prints" 
                onClick={() => setIsOpen(false)} 
                className="block py-3 px-4 rounded-lg hover:bg-[rgba(107,91,71,0.08)] hover:text-[var(--link-olive)] transition-all duration-200 border-l-4 border-transparent hover:border-[var(--link-olive)]"
              >
                Prints
              </Link>
            </li> */}
            <li>
              <Link 
                href="/commissions" 
                onClick={closeMenus}
                className="block py-3 px-4 rounded-lg hover:bg-[rgba(107,91,71,0.08)] hover:text-[var(--link-olive)] transition-all duration-200 border-l-4 border-transparent hover:border-[var(--link-olive)]"
              >
                Commissions
              </Link>
            </li>
            <li>
              <Link 
                href="/contact" 
                onClick={closeMenus}
                className="block py-3 px-4 rounded-lg hover:bg-[rgba(107,91,71,0.08)] hover:text-[var(--link-olive)] transition-all duration-200 border-l-4 border-transparent hover:border-[var(--link-olive)]"
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
