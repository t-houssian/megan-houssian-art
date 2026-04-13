import Image from 'next/image';
import Link from 'next/link';
import { cormorant, lora } from '../fonts';
import { fetchOriginals } from '../../lib/originals';
import { fetchOriginalsPageSettings } from '../../lib/originals-page-settings';
import { urlFor } from '../../sanity/lib/image';

type OriginalsGalleryPageProps = {
  sourcePath: '/hidden-originals' | '/originals-collectors-access';
};

function buildDetailHref(slug: string, sourcePath: OriginalsGalleryPageProps['sourcePath']) {
  const params = new URLSearchParams({ from: sourcePath });
  return `/originals/${slug}?${params.toString()}`;
}

function formatPrice(price?: number) {
  if (!Number.isFinite(price) || !price || price <= 0) {
    return 'Price available on request';
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(price);
}

export default async function OriginalsGalleryPage({ sourcePath }: OriginalsGalleryPageProps) {
  const [settings, originals] = await Promise.all([
    fetchOriginalsPageSettings(),
    fetchOriginals(),
  ]);

  return (
    <section className="min-h-screen bg-gradient-to-br from-ivory via-paper to-accent-cream">
      <div className="max-w-7xl mx-auto py-16 px-6">
        <div className="text-center mb-12">
          <p className={`${lora.className} text-sm uppercase tracking-[0.22em] text-olive mb-4`}>
            Private access gallery
          </p>
          <h1 className={`${cormorant.className} text-4xl md:text-5xl font-light mb-4 text-brown tracking-wide`}>
            {settings.availableOriginalsLabel}
          </h1>
          <p className={`${lora.className} text-lg text-warm-gray max-w-3xl mx-auto`}>
            {settings.availableOriginalsAnnouncement}
          </p>
          <p className={`${lora.className} text-base text-warm-gray max-w-3xl mx-auto mt-4`}>
            {settings.availableOriginalsDescription}
          </p>
        </div>

        {originals.length === 0 ? (
          <div className="max-w-3xl mx-auto rounded-2xl border border-tan/30 bg-white/80 p-10 text-center shadow-vintage">
            <h2 className={`${cormorant.className} text-3xl text-brown mb-3`}>No originals are listed yet</h2>
            <p className={`${lora.className} text-warm-gray`}>
              Add original artworks in Sanity and they will appear here automatically.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {originals.map((item) => (
              <Link key={item._id} href={buildDetailHref(item.slug.current, sourcePath)}>
                <article className="group h-full cursor-pointer">
                  <div className="h-full bg-white/80 backdrop-blur-sm border border-tan/30 rounded-2xl overflow-hidden shadow-vintage hover:shadow-vintage-lg transition-all duration-500 transform hover:-translate-y-2">
                    {item.mainImage?.asset && (
                      <div className="relative w-full h-80 overflow-hidden bg-paper">
                        <Image
                          src={urlFor(item.mainImage).width(900).height(1100).fit('crop').url()}
                          alt={item.title}
                          fill
                          className="object-cover transition-transform duration-700 group-hover:scale-105"
                          sizes="(min-width: 1280px) 28vw, (min-width: 640px) 44vw, 92vw"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                        {item.sold && (
                          <div className="absolute top-4 left-4 rounded-full bg-paper/95 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-brown shadow-vintage">
                            Sold
                          </div>
                        )}
                      </div>
                    )}

                    <div className="p-6">
                      <h2 className={`${cormorant.className} text-2xl font-medium mb-3 text-brown group-hover:text-olive transition-colors duration-300`}>
                        {item.title}
                      </h2>

                      <div className="flex items-end justify-between gap-4">
                        <div>
                          <p className={`${lora.className} text-sm text-warm-gray mb-1`}>
                            {item.sold ? 'Previously collected' : 'Original artwork · Free shipping'}
                          </p>
                          <p className={`${lora.className} text-lg font-medium text-brown`}>
                            {item.sold ? 'Unavailable' : formatPrice(item.price)}
                          </p>
                        </div>

                        <span className={`${lora.className} text-sm font-medium text-olive opacity-0 group-hover:opacity-100 transition-opacity duration-300`}>
                          View piece →
                        </span>
                      </div>
                    </div>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
