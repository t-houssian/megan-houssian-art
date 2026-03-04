// app/prints/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { sanityClient } from '../../lib/sanity';
import ImageUrlBuilder from '@sanity/image-url';
import Link from 'next/link';
import Image from 'next/image';
import { cormorant, lora } from '../fonts';
import { formatRoundedDollars } from '../../lib/money';

const builder = ImageUrlBuilder(sanityClient);
function urlFor(source: { asset: { _ref: string } }) {
  return builder.image(source);
}

type PrintProduct = {
  _id: string;
  title: string;
  slug: { current: string };
  mainImage?: {
    asset: { _ref: string };
  };
  price?: number;
  soldOut?: boolean;
};

async function fetchPrints(): Promise<PrintProduct[]> {
  const query = `
    *[_type == "print" && defined(slug.current)]{
      _id,
      title,
      "slug": slug,
      mainImage,
      price,
      soldOut
    } | order(_createdAt desc)
  `;
  return sanityClient.fetch(query);
}

export default function PrintsPage() {
  const [prints, setPrints] = useState<PrintProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const printsData = await fetchPrints();
        setPrints(printsData);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-ivory via-paper to-accent-cream flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-olive mx-auto mb-4"></div>
          <p className={`${lora.className} text-brown`}>Loading prints...</p>
        </div>
      </div>
    );
  }

  return (
    <section className="min-h-screen bg-gradient-to-br from-ivory via-paper to-accent-cream">
      <div className="max-w-7xl mx-auto py-16 px-6">
        {/* Elegant Header */}
        <div className="text-center mb-12">
          <h1 className={`${cormorant.className} text-4xl md:text-5xl font-light mb-6 text-brown tracking-wide`}>
            Print Shop
          </h1>
        </div>


        {/* Gallery Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {prints.map((item) => (
            <Link 
              key={item._id} 
              href={`/prints/${item.slug.current}`}
            >
              <div className="group cursor-pointer">
                <div className="bg-white/80 backdrop-blur-sm border border-tan/30 rounded-2xl overflow-hidden shadow-vintage hover:shadow-vintage-lg transition-all duration-500 transform hover:-translate-y-2">
                  {item.mainImage?.asset && (
                    <div className="relative w-full h-80 overflow-hidden bg-paper">
                      <Image
                        src={urlFor(item.mainImage).width(600).height(600).url()}
                        alt={item.title}
                        fill
                        style={{ objectFit: 'cover' }}
                        className="transition-transform duration-700 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300"></div>
                      {item.soldOut && (
                        <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium shadow-lg">
                          SOLD OUT
                        </div>
                      )}
                    </div>
                  )}
                  
                  <div className="p-6">
                    <h2 className={`${cormorant.className} text-2xl font-medium mb-3 text-brown group-hover:text-olive transition-colors duration-300`}>
                      {item.title}
                    </h2>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <p className={`${lora.className} text-sm text-warm-gray mb-1`}>
                          Multiple print options available · Free shipping
                        </p>
                        <p className={`${lora.className} text-lg font-medium text-brown`}>
                          Starting at {formatRoundedDollars(15)}
                        </p>
                      </div>
                      
                      {!item.soldOut && (
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <span className="text-olive text-sm font-medium">View Options →</span>
                        </div>
                      )}
                    </div>
                    
                    {item.soldOut && (
                      <div className="mt-2">
                        <span className="text-red-600 font-medium text-sm">
                          Currently unavailable
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Footer Message */}
        <div className="text-center mt-16">
          <div className="bg-white/60 backdrop-blur-sm border border-tan/30 rounded-2xl p-8 max-w-2xl mx-auto">
            <p className={`${lora.className} text-warm-gray leading-relaxed mb-4`}>
              Looking for something unique and original? Explore one-of-a-kind pieces or commission a custom piece.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/originals">
                <button className={`bg-gradient-to-r from-btn-brown to-btn-brown-hover text-paper px-8 py-4 rounded-lg hover:from-btn-brown-hover hover:to-brown transition-all duration-500 font-serif text-lg shadow-vintage hover:shadow-vintage-lg transform hover:-translate-y-1 border border-opacity-20 border-paper relative overflow-hidden group ${lora.className}`}>
                  <span className="relative z-10">View Originals</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-paper to-transparent opacity-0 group-hover:opacity-10 transform -skew-x-12 group-hover:translate-x-full transition-all duration-700"></div>
                </button>
              </Link>
              <Link href="/commissions">
                <button className={`bg-gradient-to-r from-btn-brown to-btn-brown-hover text-paper px-8 py-4 rounded-lg hover:from-btn-brown-hover hover:to-brown transition-all duration-500 font-serif text-lg shadow-vintage hover:shadow-vintage-lg transform hover:-translate-y-1 border border-opacity-20 border-paper relative overflow-hidden group ${lora.className}`}>
                  <span className="relative z-10">Commission Art</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-paper to-transparent opacity-0 group-hover:opacity-10 transform -skew-x-12 group-hover:translate-x-full transition-all duration-700"></div>
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
