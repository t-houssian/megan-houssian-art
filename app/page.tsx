// app/page.tsx

import Hero from '@/app/components/Hero';
import Gallery from '@/app/components/Gallery';

export default function Home() {
  return (
    <main>
      {/* Hero Section */}
      <Hero />

      {/* Gallery Section */}
      {/* Because Gallery is an async Server Component, we can do this: */}
      <Gallery />
    </main>
  );
}
