// components/Footer.tsx
import Link from 'next/link';
import { lora, cormorant } from "../fonts";
import type { FooterContent } from '../../sanity/lib/siteContent';

type FooterProps = {
  content: FooterContent;
};

const INSTAGRAM_URL = 'https://www.instagram.com/meganhoussianart/';

export default function Footer({ content }: FooterProps) {
    return (
      <footer className="bg-gradient-to-r from-paper via-ivory to-paper border-t border-tan/30">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            {/* Brand Section */}
            <div className="text-center md:text-left">
              <h3 className={`${cormorant.className} text-2xl font-medium text-brown mb-4`}>
                {content.brandTitle}
              </h3>
              <p className={`${lora.className} text-warm-gray leading-relaxed text-sm`}>
                {content.brandDescription}
              </p>
            </div>

            {/* Quick Links */}
            <div className="text-center">
              <h4 className={`${cormorant.className} text-lg font-medium text-brown mb-4`}>
                {content.exploreHeading}
              </h4>
              <div className="space-y-2">
                <Link href="/#gallery" className={`block text-warm-gray hover:text-olive transition-colors duration-200 ${lora.className} text-sm`}>
                  {content.galleryLabel}
                </Link>
                <Link href="/originals" className={`block text-warm-gray hover:text-olive transition-colors duration-200 ${lora.className} text-sm`}>
                  {content.originalsLabel}
                </Link>
                <a href="/commissions" className={`block text-warm-gray hover:text-olive transition-colors duration-200 ${lora.className} text-sm`}>
                  {content.commissionsLabel}
                </a>
                <a href="/about" className={`block text-warm-gray hover:text-olive transition-colors duration-200 ${lora.className} text-sm`}>
                  {content.aboutLabel}
                </a>
              </div>
            </div>

            {/* Contact & Social */}
            <div className="text-center md:text-right">
              <h4 className={`${cormorant.className} text-lg font-medium text-brown mb-4`}>
                {content.connectHeading}
              </h4>
              <div className="space-y-3">
                <div className="flex flex-col space-y-2">
                  <a
                    href={INSTAGRAM_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`text-warm-gray hover:text-olive transition-colors duration-200 ${lora.className} text-sm flex items-center justify-center md:justify-end space-x-2`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <rect x="3" y="3" width="18" height="18" rx="5" strokeWidth="2" />
                      <circle cx="12" cy="12" r="4" strokeWidth="2" />
                      <circle cx="17.5" cy="6.5" r="1.25" fill="currentColor" stroke="none" />
                    </svg>
                    <span>{content.instagramLabel}</span>
                  </a>
                  <a
                    href="https://pin.it/1Scq2kp48"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`text-warm-gray hover:text-olive transition-colors duration-200 ${lora.className} text-sm flex items-center justify-center md:justify-end space-x-2`}
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12.04 2C6.58 2 2 6.58 2 12.04c0 4.2 2.58 7.86 6.27 9.36-.09-.8-.17-2.03.03-2.9.18-.8 1.17-5.08 1.17-5.08s-.3-.6-.3-1.5c0-1.4.81-2.45 1.82-2.45.86 0 1.27.65 1.27 1.42 0 .87-.55 2.18-.83 3.4-.24 1.02.51 1.85 1.52 1.85 1.82 0 3.22-1.92 3.22-4.68 0-2.45-1.76-4.16-4.27-4.16-2.91 0-4.62 2.18-4.62 4.43 0 .87.34 1.8.75 2.3.08.1.09.2.07.31-.07.34-.23 1.09-.26 1.24-.04.2-.14.24-.33.14-1.23-.57-2-2.36-2-3.8 0-3.1 2.25-5.95 6.5-5.95 3.41 0 6.06 2.43 6.06 5.68 0 3.39-2.14 6.12-5.12 6.12-1 0-1.94-.52-2.26-1.13l-.62 2.36c-.22.86-.82 1.93-1.22 2.58.92.28 1.9.43 2.93.43 5.46 0 10.04-4.58 10.04-10.04C22.08 6.58 17.5 2 12.04 2z"/>
                    </svg>
                    <span>{content.pinterestLabel}</span>
                  </a>
                  <a
                    href="https://www.facebook.com/marketplace/profile/61550348800548/?ref=permalink&mibextid=6ojiHh"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`text-warm-gray hover:text-olive transition-colors duration-200 ${lora.className} text-sm flex items-center justify-center md:justify-end space-x-2`}
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                    <span>{content.facebookLabel}</span>
                  </a>
                  <Link
                    href="/contact"
                    className={`text-warm-gray hover:text-olive transition-colors duration-200 ${lora.className} text-sm flex items-center justify-center md:justify-end space-x-2`}
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
                      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
                    </svg>
                    <span>{content.contactLabel}</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-tan/30 pt-8">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <p className={`text-warm-gray text-xs mb-3 md:mb-0 ${lora.className}`}>
                &copy; {new Date().getFullYear()} {content.copyrightName}. All rights reserved.
              </p>
              <p className={`text-warm-gray text-xs ${lora.className}`}>
                {content.location}
              </p>
            </div>
          </div>
        </div>
      </footer>
    );
  }
  
