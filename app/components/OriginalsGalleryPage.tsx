import { cormorant, lora } from '../fonts';
import { fetchOriginals } from '../../lib/originals';
import OriginalArtworkCard from './OriginalArtworkCard';

type OriginalsGalleryPageProps = {
  sourcePath: '/originals' | '/hidden-originals' | '/originals-collectors-access';
};

function buildDetailHref(slug: string, sourcePath: OriginalsGalleryPageProps['sourcePath']) {
  const params = new URLSearchParams({ from: sourcePath });
  return `/originals/${slug}?${params.toString()}`;
}

export default async function OriginalsGalleryPage({ sourcePath }: OriginalsGalleryPageProps) {
  const originals = await fetchOriginals();

  return (
    <section className="min-h-screen bg-ivory">
      <div className="max-w-7xl mx-auto px-6 pt-8 pb-16">
        {originals.length === 0 ? (
          <div className="max-w-3xl mx-auto border-y border-tan/40 py-10 text-center">
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
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
