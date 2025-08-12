import { sanityClient } from '../../lib/sanity';
import ImageUrlBuilder from '@sanity/image-url';
import Link from 'next/link';
import Image from 'next/image';
import { cormorant, lora } from '../fonts';

const builder = ImageUrlBuilder(sanityClient);
function urlFor(source: { asset: { _ref: string } }) {
  return builder.image(source);
}

type OriginalArtwork = {
  _id: string;
  title: string;
  slug: { current: string };
  mainImage?: { asset: { _ref: string } };
  price?: number;
  sold?: boolean;
};

async function fetchOriginals(): Promise<OriginalArtwork[]> {
  const query = `
    *[_type == "original" && defined(slug.current)]{
      _id,
      title,
      "slug": slug,
      mainImage,
      price,
      sold
    } | order(_createdAt desc)
  `;
  return sanityClient.fetch(query);
}

export default async function OriginalsPage() {
  const originals = await fetchOriginals();

  return (
    <section className="min-h-screen bg-gradient-to-br from-ivory via-paper to-accent-cream">
      <div className="max-w-7xl mx-auto py-16 px-6">
        {/* Elegant Header */}
        <div className="text-center mb-16">
          <h1 className={`${cormorant.className} text-4xl md:text-5xl font-light mb-6 text-brown tracking-wide`}>
            Original Artworks
          </h1>
          <div className="w-32 h-0.5 bg-gradient-to-r from-transparent via-olive to-transparent mx-auto mb-8"></div>
          <p className={`${lora.className} text-lg text-warm-gray max-w-3xl mx-auto leading-relaxed`}>
            Each piece in the collection is a unique, one-of-a-kind creation. Discover the perfect artwork to grace your space and become part of your personal story.
          </p>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {originals.map((art) => (
            <Link key={art._id} href={`/originals/${art.slug.current}`}>
              <div className="group cursor-pointer">
                <div className="bg-white/80 backdrop-blur-sm border border-tan/30 rounded-2xl overflow-hidden shadow-vintage hover:shadow-vintage-lg transition-all duration-500 transform hover:-translate-y-2">
                  {art.mainImage?.asset && (
                    <div className="relative w-full h-80 overflow-hidden bg-paper">
                      <Image
                        src={urlFor(art.mainImage).width(600).height(600).url()}
                        alt={art.title}
                        fill
                        style={{ objectFit: 'cover' }}
                        className="transition-transform duration-700 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300"></div>
                      {art.sold && (
                        <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium shadow-lg">
                          SOLD
                        </div>
                      )}
                    </div>
                  )}
                  
                  <div className="p-6">
                    <h2 className={`${cormorant.className} text-2xl font-medium mb-3 text-brown group-hover:text-olive transition-colors duration-300`}>
                      {art.title}
                    </h2>
                    
                    <div className="flex items-center justify-between">
                      <p className={`${lora.className} text-lg font-semibold text-warm-gray`}>
                        ${art.price?.toLocaleString() || 0}
                      </p>
                      
                      {!art.sold && (
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <span className="text-olive text-sm font-medium">View Details →</span>
                        </div>
                      )}
                    </div>
                    
                    {art.sold && (
                      <div className="mt-2">
                        <span className="text-red-600 font-medium text-sm">
                          This piece has found its home
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Footer Message */}
        <div className="text-center mt-16">
          <div className="bg-white/60 backdrop-blur-sm border border-tan/30 rounded-2xl p-8 max-w-2xl mx-auto">
            <p className={`${lora.className} text-warm-gray leading-relaxed mb-4`}>
              Can&apos;t find exactly what you&apos;re looking for? We&apos;d love to create something unique just for you.
            </p>
            <Link href="/commissions">
              <button className={`bg-gradient-to-r from-btn-brown to-btn-brown-hover text-paper px-8 py-4 rounded-lg hover:from-btn-brown-hover hover:to-brown transition-all duration-500 font-serif text-lg shadow-vintage hover:shadow-vintage-lg transform hover:-translate-y-1 border border-opacity-20 border-paper relative overflow-hidden group ${lora.className}`}>
                <span className="relative z-10">Commission a Custom Piece</span>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-paper to-transparent opacity-0 group-hover:opacity-10 transform -skew-x-12 group-hover:translate-x-full transition-all duration-700"></div>
              </button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
