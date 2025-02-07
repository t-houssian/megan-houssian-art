// components/Hero.tsx

import Image from 'next/image';
import { playfair } from '../fonts';

export default function Hero() {
  return (
    <section className="relative w-full h-[80vh] overflow-hidden">
      {/* Large background image */}
      <Image
        src="https://via.placeholder.com/2000x1200.png?text=Fine+Art+Hero+Image" // replace with a real hero
        alt="Hero Image"
        fill
        style={{ objectFit: 'cover' }}
        className="object-cover object-center"
      />
      {/* Overlay */}
      <div className="absolute inset-0 bg-white/50 backdrop-blur-sm"></div>

      <div className="relative z-10 flex items-center justify-center h-full">
        <div className="text-center max-w-3xl px-4">
          <h1 className={`${playfair.className} text-5xl sm:text-7xl font-bold text-gray-900 mb-6`}>
            Discover the Art of 
            <br />
            Megan Houssian
          </h1>
          <p className="text-lg sm:text-xl text-gray-800 mb-8 max-w-xl mx-auto">
            Contemporary paintings that capture the essence of beauty, emotion, and expression.
          </p>
          <a
            href="#gallery"
            className="inline-block border border-gray-900 text-gray-900 px-8 py-3 rounded-full text-base font-semibold
                       hover:bg-gray-900 hover:text-white transition-colors duration-300"
          >
            Explore the Gallery
          </a>
        </div>
      </div>
    </section>
  );
}
