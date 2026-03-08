// app/layout.tsx
import './globals.css';
import NavBar from './components/NavBar';
import Footer from './components/Footer';
import { ReactNode } from 'react';
import { lora } from './fonts';
import Script from 'next/script';

const GOOGLE_ANALYTICS_ID = 'G-SWFSW2Z76Q';

export const metadata = {
  title: 'Megan Houssian Art',
  description: 'Official art portfolio of Megan Houssian',
};

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
