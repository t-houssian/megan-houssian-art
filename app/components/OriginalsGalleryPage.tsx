import { cormorant, lora } from '../fonts';
import { fetchOriginals, type OriginalCollectionSummary } from '../../lib/originals';
import { originalDetailHref } from '../../lib/original-collections';
import OriginalArtworkCard from './OriginalArtworkCard';

type OriginalsGalleryPageProps = {
  sourcePath: string;
  collection?: OriginalCollectionSummary;
};

export default async function OriginalsGalleryPage({
  sourcePath,
  collection,
}: OriginalsGalleryPageProps) {
  const allOriginals = await fetchOriginals(sourcePath === '/hidden-originals' ? 'hidden' : 'public');
  const originals = collection
    ? allOriginals.filter((item) => item.collections.some((assigned) => assigned._id === collection._id))
    : allOriginals;

  return (
    <section className="min-h-screen bg-ivory">
      {collection && <h1 className="sr-only">{collection.title}</h1>}
      <div className="max-w-7xl mx-auto px-0 pt-8 pb-16 sm:px-6">
        {originals.length === 0 ? (
          <div className="max-w-3xl mx-auto border-y border-tan/40 px-6 py-10 text-center sm:px-0">
            <h2 className={`${cormorant.className} text-3xl text-brown mb-3`}>
              {collection ? 'No pieces are listed in this collection yet' : 'No originals are listed yet'}
            </h2>
            <p className={`${lora.className} text-warm-gray`}>
              {collection
                ? 'Please check back for new work.'
                : sourcePath === '/hidden-originals'
                ? 'Mark originals as hidden in Sanity and they will appear here automatically.'
                : 'Add original artworks in Sanity and they will appear here automatically.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {originals.map((item) => (
              <OriginalArtworkCard
                key={item._id}
                item={item}
                detailHref={originalDetailHref(item.slug.current, sourcePath)}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
