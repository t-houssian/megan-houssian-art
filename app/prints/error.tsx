'use client';

import { useEffect } from 'react';
import { cormorant, lora } from '../fonts';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Prints page error:', error);
  }, [error]);

  return (
    <section className="min-h-screen bg-ivory py-16 px-6">
      <div className="max-w-2xl mx-auto">
        <div className="border-y border-tan/40 py-10 text-center">
          <div className="text-red-600 mb-6">
            <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 14.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h1 className={`${cormorant.className} text-3xl font-medium text-brown mb-4`}>
            Something went wrong
          </h1>
          <p className={`${lora.className} text-warm-gray mb-6`}>
            We encountered an error while loading the prints page.
          </p>
          <button 
            onClick={reset}
            className={`${lora.className} border border-btn-brown bg-btn-brown px-8 py-3 text-paper transition-colors duration-300 hover:bg-btn-brown-hover`}
          >
            Try Again
          </button>
        </div>
      </div>
    </section>
  );
}
