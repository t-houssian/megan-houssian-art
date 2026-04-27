import { DEFAULT_SITE_THEME } from './siteTheme';

export const HERO_CTA_COLOR_SCHEMES = {
  default: {
    title: 'Default - matches site buttons',
    backgroundColor: `linear-gradient(to right, ${DEFAULT_SITE_THEME.buttonColor}, ${DEFAULT_SITE_THEME.buttonHoverColor})`,
    textColor: DEFAULT_SITE_THEME.secondaryBackgroundColor,
    borderColor: '#000000CC',
    hoverBackgroundColor: `linear-gradient(to right, ${DEFAULT_SITE_THEME.buttonColor}, ${DEFAULT_SITE_THEME.buttonHoverColor})`,
    hoverTextColor: DEFAULT_SITE_THEME.secondaryBackgroundColor,
  },
  white: {
    title: 'White',
    backgroundColor: '#FFFFFF',
    textColor: DEFAULT_SITE_THEME.textColor,
    borderColor: '#FFFFFF',
    hoverBackgroundColor: DEFAULT_SITE_THEME.secondaryBackgroundColor,
    hoverTextColor: DEFAULT_SITE_THEME.textColor,
  },
  charcoal: {
    title: 'Charcoal',
    backgroundColor: '#2F342F',
    textColor: '#F3F4F1',
    borderColor: '#2F342F',
    hoverBackgroundColor: '#4D5853',
    hoverTextColor: '#F3F4F1',
  },
  sage: {
    title: 'Sage',
    backgroundColor: '#6A715A',
    textColor: '#F3F4F1',
    borderColor: '#6A715A',
    hoverBackgroundColor: '#4D5853',
    hoverTextColor: '#F3F4F1',
  },
  linen: {
    title: 'Linen',
    backgroundColor: '#E7E1D4',
    textColor: '#2F342F',
    borderColor: '#E7E1D4',
    hoverBackgroundColor: '#F3F4F1',
    hoverTextColor: '#2F342F',
  },
  terracotta: {
    title: 'Terracotta',
    backgroundColor: '#8C5A3C',
    textColor: '#FFF8F0',
    borderColor: '#8C5A3C',
    hoverBackgroundColor: '#6D4C3D',
    hoverTextColor: '#FFF8F0',
  },
  rosewood: {
    title: 'Rosewood',
    backgroundColor: '#5C2B33',
    textColor: '#FCEFF1',
    borderColor: '#5C2B33',
    hoverBackgroundColor: '#3F1E24',
    hoverTextColor: '#FCEFF1',
  },
  coastal: {
    title: 'Coastal',
    backgroundColor: '#2F4858',
    textColor: '#F7F9FB',
    borderColor: '#2F4858',
    hoverBackgroundColor: '#203642',
    hoverTextColor: '#F7F9FB',
  },
  amber: {
    title: 'Amber',
    backgroundColor: '#A76932',
    textColor: '#FEFBF3',
    borderColor: '#A76932',
    hoverBackgroundColor: '#7A4A22',
    hoverTextColor: '#FEFBF3',
  },
  outline: {
    title: 'Transparent Outline',
    backgroundColor: 'transparent',
    textColor: '#FFFFFF',
    borderColor: '#FFFFFF',
    hoverBackgroundColor: '#FFFFFF',
    hoverTextColor: '#2F342F',
  },
} as const;

export type HeroCtaColorSchemeKey = keyof typeof HERO_CTA_COLOR_SCHEMES;

export const DEFAULT_HERO_CTA_COLOR_SCHEME: HeroCtaColorSchemeKey = 'default';

export const HERO_CTA_COLOR_SCHEME_OPTIONS = Object.entries(HERO_CTA_COLOR_SCHEMES).map(
  ([value, scheme]) => ({
    title: scheme.title,
    value,
  })
);
