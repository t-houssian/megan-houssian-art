import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import OriginalsGalleryPage from '../../../components/OriginalsGalleryPage';
import { fetchOriginalCollections } from '../../../../lib/originals';
import { originalCollectionHref } from '../../../../lib/original-collections';

export const revalidate = 0;

type CollectionPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: CollectionPageProps): Promise<Metadata> {
  const { slug } = await params;
  const collection = (await fetchOriginalCollections()).find((item) => item.slug.current === slug);
  return { title: `${collection?.title ?? 'Originals'} | Megan Houssian Art` };
}

export default async function OriginalCollectionPage({ params }: CollectionPageProps) {
  const { slug } = await params;
  const collections = await fetchOriginalCollections();
  const collection = collections.find((item) => item.slug.current === slug);
  if (!collection) notFound();

  return (
    <OriginalsGalleryPage
      sourcePath={originalCollectionHref(collection.slug.current)}
      collection={collection}
    />
  );
}
