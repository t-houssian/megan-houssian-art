// components/AboutSection.tsx

import Image from 'next/image';

export default function AboutSection() {
  return (
    <section 
      id="about" 
      className="py-16 px-4 bg-white"
    >
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        {/* Example placeholder image */}
        <div className="order-2 md:order-1">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            About Megan
          </h2>
          <p className="text-gray-600 leading-relaxed mb-6">
            Megan Houssian is a contemporary artist known for 
            her vibrant color palette and expressive brushstrokes. 
            Drawing inspiration from the beauty of everyday life 
            and the emotions that shape our experiences, her artwork 
            resonates with a sense of depth and authenticity.
          </p>
          <p className="text-gray-600 leading-relaxed">
            Whether it's a textured abstract piece or a serene 
            landscape, Megan’s art seeks to capture fleeting moments 
            of inspiration and transform them into timeless visual stories.
          </p>
        </div>
        <div className="order-1 md:order-2">
          <div className="relative w-full h-96 md:h-[30rem] bg-gray-100 rounded-lg overflow-hidden">
            <Image
              src="https://via.placeholder.com/800x1000.png" // Replace with an actual portrait or artwork
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
