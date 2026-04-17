import Image from 'next/image';
import { cormorant, lora } from '../fonts';
import { fetchOriginalsPageSettings } from '../../lib/originals-page-settings';
import { urlFor } from '../../sanity/lib/image';
import SanityRichText from '../components/SanityRichText';

export const revalidate = 60;

export default async function OriginalsPage() {
  const settings = await fetchOriginalsPageSettings();
  const comingSoonImageUrl = settings.comingSoonImage?.asset
    ? urlFor(settings.comingSoonImage).fit('max').quality(95).format('jpg').url()
    : '/images/IMG_5629.jpg';
  const comingSoonImageAlt = settings.comingSoonImage?.alt?.trim() || 'Upcoming original collection';

  return (
    <section className="min-h-screen bg-ivory">
      <div className="max-w-5xl mx-auto py-16 px-6">
        <div className="text-center mb-10">
          <h1 className={`${cormorant.className} text-4xl md:text-5xl font-light mb-6 text-brown tracking-wide`}>
            {settings.pageTitle}
          </h1>
          <SanityRichText
            value={settings.comingSoonContent}
            className="max-w-3xl mx-auto"
            paragraphClassName={`${lora.className} text-xl md:text-2xl text-warm-gray leading-relaxed`}
          />
        </div>

        <div className="mx-auto max-w-3xl">
          <div className="relative aspect-[4/5] overflow-hidden bg-ivory">
            <Image
              src={comingSoonImageUrl}
              alt={comingSoonImageAlt}
              fill
              className="object-contain"
              sizes="(min-width: 1024px) 50vw, (min-width: 768px) 70vw, 92vw"
              priority
            />
          </div>
        </div>
      </div>
    </section>
  );
}
