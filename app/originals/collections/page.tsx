import type { Metadata } from 'next';
import Link from 'next/link';
import { cormorant, lora } from '../../fonts';
import { fetchOriginalCollections } from '../../../lib/originals';

export const metadata: Metadata = {
  title: 'Original Collections | Megan Houssian Art',
  robots: {
    index: false,
    follow: false,
  },
};

export const revalidate = 60;

export default async function OriginalsCollectionsPage() {
  const collections = await fetchOriginalCollections();

  return (
    <section className="min-h-screen bg-gradient-to-br from-ivory via-paper to-accent-cream">
      <div className="max-w-6xl mx-auto py-16 px-6">
        <div className="text-center mb-12">
          <h1 className={`${cormorant.className} text-4xl md:text-5xl font-light mb-6 text-brown tracking-wide`}>
            Original Collections
          </h1>
          <p className={`${lora.className} text-lg text-warm-gray max-w-2xl mx-auto leading-relaxed`}>
            Browse available originals by curated collection.
          </p>
        </div>

        {collections.length === 0 ? (
          <div className="max-w-3xl mx-auto rounded-2xl border border-tan/30 bg-white/80 p-10 text-center shadow-vintage">
            <h2 className={`${cormorant.className} text-3xl text-brown mb-3`}>No collections are listed yet</h2>
            <p className={`${lora.className} text-warm-gray`}>
              Add original collections in Sanity and they will appear here automatically.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {collections.map((collection) => (
              <Link
                key={collection._id}
                href={`/originals/collections/${collection.slug.current}`}
                className="group block border border-tan/30 bg-white/80 p-7 shadow-vintage hover:shadow-vintage-lg transition-all duration-300 hover:-translate-y-1"
              >
                <p className={`${lora.className} mb-3 text-xs uppercase tracking-[0.2em] text-olive`}>
                  {collection.pieceCount ?? 0} {(collection.pieceCount ?? 0) === 1 ? 'piece' : 'pieces'}
                </p>
                <h2 className={`${cormorant.className} text-3xl font-light text-brown group-hover:text-olive transition-colors duration-300`}>
                  {collection.title}
                </h2>
                {collection.description && (
                  <p className={`${lora.className} mt-4 line-clamp-3 text-sm leading-6 text-warm-gray`}>
                    {collection.description}
                  </p>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
