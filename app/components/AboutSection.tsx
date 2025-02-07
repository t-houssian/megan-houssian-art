// components/AboutSection.tsx
import Image from 'next/image';
import { playfair } from '../fonts';

export default function AboutSection() {
  return (
    <section id="about" className="py-16 px-4 bg-white">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <div>
          <h2 className={`${playfair.className} text-3xl md:text-4xl font-semibold text-gray-900 mb-4`}>
            About Megan
          </h2>
          <p className="text-gray-700 leading-relaxed mb-6">
            Megan Houssian is a contemporary artist known for 
            her vibrant color palette and expressive brushstrokes. 
            Drawing inspiration from everyday life and the emotions 
            that shape our experiences, her artwork exudes depth and authenticity.
          </p>
          <p className="text-gray-700 leading-relaxed">
            Whether it's a textured abstract piece or a serene landscape, 
            Megan’s art captures fleeting moments of inspiration, 
            transforming them into timeless visual stories.
          </p>
        </div>
        <div>
          <div className="relative w-full h-96 md:h-[32rem] bg-gray-100 rounded-lg overflow-hidden shadow-md">
            <Image
              src="https://via.placeholder.com/800x1000.png" // Replace with real portrait or piece
              alt="Megan Houssian"
              fill
              style={{ objectFit: 'cover' }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
