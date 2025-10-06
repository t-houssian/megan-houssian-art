// components/Hero.tsx
import Image from 'next/image';
import type { CSSProperties } from 'react';
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
  primaryTextColor?: string;
  buttonPrimaryColor?: string;
  buttonBorderColor?: string;
  buttonHoverColor?: string;
  buttonHoverTextColor?: string;
};

const heroQuery = `*[_type == "heroSettings"][0]{
  backgroundImage{
    asset,
    alt
  },
  primaryTextColor,
  buttonPrimaryColor,
  buttonBorderColor,
  buttonHoverColor,
  buttonHoverTextColor
}`;

const HEX_COLOR_REGEX = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

const getSafeColor = (color: string | undefined, fallback: string) => {
  if (!color) {
    return fallback;
  }

  const candidate = color.trim();
  return HEX_COLOR_REGEX.test(candidate) ? candidate : fallback;
};

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

  const textColor = getSafeColor(heroSettings?.primaryTextColor, '#000000');
  const buttonTextColor = getSafeColor(heroSettings?.buttonPrimaryColor, '#000000');
  const buttonBorderColor = getSafeColor(heroSettings?.buttonBorderColor, '#F7F3E9');
  const buttonHoverBackgroundColor = getSafeColor(heroSettings?.buttonHoverColor, '#000000');
  const buttonHoverTextColor = getSafeColor(heroSettings?.buttonHoverTextColor, '#FFFFFF');

  const buttonStyle: CSSProperties = {
    '--button-text-color': buttonTextColor,
    '--button-border-color': buttonBorderColor,
    '--button-hover-bg-color': buttonHoverBackgroundColor,
    '--button-hover-text-color': buttonHoverTextColor,
  };

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
          <h1
            className={`${cormorant.className} text-5xl sm:text-7xl font-bold mb-6`}
            style={{ color: textColor }}
          >
            Megan Houssian Art
          </h1>
          <p
            className={`${cormorant.className} text-lg sm:text-2xl italic tracking-wide mb-8 opacity-80`}
            style={{ color: textColor }}
          >
            Brushstrokes of sky and field, bringing the calm of nature indoors
          </p>
          <a
            href="#gallery"
            className={`inline-block border-2 bg-transparent px-8 py-3 rounded-full font-semibold
                       transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105
                       text-[color:var(--button-text-color)] border-[color:var(--button-border-color)]
                       hover:bg-[color:var(--button-hover-bg-color)] hover:text-[color:var(--button-hover-text-color)]
                       hover:border-[color:var(--button-hover-bg-color)] ${lora.className}`}
            style={buttonStyle}
          >
            Explore Gallery
          </a>
        </div>
      </div>
    </section>
  );
}
