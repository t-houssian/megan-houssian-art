// components/CallToAction.tsx
"use client";
import { cormorant, lora } from "../fonts";

export default function CallToAction() {
  return (
    <section 
      id="contact" 
      className="py-16 px-4 bg-[var(--bg-paper)] text-[var(--text-brown)]"
    >
      <div className="max-w-4xl mx-auto text-center">
        <h2 className={`text-3xl md:text-4xl font-bold mb-4 ${cormorant.className}`}>
          Stay Connected
        </h2>
        <p className={`text-[var(--text-brown)] mb-8 ${lora.className}`}>
          Be the first to know about new artwork, upcoming exhibitions, and exclusive offers.
        </p>
        <form 
          onSubmit={(e) => e.preventDefault()} 
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <input
            type="email"
            placeholder="Enter your email"
            className={`w-full sm:w-1/2 px-4 py-3 rounded-sm text-[var(--text-brown)] bg-white border border-[var(--text-brown)]
                       focus:outline-none focus:ring-2 focus:ring-[var(--btn-brown)] ${lora.className}`}
            required
          />
          <button
            type="submit"
            className={`inline-block border border-[var(--btn-brown)] bg-[var(--btn-brown)] text-white px-6 py-3 rounded-sm font-semibold 
                       hover:bg-white hover:text-[var(--btn-brown)] transition-colors duration-300 ${lora.className}`}
          >
            Subscribe
          </button>
        </form>
      </div>
    </section>
  );
}
