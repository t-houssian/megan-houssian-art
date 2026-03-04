// app/page.tsx
import { Suspense } from 'react';
import Hero from './components/Hero';
import CollectorEarlyAccess from './components/CollectorEarlyAccess';
import AboutSection from './components/AboutSection';
import Collections from './components/Collections';
import CommisionsLink from './commissions/CommissionsLink';
import ContactLink from './contact/ContactLink';

export default function Home() {
  return (
    <>
      <Hero />
      <CollectorEarlyAccess />
      {/* Wrap Collections in Suspense because its client subtree uses useSearchParams */}
      <Suspense fallback={<div className="text-brown text-center py-8">Loading gallery…</div>}>
        <Collections />
      </Suspense>
      <AboutSection />
      <CommisionsLink />
      <ContactLink />
    </>
  );
}
