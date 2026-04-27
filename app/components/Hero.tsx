// components/Hero.tsx
import type { CSSProperties } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { sanityClient } from '../../lib/sanity';
import { urlFor } from '../../sanity/lib/image';
import { lora } from '../fonts';

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

type HeroCtaPlacement = 'higher' | 'middle' | 'lower';

type HeroCtaSettings = {
  enabled?: boolean;
  label?: string;
  href?: string;
  placement?: HeroCtaPlacement | null;
  backgroundColor?: string;
  textColor?: string;
  borderColor?: string;
  hoverBackgroundColor?: string;
  hoverTextColor?: string;
};

type HeroSettings = {
  backgroundImage?: {
    asset?: {
      _ref: string;
    };
    alt?: string;
  };
  stylePreset?: HeroStylePresetKey | null;
  cta?: HeroCtaSettings | null;
};

const DEFAULT_HERO_CTA = {
  label: 'Browse Originals',
  href: '/originals',
  placement: 'middle' as HeroCtaPlacement,
  backgroundColor: '#4D5853',
  textColor: '#E7E1D4',
  borderColor: '#000000',
  hoverBackgroundColor: '#2F342F',
  hoverTextColor: '#E7E1D4',
};

const HERO_CTA_PLACEMENT_CLASSES: Record<HeroCtaPlacement, string> = {
  higher: 'top-[38%]',
  middle: 'top-1/2',
  lower: 'top-[62%]',
};

const HEX_COLOR_PATTERN = /^#(?:[0-9a-fA-F]{6})$/;

const normalizeString = (value: unknown, fallback: string) => {
  if (typeof value !== 'string') return fallback;
  const normalized = value.trim();
  return normalized || fallback;
};

const normalizeInternalHref = (value: unknown, fallback: string) => {
  const normalized = normalizeString(value, fallback);
  return normalized.startsWith('/') && !normalized.startsWith('//') ? normalized : fallback;
};

const normalizeHexColor = (value: unknown, fallback: string) => {
  const normalized = normalizeString(value, fallback);
  return HEX_COLOR_PATTERN.test(normalized) ? normalized : fallback;
};

const normalizePlacement = (value: unknown): HeroCtaPlacement =>
  value === 'higher' || value === 'lower' || value === 'middle'
    ? value
    : DEFAULT_HERO_CTA.placement;

const heroProjection = `{
  backgroundImage{
    asset,
    alt
  },
  stylePreset,
  cta
}`;

const heroSingletonQuery = `*[
  _type == "heroSettings" &&
  _id in ["heroSettings", "drafts.heroSettings"]
][0]${heroProjection}`;

const heroFallbackQuery = `*[_type == "heroSettings"] | order(_updatedAt desc)[0]${heroProjection}`;

async function fetchHeroSettings(): Promise<HeroSettings | null> {
  try {
    const singletonSettings = await sanityClient.fetch<HeroSettings | null>(
      heroSingletonQuery,
      {},
      { next: { revalidate: 60 } }
    );

    if (singletonSettings) {
      return singletonSettings;
    }

    return await sanityClient.fetch<HeroSettings | null>(heroFallbackQuery, {}, { next: { revalidate: 60 } });
  } catch (error) {
    console.error('Failed to load hero settings from Sanity', error);
    return null;
  }
}

export default async function Hero() {
  const heroSettings = await fetchHeroSettings();

  const heroImageUrl = heroSettings?.backgroundImage?.asset
    ? urlFor(heroSettings.backgroundImage)
        // Request the original-size crop with minimal compression.
        .fit('max')
        .quality(100)
        .format('jpg')
        .url()
    : '/images/blueBG.jpg';

  const heroAlt = heroSettings?.backgroundImage?.alt?.trim() || 'Hero Image';
  const cta = heroSettings?.cta;
  const shouldShowCta = Boolean(cta?.enabled);
  const ctaLabel = normalizeString(cta?.label, DEFAULT_HERO_CTA.label);
  const ctaHref = normalizeInternalHref(cta?.href, DEFAULT_HERO_CTA.href);
  const ctaPlacement = normalizePlacement(cta?.placement);
  const ctaStyle = {
    '--hero-cta-bg': normalizeHexColor(cta?.backgroundColor, DEFAULT_HERO_CTA.backgroundColor),
    '--hero-cta-text': normalizeHexColor(cta?.textColor, DEFAULT_HERO_CTA.textColor),
    '--hero-cta-border': normalizeHexColor(cta?.borderColor, DEFAULT_HERO_CTA.borderColor),
    '--hero-cta-hover-bg': normalizeHexColor(cta?.hoverBackgroundColor, DEFAULT_HERO_CTA.hoverBackgroundColor),
    '--hero-cta-hover-text': normalizeHexColor(cta?.hoverTextColor, DEFAULT_HERO_CTA.hoverTextColor),
  } as CSSProperties;

  return (
    <section className="relative w-full h-[80vh] overflow-hidden">
      <Image
        src={heroImageUrl}
        alt={heroAlt}
        fill
        quality={95}
        sizes="100vw"
        unoptimized
        style={{ objectFit: 'cover' }}
        className="object-cover object-center"
        priority
      />
      <div className="absolute inset-0 bg-hero-overlay/40"></div>
      {shouldShowCta && (
        <div
          className={`absolute left-0 right-0 z-10 flex -translate-y-1/2 justify-center px-6 ${HERO_CTA_PLACEMENT_CLASSES[ctaPlacement]}`}
        >
          <Link
            href={ctaHref}
            style={ctaStyle}
            className={`group relative inline-block overflow-hidden rounded-full border-2 border-[var(--hero-cta-border)] bg-[var(--hero-cta-bg)] px-8 py-3 text-[var(--hero-cta-text)] shadow-vintage transition-all duration-500 hover:-translate-y-0.5 hover:bg-[var(--hero-cta-hover-bg)] hover:text-[var(--hero-cta-hover-text)] hover:shadow-vintage-lg ${lora.className} font-medium`}
          >
            <span className="relative z-10">{ctaLabel}</span>
            <span className="pointer-events-none absolute inset-0 -translate-x-full -skew-x-12 bg-gradient-to-r from-transparent via-paper to-transparent opacity-0 transition-all duration-700 group-hover:translate-x-full group-hover:opacity-10" />
          </Link>
        </div>
      )}
    </section>
  );
}
