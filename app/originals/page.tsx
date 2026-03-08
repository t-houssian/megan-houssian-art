import Image from 'next/image';
import Link from 'next/link';
import { cormorant, lora } from '../fonts';
import { fetchOriginalsPageSettings } from '../../lib/originals-page-settings';
import { urlFor } from '../../sanity/lib/image';

export const revalidate = 60;

export default async function OriginalsPage() {
  const settings = await fetchOriginalsPageSettings();
  const comingSoonImageUrl = settings.comingSoonImage?.asset
    ? urlFor(settings.comingSoonImage).fit('max').quality(95).format('jpg').url()
    : '/images/IMG_5629.jpg';
  const comingSoonImageAlt = settings.comingSoonImage?.alt?.trim() || 'Upcoming original collection';

  return (
    <section className="min-h-screen bg-gradient-to-br from-ivory via-paper to-accent-cream">
      <div className="max-w-5xl mx-auto py-16 px-6">
        <div className="text-center mb-10">
          <h1 className={`${cormorant.className} text-4xl md:text-5xl font-light mb-6 text-brown tracking-wide`}>
            {settings.pageTitle}
          </h1>
          <p className={`${lora.className} text-lg text-warm-gray max-w-3xl mx-auto leading-relaxed`}>
            new original collection coming soon.{' '}
            <Link href="/#collector-early-access" className="underline text-olive hover:text-brown transition-colors">
              Sign up for my collector email to get updates.
            </Link>
          </p>
        </div>

        <div className="mx-auto max-w-3xl">
          <div className="relative aspect-[4/5] overflow-hidden rounded-2xl border border-tan/30 bg-white/70 shadow-vintage">
            <Image
              src={comingSoonImageUrl}
              alt={comingSoonImageAlt}
              fill
              className="object-cover"
              sizes="(min-width: 1024px) 50vw, (min-width: 768px) 70vw, 92vw"
              priority
            />
          </div>
        </div>
      </div>
    </section>
  );
}
