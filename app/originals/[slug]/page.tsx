// app/originals/[slug]/page.tsx
import { sanityClient } from "../../../lib/sanity";
import ArtworkGallery from "../../components/ArtworkGallery";
import PurchaseSection from "../../components/PurchaseSection";
import Link from "next/link";
import { cormorant, lora } from "../../fonts";

export const revalidate = 0;

type OriginalArtwork = {
  _id: string;
  title: string;
  mainImage?: { asset: { _ref: string } };
  gallery?: Array<{ asset: { _ref: string } }>;
  price?: number;
  sold?: boolean;
  description?: string;
  shipping?: {
    weight?: number;
    dimensions?: {
      length?: number;
      width?: number;
      height?: number;
    };
  };
};

async function fetchOriginalBySlug(slug: string): Promise<OriginalArtwork | null> {
  const query = `
    *[_type == "original" && slug.current == $slug][0]{
      _id,
      title,
      mainImage,
      gallery,
      price,
      sold,
      description,
      shipping
    }
  `;
  return sanityClient.fetch(query, { slug });
}

// Instead of typing props directly, we accept props as unknown and then assert its type.
export default async function OriginalDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug: rawSlug } = await params;
  const slugParam = rawSlug;
  const slug = decodeURIComponent(slugParam);
  const artwork = await fetchOriginalBySlug(slug);

  if (!artwork) {
    return (
      <div className="max-w-7xl mx-auto py-16 px-4">
  <h1 className={`text-2xl font-medium text-[var(--text-brown)] ${cormorant.className}`}>Artwork Not Found</h1>
      </div>
    );
  }

  return (
    <section className="min-h-screen bg-gradient-to-br from-ivory via-paper to-accent-cream">
      <div className="max-w-6xl mx-auto py-12 px-6">
        {/* Back Navigation */}
        <div className="mb-8">
          <Link href="/originals">
            <button className={`group flex items-center space-x-2 px-4 py-2 bg-white/60 backdrop-blur-sm border border-tan/30 text-brown rounded-lg hover:bg-olive/10 hover:border-olive/50 transition-all duration-300 ${lora.className}`}>
              <svg className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
              <span>Back to Gallery</span>
            </button>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left Column: Gallery */}
          <div className="bg-white/80 backdrop-blur-sm border border-tan/30 rounded-2xl p-8 shadow-vintage-lg">
            <ArtworkGallery
              mainImage={artwork.mainImage}
              gallery={artwork.gallery}
              title={artwork.title}
            />
          </div>

          {/* Right Column: Artwork Details */}
          <div className="space-y-8">
            {/* Title Section */}
            <div className="bg-white/80 backdrop-blur-sm border border-tan/30 rounded-2xl p-8 shadow-vintage-lg">
              <h1 className={`${cormorant.className} text-3xl md:text-4xl font-light mb-4 text-brown leading-tight`}>
                {artwork.title}
              </h1>
              <div className="w-16 h-0.5 bg-olive mb-6"></div>
              
              {artwork.sold ? (
                <div className="bg-ivory border border-tan/60 rounded-xl p-6">
                  <div className="flex items-center gap-3">
                    <span className="inline-flex items-center rounded-full bg-tan/60 text-brown px-2.5 py-0.5 text-xs font-semibold border border-tan/80">
                      sold
                    </span>
                    <span className={`${lora.className} text-warm-gray text-sm`}>
                      This artwork is no longer available for purchase
                    </span>
                  </div>
                </div>
              ) : (
                <PurchaseSection 
                  title={artwork.title} 
                  basePrice={artwork.price || 0}
                />
              )}
            </div>

            {/* Description Section */}
            {artwork.description && (
              <div className="bg-white/80 backdrop-blur-sm border border-tan/30 rounded-2xl p-8 shadow-vintage-lg">
                <h2 className={`${cormorant.className} text-2xl font-medium mb-4 text-brown`}>
                  About This Piece
                </h2>
                <div className="w-12 h-0.5 bg-olive mb-6"></div>
                <div className={`${lora.className} text-warm-gray leading-relaxed whitespace-pre-wrap`}>
                  {artwork.description}
                </div>
              </div>
            )}

            {/* Additional Info */}
            <div className="bg-white/80 backdrop-blur-sm border border-tan/30 rounded-2xl p-8 shadow-vintage-lg">
              <h3 className={`${cormorant.className} text-xl font-medium mb-4 text-brown`}>
                Artwork Details
              </h3>
              <div className="w-12 h-0.5 bg-olive mb-6"></div>
              <div className="space-y-3 text-sm text-warm-gray">
                <div className="flex justify-between">
                  <span>Original Artwork</span>
                  <span className="font-medium text-brown">One-of-a-kind</span>
                </div>
                <div className="flex justify-between">
                  <span>Artist</span>
                  <span className="font-medium text-brown">Megan Houssian</span>
                </div>
                <div className="flex justify-between">
                  <span>Authenticity</span>
                  <span className="font-medium text-brown">Artist Signed</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span className="font-medium text-brown">Free shipping included</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
