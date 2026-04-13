import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import OriginalsGalleryPage from '../components/OriginalsGalleryPage';
import { cormorant, lora } from '../fonts';

const ACCESS_COOKIE_NAME = 'mha-collectors-access';

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
  const hasAccess = cookieStore.get(ACCESS_COOKIE_NAME)?.value === 'granted';
  const params = await searchParams;

  if (hasAccess) {
    return <OriginalsGalleryPage sourcePath="/originals-collectors-access" />;
  }

  const showError = params.error === 'invalid-password';

  return (
    <section className="min-h-screen bg-gradient-to-br from-ivory via-paper to-accent-cream">
      <div className="max-w-2xl mx-auto px-6 py-20">
        <div className="rounded-3xl border border-tan/30 bg-white/85 p-8 md:p-10 shadow-vintage-lg backdrop-blur-sm">
          <p className={`${lora.className} text-sm uppercase tracking-[0.22em] text-olive mb-4`}>
            Private collector preview
          </p>
          <h1 className={`${cormorant.className} text-4xl md:text-5xl font-light text-brown mb-4`}>
            Originals Collector Access
          </h1>
          <p className={`${lora.className} text-warm-gray mb-8`}>
            Enter the collector password to open the private originals gallery.
          </p>

          <form action="/originals-collectors-access/unlock" method="post" className="space-y-4">
            <div>
              <label htmlFor="collector-password" className={`${lora.className} block text-brown font-medium mb-2`}>
                Password
              </label>
              <input
                id="collector-password"
                name="password"
                type="password"
                required
                className="w-full rounded-xl border border-tan/50 bg-white px-4 py-3 text-brown focus:outline-none focus:ring-2 focus:ring-olive/20 focus:border-olive transition-all duration-200"
                placeholder="Enter password"
              />
            </div>

            {showError && (
              <p className={`${lora.className} text-sm text-red-700`}>
                That password was incorrect. Please try again.
              </p>
            )}

            <button
              type="submit"
              className={`inline-flex items-center justify-center rounded-full border-2 border-black/80 bg-gradient-to-r from-btn-brown to-btn-brown-hover px-8 py-3 text-paper shadow-vintage transition-all duration-500 hover:-translate-y-0.5 hover:shadow-vintage-lg ${lora.className}`}
            >
              Open collector gallery
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
