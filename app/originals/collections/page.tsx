import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { cormorant, lora } from '../../fonts';
import { fetchOriginalCollections } from '../../../lib/originals';
import { urlFor } from '../../../sanity/lib/image';

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
        <div className="mb-8">
          <Link
            href="/originals"
            className={`group inline-flex items-center space-x-2 px-4 py-2 bg-white/60 backdrop-blur-sm border border-tan/30 text-brown rounded-lg hover:bg-olive/10 hover:border-olive/50 transition-all duration-300 ${lora.className}`}
          >
            <svg className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
            <span>Back to Originals</span>
          </Link>
        </div>

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
                className="group block overflow-hidden border border-tan/30 bg-white/80 shadow-vintage hover:shadow-vintage-lg transition-all duration-300 hover:-translate-y-1"
              >
                {collection.sampleOriginals && collection.sampleOriginals.length > 0 && (
                  <div className="grid h-52 grid-cols-4 grid-rows-2 gap-1 bg-paper">
                    {collection.sampleOriginals.map((sample, index) => (
                      <div
                        key={sample._id}
                        className={`relative overflow-hidden ${
                          index === 0 ? 'col-span-2 row-span-2' : 'col-span-1 row-span-1'
                        }`}
                      >
                        {sample.mainImage?.asset && (
                          <Image
                            src={urlFor(sample.mainImage).width(index === 0 ? 640 : 320).height(index === 0 ? 520 : 260).fit('crop').url()}
                            alt={sample.title}
                            fill
                            className="object-cover transition-transform duration-700 group-hover:scale-105"
                            sizes="(min-width: 768px) 25vw, 46vw"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                )}

                <div className="p-7">
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
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
