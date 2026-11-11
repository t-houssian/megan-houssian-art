// Run from the repository root. Dry run by default; add --apply to save assignments.
const { randomUUID } = require('node:crypto');
const { writeFileSync } = require('node:fs');
const { createClient } = require('@sanity/client');
const { loadEnvConfig } = require('@next/env');

const definitions = [
  { title: 'Evening Light Collection', slug: 'evening-light' },
  { title: 'Hillside Studies', slug: 'hillside-studies' },
];

function collectionSlugForTitle(title) {
  return /^\s*Hillside\s+Study\s+[IVXLCDM]+\s*$/i.test(title)
    ? 'hillside-studies'
    : 'evening-light';
}

async function run() {
  loadEnvConfig(process.cwd());
  const apply = process.argv.includes('--apply');
  const token = process.env.SANITY_WRITE_TOKEN || process.env.SANITY_AUTH_TOKEN ||
    process.env.SANITY_API_WRITE_TOKEN || process.env.SANITY_API_TOKEN || process.env.SANITY_TOKEN;
  if (apply && !token) throw new Error('A Sanity write token is required to apply assignments.');

  const client = createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'wbr93909',
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
    apiVersion: '2025-02-05',
    useCdn: false,
    perspective: 'raw',
    ...(token ? { token } : {}),
  });
  const snapshot = await client.fetch(`{
    "collections": *[_type == "originalCollection" && !(_id in path("drafts.**"))]{
      _id, _rev, title, slug, releaseAt, earlyAccessStartsAt
    },
    "originals": *[_type == "original" && !(_id in path("drafts.**"))]{
      _id, _rev, title, collections
    },
    "drafts": *[_type in ["original", "originalCollection"] && _id in path("drafts.**")]{_id, _type, title, slug}
  }`);
  const originalIds = new Set(snapshot.originals.map((original) => original._id));
  const collectionIds = new Set(snapshot.collections.map((collection) => collection._id));
  const conflictingDrafts = snapshot.drafts.filter((draft) => {
    const publishedId = draft._id.replace(/^drafts\./, '');
    return draft._type === 'original'
      ? originalIds.has(publishedId)
      : !collectionIds.has(publishedId) && definitions.some((definition) => definition.slug === draft.slug?.current);
  });
  if (conflictingDrafts.length) {
    throw new Error('A target artwork or new collection has an unpublished draft. Review it before applying assignments.');
  }

  const targets = definitions.map((definition) => {
    const matches = snapshot.collections.filter((collection) => collection.slug?.current === definition.slug);
    if (matches.length > 1) throw new Error(`Duplicate collection slug: ${definition.slug}`);
    return matches[0] ?? {
      _id: `original-collection-${definition.slug}`,
      _type: 'originalCollection',
      title: definition.title,
      slug: { _type: 'slug', current: definition.slug },
    };
  });
  if (targets.some((target) => target.releaseAt || target.earlyAccessStartsAt)) {
    throw new Error('A target collection has access dates. Review purchase availability before applying assignments.');
  }

  const patches = [];
  const summary = targets.map((target) => ({ title: target.title, pieces: [] }));
  for (const original of snapshot.originals) {
    const slug = collectionSlugForTitle(original.title || '');
    const index = targets.findIndex((target) => target.slug.current === slug);
    const target = targets[index];
    const current = original.collections ?? [];
    if (current.some((reference) => reference._ref === target._id)) {
      summary[index].pieces.push(original.title);
      continue;
    }
    // Preserve any manual collection assignment instead of replacing editorial choices.
    if (current.length > 0) continue;
    summary[index].pieces.push(original.title);
    patches.push({
      original,
      collections: [{ _type: 'reference', _key: randomUUID(), _ref: target._id }],
    });
  }
  const creates = targets.filter((target) => !target._rev);
  console.log(JSON.stringify({
    mode: apply ? 'apply' : 'dry-run',
    collectionsToCreate: creates.map((target) => target.title),
    assignmentsToAdd: patches.length,
    preservedDrafts: snapshot.drafts.length,
    collections: summary.map((entry) => ({ ...entry, count: entry.pieces.length })),
  }, null, 2));
  if (!apply || (!creates.length && !patches.length)) return;

  const backup = `/private/tmp/mha-original-collections-${Date.now()}.json`;
  writeFileSync(backup, JSON.stringify(snapshot, null, 2), { mode: 0o600 });
  const transaction = client.transaction();
  for (const collection of creates) transaction.createIfNotExists(collection);
  for (const entry of patches) {
    transaction.patch(entry.original._id, (patch) =>
      patch.ifRevisionId(entry.original._rev).set({ collections: entry.collections })
    );
  }
  const result = await transaction.commit({ visibility: 'sync', returnDocuments: false });
  console.log(JSON.stringify({ saved: true, transactionId: result.transactionId, backup }));
}

module.exports = { collectionSlugForTitle };
if (require.main === module) run().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
