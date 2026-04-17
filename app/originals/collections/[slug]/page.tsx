import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import OriginalArtworkCard from '../../../components/OriginalArtworkCard';
import { cormorant, lora } from '../../../fonts';
import { fetchOriginalCollectionBySlug } from '../../../../lib/originals';

export const revalidate = 60;

const ALLOWED_SOURCE_PATHS = new Set([
  '/hidden-originals',
  '/originals-collectors-access',
]);

type CollectionPageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ from?: string | string[] }>;
};

function getFirstParam(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

function getSourcePath(value?: string | string[]) {
  const sourcePath = getFirstParam(value);
  return sourcePath && ALLOWED_SOURCE_PATHS.has(sourcePath) ? sourcePath : undefined;
}

function buildDetailHref(originalSlug: string, collectionSlug: string) {
  const params = new URLSearchParams({ from: `/originals/collections/${collectionSlug}` });
  return `/originals/${originalSlug}?${params.toString()}`;
}

function buildCollectionHref(collectionSlug: string, sourcePath?: string) {
  const href = `/originals/collections/${collectionSlug}`;

  if (!sourcePath) {
    return href;
  }

  const params = new URLSearchParams({ from: sourcePath });
  return `${href}?${params.toString()}`;
}

export async function generateMetadata({ params }: Pick<CollectionPageProps, 'params'>): Promise<Metadata> {
  const { slug: rawSlug } = await params;
  const collection = await fetchOriginalCollectionBySlug(decodeURIComponent(rawSlug));

  return {
    title: collection
      ? `${collection.title} | Original Collections | Megan Houssian Art`
      : 'Original Collection | Megan Houssian Art',
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default async function OriginalCollectionPage({
  params,
  searchParams,
}: CollectionPageProps) {
  const { slug: rawSlug } = await params;
  const resolvedSearchParams = await searchParams;
  const slug = decodeURIComponent(rawSlug);
  const sourcePath = getSourcePath(resolvedSearchParams.from);
  const collection = await fetchOriginalCollectionBySlug(slug);

  if (!collection) {
    notFound();
  }

  const backHref = sourcePath ?? '/originals/collections';

  return (
    <section className="min-h-screen bg-ivory">
      <div className="max-w-7xl mx-auto py-12 px-6">
        <div className="mb-8">
          <Link
            href={backHref}
            className={`group inline-flex items-center space-x-2 text-brown hover:text-olive transition-colors duration-300 ${lora.className}`}
          >
            <svg className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
            <span>{sourcePath ? 'Back to Gallery' : 'Back to Collections'}</span>
          </Link>
        </div>

        <div className="text-center mb-12">
          <p className={`${lora.className} text-sm uppercase tracking-[0.22em] text-olive mb-4`}>
            Original collection
          </p>
          <h1 className={`${cormorant.className} text-4xl md:text-5xl font-light mb-4 text-brown tracking-wide`}>
            {collection.title}
          </h1>
          {collection.description && (
            <p className={`${lora.className} text-lg text-warm-gray max-w-3xl mx-auto leading-relaxed whitespace-pre-wrap`}>
              {collection.description}
            </p>
          )}
        </div>

        {collection.originals.length === 0 ? (
          <div className="max-w-3xl mx-auto border-y border-tan/40 py-10 text-center">
            <h2 className={`${cormorant.className} text-3xl text-brown mb-3`}>No pieces are listed yet</h2>
            <p className={`${lora.className} text-warm-gray`}>
              Add originals to this collection in Sanity and they will appear here automatically.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {collection.originals.map((item) => (
              <OriginalArtworkCard
                key={item._id}
                item={item}
                detailHref={buildDetailHref(item.slug.current, collection.slug.current)}
                collectionHref={(collectionSlug) => buildCollectionHref(collectionSlug, sourcePath)}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
