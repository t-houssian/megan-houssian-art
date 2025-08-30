// app/page.tsx
import { Suspense } from 'react';
import Hero from './components/Hero';
import Collections from './components/Collections';
import CommisionsLink from './commissions/CommissionsLink';
import ContactLink from './contact/ContactLink';

export default function Home() {
  return (
    <>
      <Hero />
      {/* Wrap Collections in Suspense because its client subtree uses useSearchParams */}
      <Suspense fallback={<div className="text-brown text-center py-8">Loading gallery…</div>}>
        <Collections />
      </Suspense>
      <CommisionsLink />
      <ContactLink />
    </>
  );
}
