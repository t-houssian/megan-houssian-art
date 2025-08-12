// app/page.tsx
import Hero from './components/Hero';
import Collections from './components/Collections';
import CommisionsLink from './commissions/CommissionsLink';
import ContactLink from './contact/ContactLink';

export default function Home() {
  return (
    <>
      <Hero />
      <Collections />
      <CommisionsLink />
      <ContactLink />
    </>
  );
}
