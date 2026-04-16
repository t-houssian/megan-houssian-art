import { cormorant, lora } from '../fonts';
import { fetchOriginals } from '../../lib/originals';
import { fetchOriginalsPageSettings } from '../../lib/originals-page-settings';
import OriginalArtworkCard from './OriginalArtworkCard';

type OriginalsGalleryPageProps = {
  sourcePath: '/hidden-originals' | '/originals-collectors-access';
};

function buildDetailHref(slug: string, sourcePath: OriginalsGalleryPageProps['sourcePath']) {
  const params = new URLSearchParams({ from: sourcePath });
  return `/originals/${slug}?${params.toString()}`;
}

function buildCollectionHref(slug: string, sourcePath: OriginalsGalleryPageProps['sourcePath']) {
  const params = new URLSearchParams({ from: sourcePath });
  return `/originals/collections/${slug}?${params.toString()}`;
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
              <OriginalArtworkCard
                key={item._id}
                item={item}
                detailHref={buildDetailHref(item.slug.current, sourcePath)}
                collectionHref={(slug) => buildCollectionHref(slug, sourcePath)}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
