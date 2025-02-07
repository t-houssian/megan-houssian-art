// app/page.tsx

import Hero from './components/Hero';
import AboutSection from './components/AboutSection';
import Gallery from './components/Gallery';
import CallToAction from './components/CallToAction';

export default function Home() {
  return (
    <>
      <Hero />
      <AboutSection />
      {/* Gallery (Pulled from Sanity) */}
      <Gallery />
      <CallToAction />
    </>
  );
}
