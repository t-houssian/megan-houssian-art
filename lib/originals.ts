import { revalidatePath } from 'next/cache';
import { sanityClient } from './sanity';

export type OriginalCollectionSummary = {
  _id: string;
  title: string;
  slug: { current: string };
  description?: string;
  pieceCount?: number;
  sampleOriginals?: OriginalArtworkSample[];
  releaseAt?: string;
  earlyAccessStartsAt?: string;
  earlyAccessMessage?: string;
  earlyAccessEmailMessage?: string;
};

export type OriginalArtworkSample = {
  _id: string;
  title: string;
  slug: { current: string };
  mainImage?: {
    asset: { _ref: string };
  };
};

export type OriginalArtworkSummary = {
  _id: string;
  title: string;
  slug: { current: string };
  mainImage?: {
    asset: { _ref: string };
  };
  hoverImage?: {
    asset: { _ref: string };
  };
  price?: number;
  sold?: boolean;
  testProduct?: boolean;
  releaseAt?: string;
  earlyAccessStartsAt?: string;
  earlyAccessMessage?: string;
  earlyAccessEmailMessage?: string;
  earlyAccess?: OriginalEarlyAccessState;
  collections: OriginalCollectionSummary[];
};

export type OriginalArtwork = OriginalArtworkSummary & {
  gallery?: Array<{ asset: { _ref: string } }>;
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

export type OriginalCollection = OriginalCollectionSummary & {
  originals: OriginalArtworkSummary[];
};

export type OriginalCheckoutPricing = {
  _id: string;
  title: string;
  slug: { current: string };
  price?: number;
  sold?: boolean;
  testProduct?: boolean;
};

export type OriginalEarlyAccessState = {
  status: 'open' | 'early_access' | 'upcoming';
  sourceType?: 'piece' | 'collection';
  sourceTitle?: string;
  releaseAt?: string;
  earlyAccessStartsAt?: string;
  message?: string;
};

type EarlyAccessCandidate = {
  sourceType: 'piece' | 'collection';
  sourceTitle: string;
  slug?: string;
  releaseAt?: string;
  earlyAccessStartsAt?: string;
  earlyAccessMessage?: string;
  earlyAccessEmailMessage?: string;
  earlyAccessPassword?: string;
};

export type CollectorSignupEarlyAccessContext = {
  sourceType: 'piece' | 'collection';
  sourceTitle: string;
  password: string;
  message?: string;
  accessHref: string;
};

type RawOriginalArtworkSummary = Omit<OriginalArtworkSummary, 'collections'> & {
  directCollections?: OriginalCollectionSummary[];
  reverseCollections?: OriginalCollectionSummary[];
};

type RawOriginalArtwork = RawOriginalArtworkSummary & Omit<OriginalArtwork, keyof OriginalArtworkSummary>;

type RawOriginalCollection = OriginalCollectionSummary & {
  originals?: RawOriginalArtworkSummary[];
};

const COLLECTION_SUMMARY_PROJECTION = `
  _id,
  title,
  "slug": slug,
  description,
  releaseAt,
  earlyAccessStartsAt,
  earlyAccessMessage,
  earlyAccessEmailMessage
`;

const ORIGINAL_SUMMARY_PROJECTION = `
  _id,
  title,
  "slug": slug,
  mainImage,
  "hoverImage": gallery[0],
  price,
  sold,
  testProduct,
  releaseAt,
  earlyAccessStartsAt,
  earlyAccessMessage,
  earlyAccessEmailMessage,
  "directCollections": collections[]->{
    ${COLLECTION_SUMMARY_PROJECTION}
  },
  "reverseCollections": *[_type == "originalCollection" && ^._id in pieces[]._ref]{
    ${COLLECTION_SUMMARY_PROJECTION}
  }
`;

const ORIGINALS_LIST_QUERY = `
  *[_type == "original" && defined(slug.current)]{
    ${ORIGINAL_SUMMARY_PROJECTION}
  } | order(coalesce(sold, false) asc, _createdAt desc)
`;

const ORIGINAL_BY_SLUG_QUERY = `
  *[_type == "original" && slug.current == $slug][0]{
    ${ORIGINAL_SUMMARY_PROJECTION},
    gallery,
    description,
    shipping
  }
`;

const ORIGINAL_COLLECTIONS_LIST_QUERY = `
  *[_type == "originalCollection" && defined(slug.current)]{
    ${COLLECTION_SUMMARY_PROJECTION},
    "pieceCount": count(*[
      _type == "original" &&
      defined(slug.current) &&
      (
        _id in coalesce(^.pieces[]._ref, []) ||
        ^._id in coalesce(collections[]._ref, [])
      )
    ]),
    "sampleOriginals": *[
      _type == "original" &&
      defined(slug.current) &&
      defined(mainImage.asset) &&
      (
        _id in coalesce(^.pieces[]._ref, []) ||
        ^._id in coalesce(collections[]._ref, [])
      )
    ] | order(coalesce(sold, false) asc, _createdAt desc)[0...4]{
      _id,
      title,
      "slug": slug,
      mainImage
    }
  } | order(title asc)
`;

const ORIGINAL_COLLECTION_BY_SLUG_QUERY = `
  *[_type == "originalCollection" && slug.current == $slug][0]{
    ${COLLECTION_SUMMARY_PROJECTION},
    "originals": *[
      _type == "original" &&
      defined(slug.current) &&
      (
        _id in coalesce(^.pieces[]._ref, []) ||
        ^._id in coalesce(collections[]._ref, [])
      )
    ]{
      ${ORIGINAL_SUMMARY_PROJECTION}
    } | order(coalesce(sold, false) asc, _createdAt desc)
  }
`;

const ORIGINAL_CHECKOUT_PRICING_QUERY = `
  *[_type == "original" && slug.current == $slug && !(_id in path("drafts.**"))][0]{
    _id,
    title,
    "slug": slug,
    price,
    sold,
    testProduct
  }
`;

const EARLY_ACCESS_ORIGINAL_BY_SLUG_QUERY = `
  *[_type == "original" && slug.current == $slug && !(_id in path("drafts.**"))][0]{
    _id,
    title,
    "slug": slug.current,
    releaseAt,
    earlyAccessStartsAt,
    earlyAccessMessage,
    earlyAccessEmailMessage,
    earlyAccessPassword,
    "directCollections": collections[]->{
      _id,
      title,
      "slug": slug.current,
      releaseAt,
      earlyAccessStartsAt,
      earlyAccessMessage,
      earlyAccessEmailMessage,
      earlyAccessPassword
    },
    "reverseCollections": *[_type == "originalCollection" && ^._id in pieces[]._ref]{
      _id,
      title,
      "slug": slug.current,
      releaseAt,
      earlyAccessStartsAt,
      earlyAccessMessage,
      earlyAccessEmailMessage,
      earlyAccessPassword
    }
  }
`;

const ACTIVE_EARLY_ACCESS_CONTEXTS_QUERY = `
  {
    "collections": *[
      _type == "originalCollection" &&
      defined(earlyAccessPassword) &&
      defined(releaseAt) &&
      dateTime($now) >= dateTime(earlyAccessStartsAt) &&
      dateTime($now) < dateTime(releaseAt)
    ]{
      _id,
      title,
      "slug": slug.current,
      releaseAt,
      earlyAccessStartsAt,
      earlyAccessMessage,
      earlyAccessEmailMessage,
      earlyAccessPassword
    },
    "pieces": *[
      _type == "original" &&
      defined(slug.current) &&
      defined(earlyAccessPassword) &&
      defined(releaseAt) &&
      dateTime($now) >= dateTime(earlyAccessStartsAt) &&
      dateTime($now) < dateTime(releaseAt)
    ]{
      _id,
      title,
      "slug": slug.current,
      releaseAt,
      earlyAccessStartsAt,
      earlyAccessMessage,
      earlyAccessEmailMessage,
      earlyAccessPassword
    }
  }
`;

const DEFAULT_EARLY_ACCESS_MESSAGE =
  'This piece is currently in collector early access. To purchase during this preview window, join my Collector List and I will send you the password.';

const DEFAULT_UPCOMING_MESSAGE =
  'This piece is not available for purchase yet. Join my Collector List for early access updates.';

const normalizeString = (value: unknown) => (typeof value === 'string' ? value.trim() : '');

const normalizeDateValue = (value: unknown) => {
  const normalized = normalizeString(value);
  if (!normalized) return undefined;
  const time = Date.parse(normalized);
  return Number.isFinite(time) ? normalized : undefined;
};

const normalizeAccessCandidate = (
  candidate: EarlyAccessCandidate | null | undefined
): EarlyAccessCandidate | null => {
  if (!candidate?.sourceTitle) return null;

  return {
    ...candidate,
    releaseAt: normalizeDateValue(candidate.releaseAt),
    earlyAccessStartsAt: normalizeDateValue(candidate.earlyAccessStartsAt),
    earlyAccessMessage: normalizeString(candidate.earlyAccessMessage) || undefined,
    earlyAccessEmailMessage: normalizeString(candidate.earlyAccessEmailMessage) || undefined,
    earlyAccessPassword: normalizeString(candidate.earlyAccessPassword) || undefined,
  };
};

const getCandidateStatus = (
  candidate: EarlyAccessCandidate,
  now = new Date()
): 'open' | 'early_access' | 'upcoming' => {
  if (!candidate.releaseAt) return 'open';

  const releaseTime = Date.parse(candidate.releaseAt);
  if (!Number.isFinite(releaseTime) || now.getTime() >= releaseTime) return 'open';

  const earlyAccessStartTime = candidate.earlyAccessStartsAt
    ? Date.parse(candidate.earlyAccessStartsAt)
    : Number.NaN;

  if (Number.isFinite(earlyAccessStartTime) && now.getTime() >= earlyAccessStartTime) {
    return 'early_access';
  }

  return 'upcoming';
};

const pickRelevantEarlyAccessCandidate = (
  candidates: Array<EarlyAccessCandidate | null | undefined>,
  now = new Date()
) => {
  const normalizedCandidates = candidates
    .map(normalizeAccessCandidate)
    .filter((candidate): candidate is EarlyAccessCandidate => Boolean(candidate));

  const pieceCandidate = normalizedCandidates.find((candidate) => candidate.sourceType === 'piece');
  const pieceStatus = pieceCandidate ? getCandidateStatus(pieceCandidate, now) : 'open';
  if (pieceCandidate && pieceStatus !== 'open') {
    return { candidate: pieceCandidate, status: pieceStatus };
  }

  const activeCollection = normalizedCandidates.find(
    (candidate) => candidate.sourceType === 'collection' && getCandidateStatus(candidate, now) === 'early_access'
  );
  if (activeCollection) {
    return { candidate: activeCollection, status: 'early_access' as const };
  }

  const upcomingCollection = normalizedCandidates.find(
    (candidate) => candidate.sourceType === 'collection' && getCandidateStatus(candidate, now) === 'upcoming'
  );
  if (upcomingCollection) {
    return { candidate: upcomingCollection, status: 'upcoming' as const };
  }

  return null;
};

const buildEarlyAccessState = (
  original: Omit<RawOriginalArtworkSummary, 'collections'> & {
    directCollections?: OriginalCollectionSummary[];
    reverseCollections?: OriginalCollectionSummary[];
  }
): OriginalEarlyAccessState => {
  const collections = normalizeCollections(original.directCollections, original.reverseCollections);
  const selection = pickRelevantEarlyAccessCandidate([
    {
      sourceType: 'piece',
      sourceTitle: original.title,
      slug: original.slug?.current,
      releaseAt: original.releaseAt,
      earlyAccessStartsAt: original.earlyAccessStartsAt,
      earlyAccessMessage: original.earlyAccessMessage,
      earlyAccessEmailMessage: original.earlyAccessEmailMessage,
    },
    ...collections.map((collection) => ({
      sourceType: 'collection' as const,
      sourceTitle: collection.title,
      slug: collection.slug?.current,
      releaseAt: collection.releaseAt,
      earlyAccessStartsAt: collection.earlyAccessStartsAt,
      earlyAccessMessage: collection.earlyAccessMessage,
      earlyAccessEmailMessage: collection.earlyAccessEmailMessage,
    })),
  ]);

  if (!selection) {
    return { status: 'open' };
  }

  return {
    status: selection.status,
    sourceType: selection.candidate.sourceType,
    sourceTitle: selection.candidate.sourceTitle,
    releaseAt: selection.candidate.releaseAt,
    earlyAccessStartsAt: selection.candidate.earlyAccessStartsAt,
    message:
      selection.candidate.earlyAccessMessage ||
      (selection.status === 'early_access' ? DEFAULT_EARLY_ACCESS_MESSAGE : DEFAULT_UPCOMING_MESSAGE),
  };
};

function isValidCollection(
  collection: OriginalCollectionSummary | null | undefined
): collection is OriginalCollectionSummary {
  return Boolean(collection?._id && collection.title && collection.slug?.current);
}

function normalizeCollections(
  ...collectionGroups: Array<OriginalCollectionSummary[] | undefined>
): OriginalCollectionSummary[] {
  const collectionsById = new Map<string, OriginalCollectionSummary>();

  for (const collectionGroup of collectionGroups) {
    for (const collection of collectionGroup ?? []) {
      if (!isValidCollection(collection) || collectionsById.has(collection._id)) {
        continue;
      }

      collectionsById.set(collection._id, collection);
    }
  }

  return Array.from(collectionsById.values()).sort((a, b) => a.title.localeCompare(b.title));
}

function normalizeOriginal<T extends RawOriginalArtworkSummary>(
  original: T
): Omit<T, 'directCollections' | 'reverseCollections'> & OriginalArtworkSummary {
  const { directCollections, reverseCollections, ...rest } = original;

  return {
    ...rest,
    collections: normalizeCollections(directCollections, reverseCollections),
    earlyAccess: buildEarlyAccessState(original),
  };
}

function normalizeCollection(collection: RawOriginalCollection): OriginalCollection {
  return {
    ...collection,
    originals: (collection.originals ?? []).map(normalizeOriginal),
  };
}

export async function fetchOriginals(): Promise<OriginalArtworkSummary[]> {
  const originals = await sanityClient.fetch<RawOriginalArtworkSummary[]>(
    ORIGINALS_LIST_QUERY,
    {},
    { next: { revalidate: 60 } }
  );

  return originals.map(normalizeOriginal);
}

export async function fetchOriginalBySlug(slug: string): Promise<OriginalArtwork | null> {
  const original = await sanityClient.fetch<RawOriginalArtwork | null>(ORIGINAL_BY_SLUG_QUERY, { slug });

  return original ? normalizeOriginal(original) : null;
}

export async function fetchOriginalCollections(): Promise<OriginalCollectionSummary[]> {
  return sanityClient.fetch<OriginalCollectionSummary[]>(
    ORIGINAL_COLLECTIONS_LIST_QUERY,
    {},
    { next: { revalidate: 60 } }
  );
}

export async function fetchOriginalCollectionBySlug(slug: string): Promise<OriginalCollection | null> {
  const collection = await sanityClient.fetch<RawOriginalCollection | null>(
    ORIGINAL_COLLECTION_BY_SLUG_QUERY,
    { slug },
    { next: { revalidate: 60 } }
  );

  return collection ? normalizeCollection(collection) : null;
}

export async function fetchOriginalCheckoutPricing(slug: string): Promise<OriginalCheckoutPricing | null> {
  return sanityClient.withConfig({ useCdn: false }).fetch<OriginalCheckoutPricing | null>(
    ORIGINAL_CHECKOUT_PRICING_QUERY,
    { slug },
    { cache: 'no-store' }
  );
}

type RawEarlyAccessOriginal = {
  title: string;
  slug?: string;
  releaseAt?: string;
  earlyAccessStartsAt?: string;
  earlyAccessMessage?: string;
  earlyAccessEmailMessage?: string;
  earlyAccessPassword?: string;
  directCollections?: Array<RawEarlyAccessSource | null> | null;
  reverseCollections?: Array<RawEarlyAccessSource | null> | null;
};

type RawEarlyAccessSource = {
  title?: string;
  slug?: string;
  releaseAt?: string;
  earlyAccessStartsAt?: string;
  earlyAccessMessage?: string;
  earlyAccessEmailMessage?: string;
  earlyAccessPassword?: string;
};

const collectionCandidateFromRaw = (collection: RawEarlyAccessSource | null): EarlyAccessCandidate | null =>
  collection?.title
    ? {
        sourceType: 'collection',
        sourceTitle: collection.title,
        slug: collection.slug,
        releaseAt: collection.releaseAt,
        earlyAccessStartsAt: collection.earlyAccessStartsAt,
        earlyAccessMessage: collection.earlyAccessMessage,
        earlyAccessEmailMessage: collection.earlyAccessEmailMessage,
        earlyAccessPassword: collection.earlyAccessPassword,
      }
    : null;

const normalizePassword = (value: unknown) =>
  typeof value === 'string' ? value.trim() : '';

const getEarlyAccessSelectionForOriginal = (original: RawEarlyAccessOriginal | null) => {
  if (!original) return null;

  return pickRelevantEarlyAccessCandidate([
    {
      sourceType: 'piece',
      sourceTitle: original.title,
      slug: original.slug,
      releaseAt: original.releaseAt,
      earlyAccessStartsAt: original.earlyAccessStartsAt,
      earlyAccessMessage: original.earlyAccessMessage,
      earlyAccessEmailMessage: original.earlyAccessEmailMessage,
      earlyAccessPassword: original.earlyAccessPassword,
    },
    ...(original.directCollections ?? []).map(collectionCandidateFromRaw),
    ...(original.reverseCollections ?? []).map(collectionCandidateFromRaw),
  ]);
};

export type EarlyAccessValidationResult =
  | { ok: true }
  | {
      ok: false;
      status: 'early_access_required' | 'upcoming';
      message: string;
      sourceTitle?: string;
      releaseAt?: string;
    };

export async function validateOriginalEarlyAccessForCheckout(
  slug: unknown,
  password: unknown
): Promise<EarlyAccessValidationResult> {
  if (typeof slug !== 'string' || !slug.trim()) {
    return { ok: true };
  }

  const original = await sanityClient.withConfig({ useCdn: false }).fetch<RawEarlyAccessOriginal | null>(
    EARLY_ACCESS_ORIGINAL_BY_SLUG_QUERY,
    { slug: slug.trim() },
    { cache: 'no-store' }
  );

  const selection = getEarlyAccessSelectionForOriginal(original);
  if (!selection) {
    return { ok: true };
  }

  const message =
    selection.candidate.earlyAccessMessage ||
    (selection.status === 'early_access' ? DEFAULT_EARLY_ACCESS_MESSAGE : DEFAULT_UPCOMING_MESSAGE);

  if (selection.status === 'upcoming') {
    return {
      ok: false,
      status: 'upcoming',
      message,
      sourceTitle: selection.candidate.sourceTitle,
      releaseAt: selection.candidate.releaseAt,
    };
  }

  const expectedPassword = normalizePassword(selection.candidate.earlyAccessPassword);
  const providedPassword = normalizePassword(password);

  if (!expectedPassword || providedPassword.toLowerCase() !== expectedPassword.toLowerCase()) {
    return {
      ok: false,
      status: 'early_access_required',
      message,
      sourceTitle: selection.candidate.sourceTitle,
      releaseAt: selection.candidate.releaseAt,
    };
  }

  return { ok: true };
}

const getOriginalSlugFromReferrer = (referrer?: string) => {
  if (!referrer) return null;

  try {
    const url = new URL(referrer);
    const match = url.pathname.match(/^\/originals\/([^/]+)$/);
    return match?.[1] ? decodeURIComponent(match[1]) : null;
  } catch {
    return null;
  }
};

const contextFromCandidate = (candidate: EarlyAccessCandidate): CollectorSignupEarlyAccessContext | null => {
  const password = normalizePassword(candidate.earlyAccessPassword);
  if (!password) return null;

  return {
    sourceType: candidate.sourceType,
    sourceTitle: candidate.sourceTitle,
    password,
    message: candidate.earlyAccessEmailMessage || candidate.earlyAccessMessage,
    accessHref: candidate.sourceType === 'piece' && candidate.slug ? `/originals/${candidate.slug}` : '/hidden-originals',
  };
};

export async function fetchCollectorSignupEarlyAccessContexts(
  referrer?: string
): Promise<CollectorSignupEarlyAccessContext[]> {
  const originalSlug = getOriginalSlugFromReferrer(referrer);

  if (originalSlug) {
    const original = await sanityClient.withConfig({ useCdn: false }).fetch<RawEarlyAccessOriginal | null>(
      EARLY_ACCESS_ORIGINAL_BY_SLUG_QUERY,
      { slug: originalSlug },
      { cache: 'no-store' }
    );
    const selection = getEarlyAccessSelectionForOriginal(original);
    const context =
      selection?.status === 'early_access' ? contextFromCandidate(selection.candidate) : null;
    return context ? [context] : [];
  }

  const activeContexts = await sanityClient.withConfig({ useCdn: false }).fetch<{
    collections?: RawEarlyAccessSource[];
    pieces?: RawEarlyAccessSource[];
  }>(ACTIVE_EARLY_ACCESS_CONTEXTS_QUERY, { now: new Date().toISOString() }, { cache: 'no-store' });

  const contextsByKey = new Map<string, CollectorSignupEarlyAccessContext>();

  for (const collection of activeContexts.collections ?? []) {
    const candidate = collectionCandidateFromRaw(collection);
    const context = candidate ? contextFromCandidate(candidate) : null;
    if (context) contextsByKey.set(`collection:${context.sourceTitle}`, context);
  }

  for (const piece of activeContexts.pieces ?? []) {
    const context = piece.title
      ? contextFromCandidate({
          sourceType: 'piece',
          sourceTitle: piece.title,
          slug: piece.slug,
          releaseAt: piece.releaseAt,
          earlyAccessStartsAt: piece.earlyAccessStartsAt,
          earlyAccessMessage: piece.earlyAccessMessage,
          earlyAccessEmailMessage: piece.earlyAccessEmailMessage,
          earlyAccessPassword: piece.earlyAccessPassword,
        })
      : null;
    if (context) contextsByKey.set(`piece:${context.sourceTitle}`, context);
  }

  return Array.from(contextsByKey.values());
}

export type MarkOriginalSoldResult =
  | { status: 'updated'; id: string; title?: string }
  | { status: 'already_sold'; id: string; title?: string }
  | { status: 'not_found'; slug: string }
  | { status: 'skipped'; reason: 'missing_slug' | 'missing_token'; slug?: string };

const ORIGINAL_FOR_SALE_BY_SLUG_QUERY = `
  *[_type == "original" && slug.current == $slug && !(_id in path("drafts.**"))][0]{
    _id,
    _rev,
    title,
    sold
  }
`;

const getSanityWriteToken = () =>
  process.env.SANITY_WRITE_TOKEN ||
  process.env.SANITY_AUTH_TOKEN ||
  process.env.SANITY_API_WRITE_TOKEN;

const revalidateOriginalSoldPaths = (slug: string) => {
  try {
    revalidatePath('/originals');
    revalidatePath('/hidden-originals');
    revalidatePath('/originals-collectors-access');
    revalidatePath('/originals/collections');
    revalidatePath(`/originals/${slug}`);
  } catch (error) {
    console.error('Failed to revalidate original sold paths:', error);
  }
};

export async function markOriginalSoldBySlug(slug: unknown): Promise<MarkOriginalSoldResult> {
  if (typeof slug !== 'string' || !slug.trim()) {
    return { status: 'skipped', reason: 'missing_slug' };
  }

  const normalizedSlug = slug.trim();
  const token = getSanityWriteToken();

  if (!token) {
    return { status: 'skipped', reason: 'missing_token', slug: normalizedSlug };
  }

  const writeClient = sanityClient.withConfig({
    useCdn: false,
    token,
  });

  const original = await writeClient.fetch<{
    _id: string;
    _rev: string;
    title?: string;
    sold?: boolean;
  } | null>(
    ORIGINAL_FOR_SALE_BY_SLUG_QUERY,
    { slug: normalizedSlug },
    { cache: 'no-store' }
  );

  if (!original?._id) {
    return { status: 'not_found', slug: normalizedSlug };
  }

  if (original.sold) {
    return { status: 'already_sold', id: original._id, title: original.title };
  }

  await writeClient
    .patch(original._id)
    .set({ sold: true })
    .commit({ visibility: 'sync' });

  revalidateOriginalSoldPaths(normalizedSlug);

  return { status: 'updated', id: original._id, title: original.title };
}
