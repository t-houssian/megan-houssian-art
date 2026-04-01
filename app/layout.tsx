// app/layout.tsx
import './globals.css';
import NavBar from './components/NavBar';
import Footer from './components/Footer';
import { ReactNode } from 'react';
import { lora } from './fonts';
import Script from 'next/script';
import type { Metadata } from 'next';
import { fetchSiteSettings } from '../lib/site-settings';
import { urlFor } from '../sanity/lib/image';
import type { SiteTheme } from '../sanity/lib/siteTheme';

const GOOGLE_ANALYTICS_ID = 'G-SWFSW2Z76Q';

export async function generateMetadata(): Promise<Metadata> {
  const siteSettings = await fetchSiteSettings();
  const favicon = siteSettings.favicon;

  const icons =
    favicon?.asset?._ref
      ? {
          icon: [
            {
              url: urlFor(favicon).width(32).height(32).fit('crop').format('png').url(),
              sizes: '32x32',
              type: 'image/png',
            },
            {
              url: urlFor(favicon).width(192).height(192).fit('crop').format('png').url(),
              sizes: '192x192',
              type: 'image/png',
            },
          ],
          apple: [
            {
              url: urlFor(favicon).width(180).height(180).fit('crop').format('png').url(),
              sizes: '180x180',
              type: 'image/png',
            },
          ],
          shortcut: [
            urlFor(favicon).width(32).height(32).fit('crop').format('png').url(),
          ],
        }
      : undefined;

  return {
    title: 'Megan Houssian Art',
    description: 'Official art portfolio of Megan Houssian',
    icons,
  };
}

function hexToRgb(hex: string) {
  const normalized = hex.replace('#', '');
  const value = Number.parseInt(normalized, 16);

  return {
    r: (value >> 16) & 255,
    g: (value >> 8) & 255,
    b: value & 255,
  };
}

function withAlpha(hex: string, alpha: number) {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function buildThemeVariables(theme: SiteTheme): Record<string, string> {
  return {
    '--bg-ivory': theme.mainBackgroundColor,
    '--bg-paper': theme.secondaryBackgroundColor,
    '--nav-bg': theme.navBackgroundColor,
    '--text-brown': theme.textColor,
    '--btn-brown': theme.buttonColor,
    '--btn-brown-hover': theme.buttonHoverColor,
    '--link-olive': theme.linkColor,
    '--border-tan': theme.borderColor,
    '--accent-cream': theme.accentColor,
    '--text-warm-gray': theme.mutedTextColor,
    '--hero-overlay': theme.heroOverlayColor,
    '--surface-alt': theme.surfaceAccentColor,
    '--border-tan-soft': withAlpha(theme.borderColor, 0.35),
    '--border-tan-medium': withAlpha(theme.borderColor, 0.45),
    '--link-olive-hover-bg': withAlpha(theme.linkColor, 0.08),
    '--shadow-color-soft': withAlpha(theme.textColor, 0.1),
    '--shadow-color-strong': withAlpha(theme.textColor, 0.2),
    '--focus-ring-soft': withAlpha(theme.buttonColor, 0.1),
    '--focus-ring-strong': withAlpha(theme.buttonColor, 0.3),
  };
}

export default async function RootLayout({ children }: { children: ReactNode }) {
  const siteSettings = await fetchSiteSettings();
  const themeVariables = buildThemeVariables(siteSettings.theme);

  return (
    <html lang="en" style={themeVariables}>
      <head>
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GOOGLE_ANALYTICS_ID}`}
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GOOGLE_ANALYTICS_ID}');
          `}
        </Script>
      </head>
      <body className={`${lora.className} bg-ivory text-brown min-h-screen flex flex-col`}>
        <NavBar />
        <main className="flex-grow">{children}</main>
        <Footer content={siteSettings.footerContent} />
      </body>
    </html>
  );
}
