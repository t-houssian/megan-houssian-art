// app/originals/[slug]/page.tsx
import ArtworkGallery from "../../components/ArtworkGallery";
import PurchaseSection from "../../components/PurchaseSection";
import Link from "next/link";
import { cormorant, lora } from "../../fonts";
import { fetchOriginalBySlug } from "../../../lib/originals";

export const revalidate = 0;

const ALLOWED_BACK_LINKS = new Set([
  '/hidden-originals',
  '/originals-collectors-access',
]);

function isAllowedBackHref(href: string) {
  return ALLOWED_BACK_LINKS.has(href) || /^\/originals\/collections\/[a-z0-9-]+$/.test(href);
}

function buildCollectionHref(slug: string, sourceHref: string) {
  const collectionHref = `/originals/collections/${slug}`;

  if (!ALLOWED_BACK_LINKS.has(sourceHref)) {
    return collectionHref;
  }

  const params = new URLSearchParams({ from: sourceHref });
  return `${collectionHref}?${params.toString()}`;
}

// Instead of typing props directly, we accept props as unknown and then assert its type.
export default async function OriginalDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ from?: string | string[] }>;
}) {
  const { slug: rawSlug } = await params;
  const resolvedSearchParams = await searchParams;
  const slugParam = rawSlug;
  const slug = decodeURIComponent(slugParam);
  const artwork = await fetchOriginalBySlug(slug);
  const fromParam = Array.isArray(resolvedSearchParams.from)
    ? resolvedSearchParams.from[0]
    : resolvedSearchParams.from;
  const backHref = fromParam && isAllowedBackHref(fromParam) ? fromParam : '/originals';

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
          <Link
            href={backHref}
            className={`group inline-flex items-center space-x-2 px-4 py-2 bg-white/60 backdrop-blur-sm border border-tan/30 text-brown rounded-lg hover:bg-olive/10 hover:border-olive/50 transition-all duration-300 ${lora.className}`}
          >
            <svg className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
            <span>Back to Gallery</span>
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

              {artwork.collections.length > 0 && (
                <div className={`${lora.className} mb-6 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm`}>
                  <span className="uppercase tracking-[0.18em] text-warm-gray">In collection</span>
                  {artwork.collections.map((collection) => (
                    <Link
                      key={collection._id}
                      href={buildCollectionHref(collection.slug.current, backHref)}
                      className="font-medium text-olive underline underline-offset-4 hover:text-brown transition-colors duration-200"
                    >
                      {collection.title}
                    </Link>
                  ))}
                </div>
              )}
              
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
                  originalSlug={artwork.slug.current}
                  isTestProduct={artwork.testProduct}
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
                {artwork.collections.length > 0 && (
                  <div className="flex justify-between gap-6">
                    <span>Collection</span>
                    <span className="flex flex-wrap justify-end gap-x-2 gap-y-1 text-right font-medium text-brown">
                      {artwork.collections.map((collection) => (
                        <Link
                          key={collection._id}
                          href={buildCollectionHref(collection.slug.current, backHref)}
                          className="text-olive underline underline-offset-4 hover:text-brown transition-colors duration-200"
                        >
                          {collection.title}
                        </Link>
                      ))}
                    </span>
                  </div>
                )}
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
