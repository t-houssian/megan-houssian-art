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
  return ALLOWED_BACK_LINKS.has(href);
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
    <section className="min-h-screen bg-ivory">
      <div className="max-w-7xl mx-auto py-12 px-6">
        {/* Back Navigation */}
        <div className="mb-8">
          <Link
            href={backHref}
            className={`group inline-flex items-center space-x-2 text-brown hover:text-olive transition-colors duration-300 ${lora.className}`}
          >
            <svg className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
            <span>Back to Gallery</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.2fr)_minmax(360px,0.8fr)] gap-12 lg:gap-16">
          {/* Left Column: Gallery */}
          <ArtworkGallery
            mainImage={artwork.mainImage}
            gallery={artwork.gallery}
            title={artwork.title}
          />

          {/* Right Column: Artwork Details */}
          <div className="space-y-10 lg:pt-12">
            {/* Title Section */}
            <div>
              <h1 className={`${cormorant.className} text-3xl md:text-4xl font-light mb-4 text-brown leading-tight`}>
                {artwork.title}
              </h1>
              <div className="w-16 h-0.5 bg-olive mb-6"></div>
              
              <PurchaseSection 
                title={artwork.title} 
                basePrice={artwork.price || 0}
                originalSlug={artwork.slug.current}
                isTestProduct={artwork.testProduct}
                earlyAccess={artwork.earlyAccess}
                isSold={artwork.sold}
              />
            </div>

            {/* Description Section */}
            {artwork.description && (
              <div className="border-t border-tan/40 pt-8">
                <h2 className={`${cormorant.className} text-2xl font-medium mb-4 text-brown`}>
                  About This Piece
                </h2>
                <div className="w-12 h-0.5 bg-olive mb-6"></div>
                <div className={`${lora.className} text-warm-gray leading-relaxed whitespace-pre-wrap`}>
                  {artwork.description}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
