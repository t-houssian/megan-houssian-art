export const HEX_COLOR_PATTERN = /^#(?:[0-9a-fA-F]{6})$/;

export const SITE_THEME_PALETTE = [
  '#E7E1D4',
  '#4D5853',
  '#2F342F',
  '#6A715A',
  '#F3F4F1',
  '#8B927C',
  '#B6B0A0',
  '#AEB9B5',
  '#D8DDD8',
  '#C7D1CD',
] as const;

export const SITE_THEME_PALETTE_HELPER_TEXT = `Approved palette: ${SITE_THEME_PALETTE.join(', ')}`;

export type SiteTheme = {
  mainBackgroundColor: string;
  secondaryBackgroundColor: string;
  navBackgroundColor: string;
  textColor: string;
  buttonColor: string;
  buttonHoverColor: string;
  linkColor: string;
  mutedTextColor: string;
  accentColor: string;
  borderColor: string;
  heroOverlayColor: string;
  surfaceAccentColor: string;
};

export const DEFAULT_SITE_THEME: SiteTheme = {
  mainBackgroundColor: '#F3F4F1',
  secondaryBackgroundColor: '#E7E1D4',
  navBackgroundColor: '#F3F4F1',
  textColor: '#2F342F',
  buttonColor: '#4D5853',
  buttonHoverColor: '#2F342F',
  linkColor: '#6A715A',
  mutedTextColor: '#8B927C',
  accentColor: '#D8DDD8',
  borderColor: '#C7D1CD',
  heroOverlayColor: '#AEB9B5',
  surfaceAccentColor: '#B6B0A0',
};
