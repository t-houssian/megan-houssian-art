// components/NavBar.tsx
"use client";

import Link from 'next/link';
import { useState } from 'react';
import { cormorant, lora } from '../fonts';
import CartLink from './CartLink';

export default function NavBar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isDesktopOriginalsOpen, setIsDesktopOriginalsOpen] = useState(false);
  const [isMobileOriginalsOpen, setIsMobileOriginalsOpen] = useState(false);

  // Temporary toggle: set to `true` when you're ready to restore the Originals submenu.
  const enableOriginalsSubmenu = false;

  const originalsLinks = [
    { label: 'Originals', href: '/originals' },
    // { label: 'Prints', href: '/prints' },
  ];

  const closeMenus = () => {
    setIsOpen(false);
    setIsDesktopOriginalsOpen(false);
    setIsMobileOriginalsOpen(false);
  };

  return (
    <header className="relative z-50 border-b border-[color:var(--border-tan-soft)] bg-[var(--nav-bg)]">
      <nav className="relative max-w-7xl mx-auto px-6 py-4 flex items-center justify-between overflow-visible">
        <div className={`${cormorant.className} shrink-0 text-2xl font-light text-[var(--text-brown)] tracking-wide hover:text-[var(--link-olive)] transition-colors duration-300 sm:text-3xl`}>
          <Link href="/" className="flex items-center space-x-2">
            <span className="whitespace-nowrap">Megan Houssian Art</span>
          </Link>
        </div>
        
        <div className="flex items-center gap-2 md:hidden">
          <CartLink
            label="Cart"
            className={`${lora.className} inline-flex h-10 items-center rounded-md border border-[color:var(--border-tan-medium)] px-3 text-sm font-medium text-[var(--text-brown)] transition-colors duration-200 hover:border-[var(--link-olive)] hover:bg-[var(--link-olive-hover-bg)] hover:text-[var(--link-olive)]`}
          />
          <button
            className="focus:outline-none p-2 rounded-lg hover:bg-[var(--link-olive-hover-bg)] transition-colors duration-200"
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
        </div>
        
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
          {enableOriginalsSubmenu ? (
            <li className="relative">
              <button
                type="button"
                onClick={() => setIsDesktopOriginalsOpen((prev) => !prev)}
                aria-expanded={isDesktopOriginalsOpen}
                aria-haspopup="menu"
                className={`relative group inline-flex h-10 items-center gap-0.5 border transition-colors duration-300 ${
                  isDesktopOriginalsOpen
                    ? '-mx-2 rounded-t-md border-[color:var(--border-tan-medium)] border-b-[var(--nav-bg)] bg-[var(--nav-bg)] px-3 text-[var(--text-brown)] z-40'
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
                className={`absolute left-1/2 top-full z-30 w-56 -translate-x-1/2 origin-top overflow-hidden rounded-b-md border border-t-0 border-[color:var(--border-tan-medium)] bg-[var(--nav-bg)] shadow-md transition-all duration-150 ${
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
                    className="block px-4 py-2.5 text-sm text-[var(--text-brown)] hover:bg-[var(--link-olive-hover-bg)] hover:text-[var(--link-olive)] transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </li>
          ) : (
            <li>
              <Link
                href="/originals"
                onClick={() => setIsDesktopOriginalsOpen(false)}
                className="relative group inline-flex h-10 items-center px-1 hover:text-[var(--link-olive)] transition-colors duration-300"
              >
                Originals
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[var(--link-olive)] transition-all duration-300 group-hover:w-full"></span>
              </Link>
            </li>
          )}
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
          <li>
            <CartLink
              onClick={() => setIsDesktopOriginalsOpen(false)}
              className="relative group inline-flex h-10 items-center px-1 hover:text-[var(--link-olive)] transition-colors duration-300"
            />
          </li>
        </ul>
      </nav>
      
      {isOpen && (
        <div className="md:hidden px-6 pb-4 bg-[var(--nav-bg)] border-t border-[color:var(--border-tan-soft)]">
          <ul className={`flex flex-col space-y-3 text-[var(--text-brown)] font-medium ${lora.className} pt-4`}>
            <li>
              <Link 
                href="/about" 
                onClick={closeMenus}
                className="block py-3 px-4 rounded-lg hover:bg-[var(--link-olive-hover-bg)] hover:text-[var(--link-olive)] transition-all duration-200 border-l-4 border-transparent hover:border-[var(--link-olive)]"
              >
                About
              </Link>
            </li>
            <li>
              <Link 
                href="/#gallery" 
                onClick={closeMenus}
                className="block py-3 px-4 rounded-lg hover:bg-[var(--link-olive-hover-bg)] hover:text-[var(--link-olive)] transition-all duration-200 border-l-4 border-transparent hover:border-[var(--link-olive)]"
              >
                Gallery
              </Link>
            </li>
            {enableOriginalsSubmenu ? (
              <li>
                <button
                  type="button"
                  onClick={() => setIsMobileOriginalsOpen((prev) => !prev)}
                  className="w-full text-left flex items-center justify-between py-3 px-4 rounded-lg hover:bg-[var(--link-olive-hover-bg)] hover:text-[var(--link-olive)] transition-all duration-200 border-l-4 border-transparent hover:border-[var(--link-olive)]"
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
                  <ul className="mt-1 ml-4 space-y-1 rounded-md border border-[color:var(--border-tan-soft)] bg-[var(--nav-bg)] p-2">
                    {originalsLinks.map((link) => (
                      <li key={link.href}>
                        <Link
                          href={link.href}
                          onClick={closeMenus}
                          className="block rounded-md py-2 px-3 text-sm hover:bg-[var(--link-olive-hover-bg)] hover:text-[var(--link-olive)] transition-colors duration-200"
                        >
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ) : (
              <li>
                <Link
                  href="/originals"
                  onClick={closeMenus}
                  className="block py-3 px-4 rounded-lg hover:bg-[var(--link-olive-hover-bg)] hover:text-[var(--link-olive)] transition-all duration-200 border-l-4 border-transparent hover:border-[var(--link-olive)]"
                >
                  Originals
                </Link>
              </li>
            )}
            {/* <li>
              <Link 
                href="/prints" 
                onClick={() => setIsOpen(false)} 
                className="block py-3 px-4 rounded-lg hover:bg-[var(--link-olive-hover-bg)] hover:text-[var(--link-olive)] transition-all duration-200 border-l-4 border-transparent hover:border-[var(--link-olive)]"
              >
                Prints
              </Link>
            </li> */}
            <li>
              <Link 
                href="/commissions" 
                onClick={closeMenus}
                className="block py-3 px-4 rounded-lg hover:bg-[var(--link-olive-hover-bg)] hover:text-[var(--link-olive)] transition-all duration-200 border-l-4 border-transparent hover:border-[var(--link-olive)]"
              >
                Commissions
              </Link>
            </li>
            <li>
              <Link 
                href="/contact" 
                onClick={closeMenus}
                className="block py-3 px-4 rounded-lg hover:bg-[var(--link-olive-hover-bg)] hover:text-[var(--link-olive)] transition-all duration-200 border-l-4 border-transparent hover:border-[var(--link-olive)]"
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
