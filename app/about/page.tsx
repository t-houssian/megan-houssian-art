// app/about/page.tsx
import Image from 'next/image';
import Link from 'next/link';
import { sanityClient } from '../../lib/sanity';
import { urlFor } from '../../sanity/lib/image';
import { cormorant, lora } from "../fonts";

export const metadata = {
  title: 'About - Megan Houssian Art',
  description: 'Learn about artist Megan Houssian and her artistic journey',
};

type AboutImageSettings = {
  aboutPageImage?: {
    asset?: {
      _ref: string;
    };
    alt?: string;
  };
};

const aboutImageQuery = `*[_type == "heroSettings"] | order(_updatedAt desc)[0]{
  aboutPageImage{
    asset,
    alt
  }
}`;

async function fetchAboutImageSettings(): Promise<AboutImageSettings | null> {
  try {
    return await sanityClient.fetch<AboutImageSettings | null>(aboutImageQuery, {}, { next: { revalidate: 60 } });
  } catch (error) {
    console.error('Failed to load about page image from Sanity', error);
    return null;
  }
}

export default async function AboutPage() {
  const imageSettings = await fetchAboutImageSettings();
  const aboutImageUrl = imageSettings?.aboutPageImage?.asset
    ? urlFor(imageSettings.aboutPageImage).fit('max').quality(95).format('jpg').url()
    : '/images/about.JPEG';
  const aboutImageAlt = imageSettings?.aboutPageImage?.alt?.trim() || 'Megan Houssian';

  return (
    <section className="py-16 px-4 bg-paper min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-16">
          <div>
            <h1 className={`${cormorant.className} text-4xl md:text-5xl font-light text-brown mb-6`}>
              About Megan
            </h1>
            <p className={`${lora.className} text-brown leading-relaxed mb-6 text-lg`}>
              Hi, I&apos;m Megan! I&apos;m a Texas Hill Country landscape painter, wife, and mama.
            </p>
            <p className={`${lora.className} text-brown leading-relaxed mb-6 text-lg`}>
              I&apos;ve loved creating all my life, and not just art. I learned to play three different instruments, and I&apos;ve been making crepes for family breakfasts since I was eight.
            </p>
            <p className={`${lora.className} text-brown leading-relaxed mb-6 text-lg`}>
              Fun fact: I actually started college as an art major... but I switched out on the very first day of class. I instinctively knew that turning art into an assignment would steal the joy from it.
            </p>
            <p className={`${lora.className} text-brown leading-relaxed mb-6 text-lg`}>
              Motherhood brought it all back in the best way. It inspired me to protect my time, get really honest about what I wanted, and build a life that makes room for creating. My faith in Jesus Christ is also a guiding light in my daily life.
            </p>
            <p className={`${lora.className} text-brown leading-relaxed mb-6 text-lg`}>
              During my daughter&apos;s nap time, you&apos;ll find me painting distant blue hills, wildflowers, and open skies. Or, on days that aren&apos;t 100 degrees (Texas summers are brutal), you&apos;ll find me &quot;cooking&quot; outside with my daughter, where we make leaf and dirt soup topped with flowers we find in our yard.
            </p>
            <p className={`${lora.className} text-brown leading-relaxed mb-6 text-lg`}>
              Whether you are drawn to the reverent landscapes, atmospheric skies, or the story of a happy mom who has found meaning in creation, welcome. If you&apos;d like first access to new work, studio updates, and shop restocks,{" "}
              <Link href="/#collector-early-access" className="underline text-olive hover:text-brown transition-colors">
                join my email list here
              </Link>{" "}
              so we can stay in touch.
            </p>
          </div>
          <div className="flex justify-center md:justify-end">
            <div className="group relative w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl">
              <figure className="relative aspect-[3/4] md:aspect-[4/5] overflow-hidden bg-paper shadow-[0_28px_48px_-32px_rgba(40,34,28,0.4)]">
                <Image
                  src={aboutImageUrl}
                  alt={aboutImageAlt}
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
