// app/page.tsx
import { Suspense } from 'react';
import Hero from './components/Hero';
import CollectorSignup from './components/CollectorSignup';
import AboutSection from './components/AboutSection';
import Collections from './components/Collections';
import CommisionsLink from './commissions/CommissionsLink';
import ContactLink from './contact/ContactLink';
import { fetchCollectorSignupSettings } from '../lib/collector-signup-settings';
import { fetchSiteSettings } from '../lib/site-settings';
import { lora } from './fonts';

export const revalidate = 60;

export default async function Home() {
  const collectorSettings = await fetchCollectorSignupSettings();
  const siteSettings = await fetchSiteSettings();

  return (
    <>
      <Hero />
      <section className="px-4 py-10 bg-paper text-center border-t border-tan/60">
        <p className={`${lora.className} mx-auto max-w-3xl text-lg md:text-xl leading-relaxed text-brown italic`}>
          {siteSettings.homepageContent.homeCollectorIntro}
        </p>
      </section>
      <CollectorSignup settings={collectorSettings} />
      <Suspense fallback={<div className="text-brown text-center py-8">Loading gallery…</div>}>
        <Collections />
      </Suspense>
      <AboutSection content={siteSettings.homepageContent} />
      <CommisionsLink content={siteSettings.homepageContent} />
      <ContactLink content={siteSettings.homepageContent} />
    </>
  );
}
