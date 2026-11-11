'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import type { OriginalCollectionLink } from '../../lib/original-collections';
import { cormorant, lora } from '../fonts';
import CartLink from './CartLink';

const DESKTOP_LINK_CLASS =
  'relative group inline-flex h-10 items-center px-1 hover:text-[var(--link-olive)] transition-colors duration-300';
const MOBILE_LINK_CLASS =
  'block py-3 px-4 rounded-lg hover:bg-[var(--link-olive-hover-bg)] hover:text-[var(--link-olive)] transition-all duration-200 border-l-4 border-transparent hover:border-[var(--link-olive)]';
const SECONDARY_LINKS = [
  { label: 'Commissions', href: '/commissions' },
  { label: 'Contact', href: '/contact' },
];

export default function NavBar({ originalCollections }: { originalCollections: OriginalCollectionLink[] }) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isDesktopOriginalsOpen, setIsDesktopOriginalsOpen] = useState(false);
  const originalsRef = useRef<HTMLLIElement>(null);
  const desktopToggleRef = useRef<HTMLButtonElement>(null);
  const mobileToggleRef = useRef<HTMLButtonElement>(null);

  const closeMenus = () => {
    setIsOpen(false);
    setIsDesktopOriginalsOpen(false);
  };

  useEffect(() => {
    if (!isOpen && !isDesktopOriginalsOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      event.preventDefault();
      if (isDesktopOriginalsOpen) {
        setIsDesktopOriginalsOpen(false);
        desktopToggleRef.current?.focus();
      }
      if (isOpen) {
        setIsOpen(false);
        mobileToggleRef.current?.focus();
      }
    };
    const handlePointerDown = (event: PointerEvent) => {
      if (isDesktopOriginalsOpen && !originalsRef.current?.contains(event.target as Node)) {
        setIsDesktopOriginalsOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('pointerdown', handlePointerDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('pointerdown', handlePointerDown);
    };
  }, [isOpen, isDesktopOriginalsOpen]);

  return (
    <header className="relative z-50 border-b border-[color:var(--border-tan-soft)] bg-[var(--nav-bg)]">
      <nav aria-label="Main navigation" className="relative max-w-7xl mx-auto px-6 py-4 flex items-center justify-between overflow-visible">
        <div className={`${cormorant.className} shrink-0 text-xl font-light text-[var(--text-brown)] tracking-wide hover:text-[var(--link-olive)] transition-colors duration-300 sm:text-3xl`}>
          <Link href="/" onClick={closeMenus} className="flex items-center space-x-2">
            <span className="whitespace-nowrap">Megan Houssian Art</span>
          </Link>
        </div>

        <div className="flex items-center gap-2 lg:hidden">
          <CartLink
            label="Cart"
            onClick={closeMenus}
            className={`${lora.className} inline-flex h-10 w-10 items-center justify-center rounded-full border border-transparent text-[var(--text-brown)]/80 transition-colors duration-200 hover:bg-[var(--link-olive-hover-bg)]/70 hover:text-[var(--link-olive)]`}
          />
          <button
            ref={mobileToggleRef}
            type="button"
            className="p-2 rounded-lg hover:bg-[var(--link-olive-hover-bg)] transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--link-olive)]"
            onClick={() => setIsOpen((prev) => !prev)}
            aria-label="Toggle Menu"
            aria-expanded={isOpen}
            aria-controls="mobile-navigation"
          >
            <svg className="h-6 w-6 text-[var(--text-brown)]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={isOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'} />
            </svg>
          </button>
        </div>

        <ul className={`hidden lg:flex space-x-8 text-[var(--text-brown)] font-medium ${lora.className}`}>
          {[{ label: 'Gallery', href: '/#gallery' }, { label: 'About', href: '/about' }].map((link) => (
            <li key={link.href}>
              <Link href={link.href} onClick={closeMenus} className={DESKTOP_LINK_CLASS}>
                {link.label}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[var(--link-olive)] transition-all duration-300 group-hover:w-full" />
              </Link>
            </li>
          ))}
          <li ref={originalsRef} className="relative">
            {originalCollections.length > 0 ? (
              <>
                <button
                  ref={desktopToggleRef}
                  type="button"
                  onClick={() => setIsDesktopOriginalsOpen((prev) => !prev)}
                  aria-expanded={isDesktopOriginalsOpen}
                  aria-controls="desktop-originals-navigation"
                  className={`relative group inline-flex h-10 items-center gap-0.5 border transition-colors duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--link-olive)] ${
                    isDesktopOriginalsOpen
                      ? '-mx-2 rounded-t-md border-[color:var(--border-tan-medium)] border-b-[var(--nav-bg)] bg-[var(--nav-bg)] px-3 text-[var(--text-brown)] z-40'
                      : 'border-transparent px-1 hover:text-[var(--link-olive)]'
                  }`}
                >
                  Originals
                  <svg className={`h-4 w-4 transition-transform duration-200 ${isDesktopOriginalsOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                  <span className={`absolute bottom-0 left-0 h-0.5 bg-[var(--link-olive)] transition-all duration-300 ${isDesktopOriginalsOpen ? 'w-full' : 'w-0 group-hover:w-full'}`} />
                </button>
                <ul
                  id="desktop-originals-navigation"
                  hidden={!isDesktopOriginalsOpen}
                  className="absolute left-1/2 top-full z-30 w-56 -translate-x-1/2 overflow-hidden rounded-b-md border border-t-0 border-[color:var(--border-tan-medium)] bg-[var(--nav-bg)] shadow-md"
                >
                  {originalCollections.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        onClick={closeMenus}
                        aria-current={pathname === link.href ? 'page' : undefined}
                        className={`block px-4 py-2.5 text-sm hover:bg-[var(--link-olive-hover-bg)] hover:text-[var(--link-olive)] transition-colors duration-200 ${pathname === link.href ? 'text-[var(--link-olive)]' : 'text-[var(--text-brown)]'}`}
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <Link href="/originals" onClick={closeMenus} className={DESKTOP_LINK_CLASS}>
                Originals
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[var(--link-olive)] transition-all duration-300 group-hover:w-full" />
              </Link>
            )}
          </li>
          {SECONDARY_LINKS.map((link) => (
            <li key={link.href}>
              <Link href={link.href} onClick={closeMenus} className={DESKTOP_LINK_CLASS}>
                {link.label}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[var(--link-olive)] transition-all duration-300 group-hover:w-full" />
              </Link>
            </li>
          ))}
          <li>
            <CartLink onClick={closeMenus} className={DESKTOP_LINK_CLASS} />
          </li>
        </ul>
      </nav>

      <div id="mobile-navigation" hidden={!isOpen} className="lg:hidden px-6 pb-4 bg-[var(--nav-bg)] border-t border-[color:var(--border-tan-soft)]">
        <ul className={`flex flex-col space-y-3 text-[var(--text-brown)] font-medium ${lora.className} pt-4`}>
          {[{ label: 'About', href: '/about' }, { label: 'Gallery', href: '/#gallery' }].map((link) => (
            <li key={link.href}>
              <Link href={link.href} onClick={closeMenus} className={MOBILE_LINK_CLASS}>
                {link.label}
              </Link>
            </li>
          ))}
          <li>
            <Link href="/originals" onClick={closeMenus} className={MOBILE_LINK_CLASS}>
              Originals
            </Link>
            {originalCollections.length > 0 && (
              <ul className="ml-6 space-y-1">
                {originalCollections.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      onClick={closeMenus}
                      aria-current={pathname === link.href ? 'page' : undefined}
                      className={`block rounded-lg px-4 py-3 text-sm hover:bg-[var(--link-olive-hover-bg)] hover:text-[var(--link-olive)] transition-colors duration-200 ${pathname === link.href ? 'text-[var(--link-olive)]' : 'text-[var(--text-brown)]'}`}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </li>
          {SECONDARY_LINKS.map((link) => (
            <li key={link.href}>
              <Link href={link.href} onClick={closeMenus} className={MOBILE_LINK_CLASS}>
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </header>
  );
}
