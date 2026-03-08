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
    <section className="min-h-screen bg-gradient-to-br from-ivory via-paper to-accent-cream">
      <div className="max-w-6xl mx-auto py-16 px-6">
        {/* Back to Print Shop Button */}
        <div className="mb-8">
          <Link href="/prints">
            <button className={`flex items-center space-x-2 px-6 py-3 bg-white/80 border border-tan/50 text-brown rounded-lg hover:bg-olive/5 hover:border-olive transition-all duration-200 ${lora.className}`}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
              </svg>
              <span>Back to Print Shop</span>
            </button>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Artwork Image */}
          {printItem.mainImage?.asset && (
            <div className="bg-white/80 backdrop-blur-sm border border-tan/30 rounded-2xl overflow-hidden shadow-vintage-lg">
              <div className="relative w-full h-96 lg:h-[600px]">
                <Image
                  src={urlFor(printItem.mainImage).width(800).height(800).url()}
                  alt={printItem.title}
                  fill
                  style={{ objectFit: "cover" }}
                  className="transition-transform duration-300 hover:scale-105"
                />
              </div>
            </div>
          )}

          {/* Print Details and Ordering */}
          <div className="space-y-8">
            <div className="bg-white/80 backdrop-blur-sm border border-tan/30 rounded-2xl p-8 shadow-vintage-lg">
              <h1 className={`${cormorant.className} text-4xl font-light mb-4 text-brown tracking-wide`}>
                {printItem.title}
              </h1>
              
              {printItem.description && (
                <div className={`${lora.className} text-warm-gray leading-relaxed mb-6 whitespace-pre-wrap`}>
                  {printItem.description}
                </div>
              )}

              <div className="border-t border-tan/30 pt-6">
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
              <div className="bg-white/80 backdrop-blur-sm border border-tan/30 rounded-2xl p-8 shadow-vintage-lg text-center">
                <span className={`${lora.className} text-red-600 font-medium text-lg`}>
                  This print is currently unavailable
                </span>
              </div>
            ) : (
              <LumaPrintPurchase 
                artworkTitle={printItem.title}
                artworkImageUrl={printItem.mainImage?.asset ? urlFor(printItem.mainImage).width(800).height(800).url() : undefined}
              />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
