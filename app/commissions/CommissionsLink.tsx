// ── ./commissions/CommissionsLink.tsx ──
"use client";

import { cormorant, lora } from '../fonts';

export default function CommissionsLink() {
  return (
    <section 
      id="contact"
      className="py-16 px-4 bg-accent-cream text-center border-y border-tan"
    >
      <h2 className={`${cormorant.className} text-3xl md:text-4xl font-bold text-brown mb-4`}>
        Interested in a Commission?
      </h2>
      <p className={`${lora.className} text-brown mb-8 max-w-2xl mx-auto`}>
        I create custom artwork at a rate of <b>$0.33 per square inch</b>. 
        Let me know your desired style, size, and details, and we&apos;ll make it happen.
      </p>
      <a
        href="/commissions"
        className={`inline-block bg-btn-brown text-paper px-8 py-3 rounded-full font-semibold 
                   hover:bg-btn-brown-hover transition-colors duration-300 ${lora.className}`}
      >
        Commission a Piece
      </a>
    </section>
  );
}
