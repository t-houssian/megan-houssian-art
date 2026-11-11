import { redirect } from 'next/navigation';
import OriginalsGalleryPage from '../components/OriginalsGalleryPage';
import { fetchOriginalCollections } from '../../lib/originals';
import { originalCollectionLinks } from '../../lib/original-collections';

export const revalidate = 0;

export default async function OriginalsPage() {
  const collections = originalCollectionLinks(await fetchOriginalCollections());
  if (collections.length > 0) redirect(collections[0].href);

  return <OriginalsGalleryPage sourcePath="/originals" />;
}
