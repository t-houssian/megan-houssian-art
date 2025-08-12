// app/prints/[slug]/page.tsx
import { sanityClient } from "../../../lib/sanity";
import ImageUrlBuilder from "@sanity/image-url";
import Image from "next/image";
import PurchaseSection from "../../components/PurchaseSection";
import Link from "next/link";
import { cormorant, lora } from "../../fonts";

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
    return (
      <div className="max-w-7xl mx-auto py-16 px-4">
        <h1 className={`text-2xl font-bold text-[var(--text-brown)] ${cormorant.className}`}>Print Not Found</h1>
      </div>
    );
  }

  return (
    <section className="max-w-5xl mx-auto py-16 px-4">
      {/* Back to Print Shop Button */}
      <div className="mb-4">
        <Link href="/prints">
          <button className={`px-4 py-2 bg-[var(--bg-paper)] border border-[var(--text-brown)] text-[var(--text-brown)] rounded hover:bg-[var(--btn-brown)] hover:text-white transition-colors ${lora.className}`}>
            ← Back to Print Shop
          </button>
        </Link>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {printItem.mainImage?.asset && (
          <div className="relative w-full h-96 bg-gray-100">
            <Image
              src={urlFor(printItem.mainImage).width(800).height(800).url()}
              alt={printItem.title}
              fill
              style={{ objectFit: "cover" }}
            />
          </div>
        )}
        <div>
          <h1 className={`text-3xl font-bold mb-4 text-[var(--text-brown)] ${cormorant.className}`}>{printItem.title}</h1>
          {printItem.soldOut ? (
            <span className={`inline-block text-red-600 font-bold ${lora.className}`}>Sold Out</span>
          ) : (
            <PurchaseSection title={printItem.title} basePrice={printItem.price || 0} />
          )}
          {printItem.description && (
            <div className={`mt-6 text-[var(--text-brown)] whitespace-pre-wrap ${lora.className}`}>
              {printItem.description}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
