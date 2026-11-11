// Run from the repository root with Node 22.6+; dry run unless --apply is supplied.
// Initializes only missing collection orders and never changes artwork membership.
const { randomUUID } = require('node:crypto');
const { writeFileSync } = require('node:fs');
const { createClient } = require('@sanity/client');
const { loadEnvConfig } = require('@next/env');
const { orderCollectionOriginals } = require('../../lib/original-collection-order.ts');

async function run() {
  loadEnvConfig(process.cwd());
  const apply = process.argv.includes('--apply');
  const token = process.env.SANITY_WRITE_TOKEN || process.env.SANITY_AUTH_TOKEN ||
    process.env.SANITY_API_WRITE_TOKEN || process.env.SANITY_API_TOKEN || process.env.SANITY_TOKEN;
  if (!token) throw new Error('Sanity credentials are required to preserve collection drafts.');
  const client = createClient({ projectId: 'wbr93909', dataset: 'production', apiVersion: '2025-02-05', useCdn: false, perspective: 'raw', token });
  const snapshot = await client.fetch(`{
    "collections": *[_type == "originalCollection"]{
      _id, _rev, title, slug, artworkOrder, "pieceIds": pieces[]._ref
    },
    "originals": *[_type == "original" && !(_id in path("drafts.**"))]
      | order(coalesce(sold, false) asc, _createdAt desc){
        _id, title, hiddenOriginal, "collectionIds": collections[]._ref
      },
    "globalOrder": *[_type == "originalOrder" && !(_id in path("drafts.**"))][0]{
      _id, _rev, "ids": items[]._ref
    }
  }`);
  const baseline = orderCollectionOriginals(snapshot.originals, snapshot.globalOrder?.ids ?? []);
  const memberships = (collection) => {
    const collectionId = collection._id.replace(/^drafts\./, '');
    const legacyIds = new Set(collection.pieceIds ?? []);
    return baseline.filter((original) =>
      (original.collectionIds ?? []).includes(collectionId) || legacyIds.has(original._id)
    );
  };
  const planned = snapshot.collections
    .filter((collection) => collection.artworkOrder == null)
    .map((collection) => ({ collection, members: memberships(collection) }));
  console.log(JSON.stringify({
    mode: apply ? 'apply' : 'dry-run',
    fieldsChanged: ['artworkOrder'],
    initializations: planned.map(({ collection, members }) => ({
      id: collection._id,
      title: collection.title,
      count: members.length,
      first: members.slice(0, 3).map((original) => original.title),
    })),
    existingOrdersPreserved: snapshot.collections.length - planned.length,
    globalOrder: 'preserved',
    membership: 'preserved',
  }, null, 2));
  if (!apply || planned.length === 0) return;

  const backup = `/private/tmp/mha-collection-order-${Date.now()}.json`;
  writeFileSync(backup, JSON.stringify({ snapshot, baseline }, null, 2), { mode: 0o600 });
  const transaction = client.transaction();
  for (const { collection, members } of planned) {
    transaction.patch(collection._id, (patch) => patch.ifRevisionId(collection._rev).set({
      artworkOrder: members.map((original) => ({
        _key: randomUUID(), _type: 'reference', _ref: original._id, _weak: true,
      })),
    }));
  }
  const result = await transaction.commit({ visibility: 'sync', returnDocuments: false });
  console.log(JSON.stringify({ saved: true, transactionId: result.transactionId, backup }));
}

run().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
