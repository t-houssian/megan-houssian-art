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
            <h1 className={`${cormorant.className} text-4xl md:text-5xl font-light text-brown mb-6`}>
              About Megan
            </h1>
            <p className={`${lora.className} text-brown leading-relaxed mb-6 text-lg`}>
              I’ve always loved to paint, but it truly came alive as a hobby after becoming a mom. There was a pull in me- almost an ache- to create. I started with small pieces, little studies of flowers and landscapes, and before long I was painting large-scale works to fill the walls of my own home. That simple beginning slowly grew into creating art for others. Along the way, I’ve had to remind myself to shift my focus away from the end product and back toward the joy of creating itself.
            </p>
            <p className={`${lora.className} text-brown leading-relaxed mb-6 text-lg`}>
              Painting brings a burst of joy into my heart. It adds depth and reflection to a life already full of blessings- my family, my faith, and the love that surrounds me. I feel profoundly grateful for the peace and purpose God has woven into both my art and my everyday life.
            </p>
          </div>
          <div className="flex justify-center md:justify-end">
            <div className="group relative w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl">
              <figure className="relative aspect-[3/4] md:aspect-[4/5] overflow-hidden bg-paper shadow-[0_28px_48px_-32px_rgba(40,34,28,0.4)]">
                <Image
                  src="/images/about.JPEG"
                  alt="Megan Houssian"
                  fill
                  className="object-cover transition-transform duration-[1600ms] ease-out group-hover:scale-[1.02]"
                  style={{ objectPosition: 'center top' }}
                  sizes="(min-width: 1024px) 40vw, (min-width: 768px) 45vw, 90vw"
                  priority
                />
              </figure>
            </div>
          </div>
        </div>

        {/* Additional content section */}
        {/* <div className="bg-ivory border border-tan rounded-lg p-8">
          <h2 className={`${cormorant.className} text-3xl font-medium text-brown mb-6`}>
            My Artistic Journey
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className={`${lora.className} text-xl font-medium text-brown mb-3`}>
                Inspiration & Process
              </h3>
              <p className={`${lora.className} text-brown leading-relaxed`}>
                My artistic process begins with observation of the natural world around me. 
                Living in the Texas Hill Country provides endless inspiration through changing seasons, 
                wildflower blooms, and the interplay of light and shadow across the landscape.
              </p>
            </div>
            <div>
              <h3 className={`${lora.className} text-xl font-medium text-brown mb-3`}>
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
