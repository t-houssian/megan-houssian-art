// app/prints/[slug]/page.tsx
import { sanityClient } from "../../../lib/sanity";
import ImageUrlBuilder from "@sanity/image-url";
import Image from "next/image";
import LumaPrintPurchase from "../../components/LumaPrintPurchase";
import Link from "next/link";
import { cormorant, lora } from "../../fonts";
import { notFound } from "next/navigation";

const builder = ImageUrlBuilder(sanityClient);
function urlFor(source: { asset: { _ref: string } }) {
  return builder.image(source);
}

type PrintProduct = {
  _id: string;
  title: string;
  mainImage?: { asset: { _ref: string } };
  price?: number;
  soldOut?: boolean;
  description?: string;
};

function getImageDimensions(image?: { asset: { _ref: string } }) {
  const match = image?.asset?._ref?.match(/-(\d+)x(\d+)-/);
  const width = match ? Number(match[1]) : 1200;
  const height = match ? Number(match[2]) : 1500;

  return {
    width: Number.isFinite(width) && width > 0 ? width : 1200,
    height: Number.isFinite(height) && height > 0 ? height : 1500,
  };
}

async function fetchPrintBySlug(slug: string): Promise<PrintProduct | null> {
  const query = `
    *[_type == "print" && slug.current == $slug][0]{
      _id,
      title,
      mainImage,
      price,
      soldOut,
      description
    }
  `;
  return sanityClient.fetch(query, { slug });
}

// Here we indicate that `params` is a Promise that resolves to an object with a slug.
interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function PrintDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const printItem = await fetchPrintBySlug(slug);

  if (!printItem) {
    notFound();
  }

  return (
    <section className="min-h-screen bg-ivory">
      <div className="max-w-7xl mx-auto py-16 px-6">
        {/* Back to Print Shop Button */}
        <div className="mb-8">
          <Link href="/prints" className={`inline-flex items-center space-x-2 text-brown hover:text-olive transition-colors duration-300 ${lora.className}`}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
              </svg>
              <span>Back to Print Shop</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.2fr)_minmax(360px,0.8fr)] gap-12 lg:gap-16">
          {/* Artwork Image */}
          {printItem.mainImage?.asset && (
            <Image
              src={urlFor(printItem.mainImage).width(1600).fit("max").quality(92).url()}
              alt={printItem.title}
              width={getImageDimensions(printItem.mainImage).width}
              height={getImageDimensions(printItem.mainImage).height}
              className="h-auto w-full object-contain"
              sizes="(min-width: 1280px) 48vw, (min-width: 1024px) 55vw, 92vw"
              priority
            />
          )}

          {/* Print Details and Ordering */}
          <div className="space-y-10 lg:pt-12">
            <div>
              <h1 className={`${cormorant.className} text-4xl font-light mb-4 text-brown tracking-wide`}>
                {printItem.title}
              </h1>
              
              {printItem.description && (
                <div className={`${lora.className} text-warm-gray leading-relaxed mb-6 whitespace-pre-wrap`}>
                  {printItem.description}
                </div>
              )}

              <div className="border-t border-tan/40 pt-6">
                <h3 className={`${cormorant.className} text-xl font-medium text-brown mb-3`}>
                  Professional Print Services by Luma Labs
                </h3>
                <p className={`${lora.className} text-warm-gray text-sm leading-relaxed`}>
                  High-quality prints professionally produced and shipped directly to you. 
                  Choose from multiple print types and sizes, all with premium materials and finishes.
                </p>
              </div>
            </div>

            {/* Luma Labs Purchase Section */}
            {printItem.soldOut ? (
              <div className="border-y border-tan/50 py-5 text-center">
                <span className={`${lora.className} text-red-600 font-medium text-lg`}>
                  This print is currently unavailable
                </span>
              </div>
            ) : (
              <LumaPrintPurchase 
                artworkTitle={printItem.title}
                artworkImageUrl={printItem.mainImage?.asset ? urlFor(printItem.mainImage).width(800).height(800).url() : undefined}
                printSlug={slug}
              />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
