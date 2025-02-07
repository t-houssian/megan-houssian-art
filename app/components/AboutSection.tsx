// components/AboutSection.tsx
import Image from 'next/image';

export default function AboutSection() {
  return (
    <section id="about" className="py-16 px-4 bg-white">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-8 items-center">
        <div>
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
        <div className="md:justify-self-end">
          <div className="relative w-full h-96 md:h-[32rem] bg-gray-100 rounded-lg overflow-hidden shadow-lg">
            <Image
              src="https://plus.unsplash.com/premium_photo-1670104282043-3e796b7597a2?fm=jpg&q=60&w=3000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8bW91bnRhaW4lMjBzY2FwZXxlbnwwfHwwfHx8MA%3D%3D" // Replace with real image
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
