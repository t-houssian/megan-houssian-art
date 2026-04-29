import Image from 'next/image';
import { cookies } from 'next/headers';
import { cormorant, lora } from '../fonts';
import { fetchOriginalsPageSettings } from '../../lib/originals-page-settings';
import { urlFor } from '../../sanity/lib/image';
import OriginalsGalleryPage from '../components/OriginalsGalleryPage';
import CollectorAccessGate from '../components/CollectorAccessGate';
import { COLLECTOR_ACCESS_COOKIE_NAME } from '../../lib/collector-access';

export const revalidate = 0;

type OriginalsPageProps = {
  searchParams: Promise<{
    error?: string;
  }>;
};

export default async function OriginalsPage({ searchParams }: OriginalsPageProps) {
  const cookieStore = await cookies();
  const hasAccess = cookieStore.get(COLLECTOR_ACCESS_COOKIE_NAME)?.value === 'granted';

  if (hasAccess) {
    return <OriginalsGalleryPage sourcePath="/originals" />;
  }

  const settings = await fetchOriginalsPageSettings();
  const params = await searchParams;
  const gateError = params.error === 'invalid-password' ? params.error : undefined;
  const comingSoonImageUrl = settings.comingSoonImage?.asset
    ? urlFor(settings.comingSoonImage).fit('max').quality(95).format('jpg').url()
    : '/images/IMG_5629.jpg';
  const comingSoonImageAlt = settings.comingSoonImage?.alt?.trim() || 'Upcoming original collection';

  return (
    <section className="min-h-screen bg-ivory">
      <div className="max-w-5xl mx-auto py-16 px-6">
        <div className="text-center mb-10">
          <h1 className={`${cormorant.className} text-4xl md:text-5xl font-light mb-6 text-brown tracking-wide`}>
            Originals
          </h1>
          <p className={`${lora.className} max-w-3xl mx-auto text-xl md:text-2xl text-warm-gray leading-relaxed`}>
            The Evening Light Collection is in early access. Collectors have received the password via email, or you can join the{' '}
            <a href="/#collector-early-access" className="text-olive underline underline-offset-4 hover:text-brown">
              Collector List
            </a>{' '}
            to receive it.
          </p>
        </div>

        <div className="mx-auto max-w-2xl mb-12">
          <CollectorAccessGate
            error={gateError}
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
