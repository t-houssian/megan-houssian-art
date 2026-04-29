import { redirect } from 'next/navigation';

const ALLOWED_SOURCE_PATHS = new Set([
  '/originals',
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

export default async function OriginalCollectionPage({ searchParams }: CollectionPageProps) {
  const resolvedSearchParams = await searchParams;
  const sourcePath = getSourcePath(resolvedSearchParams.from);
  redirect(sourcePath ?? '/originals');
}
