import Link from 'next/link';
import { cormorant, lora } from '../../fonts';

export const revalidate = 60;

export default function OriginalsCollectionsPage() {
  return (
    <section className="min-h-screen bg-gradient-to-br from-ivory via-paper to-accent-cream">
      <div className="max-w-5xl mx-auto py-16 px-6 text-center">
        <h1 className={`${cormorant.className} text-4xl md:text-5xl font-light mb-6 text-brown tracking-wide`}>
          Collections
        </h1>
        <p className={`${lora.className} text-lg text-warm-gray max-w-2xl mx-auto leading-relaxed`}>
          Curated original collections are coming soon.{' '}
          <Link href="/#collector-early-access" className="underline text-olive hover:text-brown transition-colors">
            Join my collector email for updates.
          </Link>
        </p>
      </div>
    </section>
  );
}
