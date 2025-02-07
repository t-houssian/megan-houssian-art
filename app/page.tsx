// app/page.tsx
import Hero from './components/Hero';
import AboutSection from './components/AboutSection';
import Gallery from './components/Gallery';
import CommisionsLink from './commissions/CommissionsLink';
import ContactLink from './contact/ContactLink';

export default function Home() {
  return (
    <>
      <Hero />
      <AboutSection />
      <Gallery />
      <CommisionsLink />
      <ContactLink />
    </>
  );
}
