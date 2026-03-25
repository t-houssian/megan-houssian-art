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

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
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
        <Footer />
      </body>
    </html>
  );
}
