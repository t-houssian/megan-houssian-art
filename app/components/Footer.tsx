// components/Footer.tsx
import Link from 'next/link';
import { lora, cormorant } from "../fonts";

export default function Footer() {
    return (
      <footer className="bg-gradient-to-r from-paper via-ivory to-paper border-t border-tan/30">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            {/* Brand Section */}
            <div className="text-center md:text-left">
              <h3 className={`${cormorant.className} text-2xl font-medium text-brown mb-4`}>
                Megan Houssian Art
              </h3>
              <p className={`${lora.className} text-warm-gray leading-relaxed text-sm`}>
                Creating unique art that brings beauty and inspiration to your everyday spaces.
              </p>
            </div>

            {/* Quick Links */}
            <div className="text-center">
              <h4 className={`${cormorant.className} text-lg font-medium text-brown mb-4`}>
                Explore
              </h4>
              <div className="space-y-2">
                <Link href="/#gallery" className={`block text-warm-gray hover:text-olive transition-colors duration-200 ${lora.className} text-sm`}>
                  Collections
                </Link>
                <Link href="/originals" className={`block text-warm-gray hover:text-olive transition-colors duration-200 ${lora.className} text-sm`}>
                  Original Artworks
                </Link>
                <a href="/commissions" className={`block text-warm-gray hover:text-olive transition-colors duration-200 ${lora.className} text-sm`}>
                  Commissions
                </a>
                <a href="/about" className={`block text-warm-gray hover:text-olive transition-colors duration-200 ${lora.className} text-sm`}>
                  About the Artist
                </a>
              </div>
            </div>

            {/* Contact & Social */}
            <div className="text-center md:text-right">
              <h4 className={`${cormorant.className} text-lg font-medium text-brown mb-4`}>
                Connect
              </h4>
              <div className="space-y-3">
                <div className="flex flex-col space-y-2">
                  {/* <a
                    href="https://instagram.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`text-warm-gray hover:text-olive transition-colors duration-200 ${lora.className} text-sm flex items-center justify-center md:justify-end space-x-2`}
                  >
                    <span>📸</span>
                    <span>Instagram</span>
                  </a> */}
                  <a
                    href="https://www.facebook.com/marketplace/profile/61550348800548/?ref=permalink&mibextid=6ojiHh"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`text-warm-gray hover:text-olive transition-colors duration-200 ${lora.className} text-sm flex items-center justify-center md:justify-end space-x-2`}
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                    <span>Facebook</span>
                  </a>
                  <Link
                    href="/contact"
                    className={`text-warm-gray hover:text-olive transition-colors duration-200 ${lora.className} text-sm flex items-center justify-center md:justify-end space-x-2`}
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
                      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
                    </svg>
                    <span>Get in Touch</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-tan/30 pt-8">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <p className={`text-warm-gray text-xs mb-3 md:mb-0 ${lora.className}`}>
                &copy; {new Date().getFullYear()} Megan Houssian. All rights reserved.
              </p>
              <p className={`text-warm-gray text-xs ${lora.className}`}>
                Marble Falls, Texas
              </p>
            </div>
          </div>
        </div>
      </footer>
    );
  }
  