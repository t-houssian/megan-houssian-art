// app/about/page.tsx
import Image from 'next/image';
import { cormorant, lora } from "../fonts";

export const metadata = {
  title: 'About - Megan Houssian Art',
  description: 'Learn about artist Megan Houssian and her artistic journey',
};

export default function AboutPage() {
  return (
    <section className="py-16 px-4 bg-paper min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-16">
          <div>
            <h1 className={`${cormorant.className} text-4xl md:text-5xl font-bold text-brown mb-6`}>
              About Megan
            </h1>
            <p className={`${lora.className} text-brown leading-relaxed mb-6 text-lg`}>
              When I step into the painting process, I feel a deep sense of joy and calm.
              Time seems to pause as I release expectations and immerse myself in the
              rhythm of creation. Afterwards, I leave my studio with a renewed clarity
              and everything around me feels more vibrant.
            </p>
            <p className={`${lora.className} text-brown leading-relaxed mb-6 text-lg`}>
              Returning to the routines of life, I carry with me
              a heightened sense of gratitude. My art is, at its core, an expression
              of joyrooted in the blessings of family and in God.
            </p>
          </div>
          <div>
            <div className="relative w-full h-96 md:h-[32rem] bg-ivory rounded-lg overflow-hidden shadow-lg border border-tan">
              <Image
                src="/images/about.jpg"
                alt="Megan Houssian"
                fill
                style={{ objectFit: 'cover' }}
              />
            </div>
          </div>
        </div>

        {/* Additional content section */}
        {/* <div className="bg-ivory border border-tan rounded-lg p-8">
          <h2 className={`${cormorant.className} text-3xl font-semibold text-brown mb-6`}>
            My Artistic Journey
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className={`${lora.className} text-xl font-semibold text-brown mb-3`}>
                Inspiration & Process
              </h3>
              <p className={`${lora.className} text-brown leading-relaxed`}>
                My artistic process begins with observation of the natural world around me. 
                Living in the Texas Hill Country provides endless inspiration through changing seasons, 
                wildflower blooms, and the interplay of light and shadow across the landscape.
              </p>
            </div>
            <div>
              <h3 className={`${lora.className} text-xl font-semibold text-brown mb-3`}>
                Medium & Technique
              </h3>
              <p className={`${lora.className} text-brown leading-relaxed`}>
                I work primarily with acrylics and mixed media, allowing for both spontaneous expression 
                and careful detail work. Each piece evolves organically, with layers building upon each other 
                to create depth and visual interest.
              </p>
            </div>
          </div>
        </div> */}
      </div>
    </section>
  );
}
