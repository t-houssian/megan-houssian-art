// components/Hero.tsx
import Image from 'next/image';
import { sanityClient } from '../../lib/sanity';
import { urlFor } from '../../sanity/lib/image';
import { cormorant, lora } from "../fonts";

type HeroSettings = {
  backgroundImage?: {
    asset?: {
      _ref: string;
    };
    alt?: string;
  };
};

const heroQuery = `*[_type == "heroSettings"][0]{
  backgroundImage{
    asset,
    alt
  }
}`;

async function fetchHeroSettings(): Promise<HeroSettings | null> {
  try {
    return await sanityClient.fetch<HeroSettings | null>(heroQuery, {}, { next: { revalidate: 60 } });
  } catch (error) {
    console.error('Failed to load hero settings from Sanity', error);
    return null;
  }
}

export default async function Hero() {
  const heroSettings = await fetchHeroSettings();

  const heroImageUrl = heroSettings?.backgroundImage?.asset
    ? urlFor(heroSettings.backgroundImage).width(2400).quality(80).url()
    : '/images/blueBG.jpg';

  const heroAlt = heroSettings?.backgroundImage?.alt?.trim() || 'Hero Image';

  return (
    <section className="relative w-full h-[80vh] overflow-hidden">
      <Image
        src={heroImageUrl}
        alt={heroAlt}
        fill
        style={{ objectFit: 'cover' }}
        className="object-cover object-center"
        priority
      />
      <div className="absolute inset-0 bg-hero-overlay/80"></div>
      <div className="relative z-10 flex items-center justify-center h-full">
        <div className="text-center max-w-3xl px-4">
          <h1 className={`${cormorant.className} text-5xl sm:text-7xl font-bold text-brown mb-6`}>
            Megan Houssian Art
          </h1>
          <p className={`${cormorant.className} text-lg sm:text-2xl text-brown/80 italic tracking-wide mb-8`}>
            Brushstrokes of sky and field, bringing the calm of nature indoors
          </p>
          <a
            href="#gallery"
            className={`inline-block border-2 border-brown text-brown px-8 py-3 rounded-full font-semibold
                       hover:bg-btn-brown hover:text-paper hover:border-btn-brown transition-all duration-300 
                       shadow-md hover:shadow-lg transform hover:scale-105 ${lora.className}`}
          >
            Explore Gallery
          </a>
        </div>
      </div>
    </section>
  );
}
