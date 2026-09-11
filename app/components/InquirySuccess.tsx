"use client";

import Link from 'next/link';
import { useEffect, useRef } from 'react';
import { cormorant, lora } from '../fonts';

export default function InquirySuccess({ type }: { type: 'contact' | 'commission' }) {
  const commission = type === 'commission';
  const headingRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    // Safari can retain the long form's scroll position during client navigation.
    window.scrollTo({ top: 0, behavior: 'instant' });
    headingRef.current?.focus({ preventScroll: true });
  }, [type]);
  return (
    <section className="flex min-h-[70vh] items-center justify-center bg-ivory px-6 py-20">
      <div className="max-w-2xl text-center">
        <h1 ref={headingRef} tabIndex={-1} className={`${cormorant.className} text-4xl md:text-5xl font-medium text-brown mb-6 outline-none`}>
          {commission ? 'Commission Request Sent' : 'Message Sent'}
        </h1>
        <p className={`${lora.className} text-brown leading-relaxed mb-4`}>
          {commission
            ? 'Thank you for your interest in a custom painting! Your request has been sent to Megan. She will follow up at the email address you provided to discuss your ideas, availability, and a final quote.'
            : 'Thank you for getting in touch! Your message has been sent to Megan. She will reply to the email address you provided as soon as she can.'}
        </p>
        {commission && <p className={`${lora.className} text-warm-gray leading-relaxed mb-4`}>This is an inquiry only. No payment has been taken.</p>}
        <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
          <Link href="/" className="bg-btn-brown text-paper px-6 py-3 rounded-md font-semibold hover:bg-btn-brown-hover transition-colors">Return Home</Link>
          <Link href="/originals" className="border border-btn-brown text-btn-brown px-6 py-3 rounded-md font-semibold hover:bg-btn-brown hover:text-paper transition-colors">Explore the Art</Link>
        </div>
      </div>
    </section>
  );
}
