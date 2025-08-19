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
    <section className="min-h-screen bg-gradient-to-br from-ivory via-paper to-accent-cream py-16 px-6">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white/90 backdrop-blur-sm border border-tan/30 rounded-2xl p-12 shadow-vintage-lg text-center">
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
            className={`${lora.className} px-8 py-3 bg-btn-brown text-paper rounded-xl hover:bg-btn-brown-hover transition-colors duration-300 shadow-vintage`}
          >
            Try Again
          </button>
        </div>
      </div>
    </section>
  );
}
