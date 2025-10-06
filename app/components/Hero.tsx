// components/Hero.tsx
import Image from 'next/image';
import type { CSSProperties } from 'react';
import { sanityClient } from '../../lib/sanity';
import { urlFor } from '../../sanity/lib/image';
import { cormorant, lora } from "../fonts";

const HERO_COLOR_PRESETS = {
  classic: {
    textColor: '#000000',
    buttonTextColor: '#000000',
    buttonBorderColor: '#F7F3E9',
    buttonHoverBackgroundColor: '#000000',
    buttonHoverTextColor: '#FFFFFF',
  },
  moonlit: {
    textColor: '#F7F3E9',
    buttonTextColor: '#F7F3E9',
    buttonBorderColor: '#000000',
    buttonHoverBackgroundColor: '#111111',
    buttonHoverTextColor: '#F7F3E9',
  },
  sepia: {
    textColor: '#4A3F35',
    buttonTextColor: '#4A3F35',
    buttonBorderColor: '#D4C4A8',
    buttonHoverBackgroundColor: '#8B4513',
    buttonHoverTextColor: '#FEFBF3',
  },
  olive: {
    textColor: '#6B5B47',
    buttonTextColor: '#6B5B47',
    buttonBorderColor: '#F5E3C3',
    buttonHoverBackgroundColor: '#6B5B47',
    buttonHoverTextColor: '#FEFBF3',
  },
  linen: {
    textColor: '#F7F3E9',
    buttonTextColor: '#F7F3E9',
    buttonBorderColor: '#F7F3E9',
    buttonHoverBackgroundColor: '#111111',
    buttonHoverTextColor: '#F7F3E9',
  },
  charcoal: {
    textColor: '#1F1F1F',
    buttonTextColor: '#1F1F1F',
    buttonBorderColor: '#B8AEA2',
    buttonHoverBackgroundColor: '#1F1F1F',
    buttonHoverTextColor: '#F7F3E9',
  },
  porcelain: {
    textColor: '#EDE4D4',
    buttonTextColor: '#EDE4D4',
    buttonBorderColor: '#8C7363',
    buttonHoverBackgroundColor: '#3E3026',
    buttonHoverTextColor: '#F7F3E9',
  },
  sage: {
    textColor: '#5A6C5C',
    buttonTextColor: '#5A6C5C',
    buttonBorderColor: '#C7D2C5',
    buttonHoverBackgroundColor: '#5A6C5C',
    buttonHoverTextColor: '#FEFBF3',
  },
  twilight: {
    textColor: '#F1E9DC',
    buttonTextColor: '#F1E9DC',
    buttonBorderColor: '#2F3A3F',
    buttonHoverBackgroundColor: '#2F3A3F',
    buttonHoverTextColor: '#F1E9DC',
  },
  sunset: {
    textColor: '#7A3E2D',
    buttonTextColor: '#7A3E2D',
    buttonBorderColor: '#F2C7A0',
    buttonHoverBackgroundColor: '#7A3E2D',
    buttonHoverTextColor: '#FEFBF3',
  },
  meadow: {
    textColor: '#4F6F52',
    buttonTextColor: '#4F6F52',
    buttonBorderColor: '#D7E2C6',
    buttonHoverBackgroundColor: '#4F6F52',
    buttonHoverTextColor: '#FFFFFC',
  },
  mist: {
    textColor: '#ECE7DE',
    buttonTextColor: '#ECE7DE',
    buttonBorderColor: '#9AA6A6',
    buttonHoverBackgroundColor: '#586969',
    buttonHoverTextColor: '#ECE7DE',
  },
  riverstone: {
    textColor: '#37474F',
    buttonTextColor: '#37474F',
    buttonBorderColor: '#C6D2D9',
    buttonHoverBackgroundColor: '#37474F',
    buttonHoverTextColor: '#F7F3E9',
  },
  amber: {
    textColor: '#A76932',
    buttonTextColor: '#A76932',
    buttonBorderColor: '#F4D7B2',
    buttonHoverBackgroundColor: '#A76932',
    buttonHoverTextColor: '#FEFBF3',
  },
  rosewood: {
    textColor: '#5C2B33',
    buttonTextColor: '#5C2B33',
    buttonBorderColor: '#E2B3BE',
    buttonHoverBackgroundColor: '#5C2B33',
    buttonHoverTextColor: '#FCEFF1',
  },
  clay: {
    textColor: '#8C5A3C',
    buttonTextColor: '#8C5A3C',
    buttonBorderColor: '#E5CBB1',
    buttonHoverBackgroundColor: '#8C5A3C',
    buttonHoverTextColor: '#FFF8F0',
  },
  storm: {
    textColor: '#E9EEF4',
    buttonTextColor: '#E9EEF4',
    buttonBorderColor: '#4B5969',
    buttonHoverBackgroundColor: '#2E3A46',
    buttonHoverTextColor: '#E9EEF4',
  },
  harvest: {
    textColor: '#6D4C3D',
    buttonTextColor: '#6D4C3D',
    buttonBorderColor: '#F0D7B4',
    buttonHoverBackgroundColor: '#6D4C3D',
    buttonHoverTextColor: '#FEF6E9',
  },
  mulberry: {
    textColor: '#5A315D',
    buttonTextColor: '#5A315D',
    buttonBorderColor: '#E7CCE8',
    buttonHoverBackgroundColor: '#5A315D',
    buttonHoverTextColor: '#FDF5FF',
  },
  coastal: {
    textColor: '#2F4858',
    buttonTextColor: '#2F4858',
    buttonBorderColor: '#C7D7E0',
    buttonHoverBackgroundColor: '#2F4858',
    buttonHoverTextColor: '#F7F9FB',
  },
  sandstone: {
    textColor: '#A8835A',
    buttonTextColor: '#A8835A',
    buttonBorderColor: '#F1D7B4',
    buttonHoverBackgroundColor: '#A8835A',
    buttonHoverTextColor: '#FEF7EE',
  },
  pearl: {
    textColor: '#FAF4EE',
    buttonTextColor: '#FAF4EE',
    buttonBorderColor: '#D8C6B5',
    buttonHoverBackgroundColor: '#695A4C',
    buttonHoverTextColor: '#FAF4EE',
  },
  cinder: {
    textColor: '#F4F4F4',
    buttonTextColor: '#F4F4F4',
    buttonBorderColor: '#3B3B3B',
    buttonHoverBackgroundColor: '#141414',
    buttonHoverTextColor: '#F4F4F4',
  },
  canyon: {
    textColor: '#7B4A3A',
    buttonTextColor: '#7B4A3A',
    buttonBorderColor: '#E7C3AD',
    buttonHoverBackgroundColor: '#7B4A3A',
    buttonHoverTextColor: '#FFF5EE',
  },
} as const;

type HeroStylePresetKey = keyof typeof HERO_COLOR_PRESETS;

type HeroSettings = {
  backgroundImage?: {
    asset?: {
      _ref: string;
    };
    alt?: string;
  };
  stylePreset?: HeroStylePresetKey | null;
};

type HeroCustomProperties = CSSProperties & Record<
  '--button-text-color' | '--button-border-color' | '--button-hover-bg-color' | '--button-hover-text-color',
  string
>;

const heroQuery = `*[_type == "heroSettings"][0]{
  backgroundImage{
    asset,
    alt
  },
  stylePreset
}`;

const isHeroStylePresetKey = (value: unknown): value is HeroStylePresetKey =>
  typeof value === 'string' && Object.prototype.hasOwnProperty.call(HERO_COLOR_PRESETS, value);

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

  const presetKey: HeroStylePresetKey = heroSettings?.stylePreset && isHeroStylePresetKey(heroSettings.stylePreset)
    ? heroSettings.stylePreset
    : 'classic';

  const {
    textColor,
    buttonTextColor,
    buttonBorderColor,
    buttonHoverBackgroundColor,
    buttonHoverTextColor,
  } = HERO_COLOR_PRESETS[presetKey];

  const buttonStyle: HeroCustomProperties = {
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
