// ── ./contact/ContactLink.tsx ──
"use client";

import { cormorant, lora } from '../fonts';

export default function ContactLink() {
  return (
    <section 
      className="py-16 px-4 bg-paper text-center"
    >
      <h2 className={`${cormorant.className} text-3xl md:text-4xl font-bold text-brown mb-4`}>
        Contact the Artist
      </h2>
      <p className={`${lora.className} text-brown mb-8 max-w-2xl mx-auto`}>
        Fill out the form below or email me at{" "}
        <a 
          href="mailto:meganhoussianart@gmail.com" 
          className="underline text-olive hover:text-brown"
        >
          meganhoussianart@gmail.com
        </a>
      </p>
      <a
        href="/contact"
        className={`inline-block bg-btn-brown text-paper px-8 py-3 rounded-full font-semibold 
                   hover:bg-btn-brown-hover transition-colors duration-300 ${lora.className}`}
      >
        Go to Contact Page
      </a>
    </section>
  );
}
