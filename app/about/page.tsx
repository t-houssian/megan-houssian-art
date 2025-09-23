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
          <div className="flex justify-center md:justify-end">
            <div className="group relative w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl">
              <div
                className="absolute -inset-4 hidden md:block -z-10 rounded-[2rem] bg-gradient-to-br from-white via-amber-50/70 to-transparent blur-2xl opacity-90"
                aria-hidden="true"
              ></div>
              <figure className="relative aspect-[3/4] md:aspect-[4/5] overflow-hidden rounded-[1.5rem] border border-tan shadow-[0_35px_65px_-35px_rgba(80,64,50,0.55)] bg-white/40">
                <Image
                  src="/images/about.JPEG"
                  alt="Megan Houssian"
                  fill
                  className="object-cover transition-transform duration-[1800ms] ease-out group-hover:scale-[1.03]"
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
