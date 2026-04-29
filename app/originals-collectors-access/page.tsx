import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import OriginalsGalleryPage from '../components/OriginalsGalleryPage';
import CollectorAccessGate from '../components/CollectorAccessGate';
import { cormorant, lora } from '../fonts';
import { COLLECTOR_ACCESS_COOKIE_NAME } from '../../lib/collector-access';

export const metadata: Metadata = {
  title: 'Collectors Access | Megan Houssian Art',
  robots: {
    index: false,
    follow: false,
  },
};

type CollectorsAccessPageProps = {
  searchParams: Promise<{
    error?: string;
  }>;
};

export default async function OriginalsCollectorsAccessPage({
  searchParams,
}: CollectorsAccessPageProps) {
  const cookieStore = await cookies();
  const hasAccess = cookieStore.get(COLLECTOR_ACCESS_COOKIE_NAME)?.value === 'granted';
  const params = await searchParams;

  if (hasAccess) {
    return <OriginalsGalleryPage sourcePath="/originals-collectors-access" />;
  }

  const gateError = params.error === 'invalid-password' ? params.error : undefined;

  return (
    <section className="min-h-screen bg-gradient-to-br from-ivory via-paper to-accent-cream">
      <div className="max-w-2xl mx-auto px-6 py-20">
        <div className="mb-8 text-center">
          <p className={`${lora.className} text-sm uppercase tracking-[0.22em] text-olive mb-4`}>
            The Evening Light Collection is in early access
          </p>
          <h1 className={`${cormorant.className} text-4xl md:text-5xl font-light text-brown`}>
            Originals Collector Access
          </h1>
        </div>

        <CollectorAccessGate
          formAction="/originals-collectors-access/unlock"
          error={gateError}
        />
      </div>
    </section>
  );
}
