// ── ./commissions/CommissionsLink.tsx ──
"use client";

import { cormorant, lora } from '../fonts';

export default function CommissionsLink() {
  return (
    <section 
      id="contact"
      className="py-16 px-4 bg-accent-cream text-center border-y border-tan"
    >
      <h2 className={`${cormorant.className} text-3xl md:text-4xl font-medium text-brown mb-4`}>
        Interested in a Commission?
      </h2>
      <p className={`${lora.className} text-brown mb-8 max-w-2xl font-light mx-auto`}>
        I create custom artwork at a rate of <b>$1 per square inch</b>. 
        Let me know your desired style, size, and details, and I&apos;ll get back to you.
      </p>
      <a
        href="/commissions"
        className={`inline-block bg-gradient-to-r from-btn-brown to-btn-brown-hover text-paper px-8 py-3 rounded-full font-medium 
                   shadow-vintage hover:shadow-vintage-lg transition-all duration-500 hover:-translate-y-0.5 
                   border border-paper/20 relative overflow-hidden group ${lora.className}`}
      >
        <span className="relative z-10">Commission a Piece</span>
        <span className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-paper to-transparent 
                        opacity-0 group-hover:opacity-10 transform -skew-x-12 -translate-x-full 
                        group-hover:translate-x-full transition-all duration-700" />
      </a>
    </section>
  );
}
