// Run from the repository root with Node 22.6+; --apply saves the staged changes.
// Existing website/email copy remains unpublished until the website update is approved.
const { createClient } = require('@sanity/client');
const { loadEnvConfig } = require('@next/env');
const { writeFileSync } = require('node:fs');
const { DEFAULT_COLLECTOR_SIGNUP_SETTINGS } = require('../lib/collectorSignupContent.ts');
const { normalizeCollectorHref } = require('../../lib/collector-links.ts');

const hasOldPromise = (value) => typeof value === 'string' &&
  /early[ -]?access|first access|24\s*hours?|first (?:looks?|to (?:hear|know))/i.test(value);

function updatedCopy(document) {
  const next = structuredClone(document);
  if (document._type === 'originalsPageSettings') {
    const replacements = {
      earlyAccessHeading: DEFAULT_COLLECTOR_SIGNUP_SETTINGS.heading,
      homeCollectorSubhead: DEFAULT_COLLECTOR_SIGNUP_SETTINGS.description,
      earlyAccessSubhead: DEFAULT_COLLECTOR_SIGNUP_SETTINGS.description,
      earlyAccessButtonLabel: DEFAULT_COLLECTOR_SIGNUP_SETTINGS.buttonLabel,
      availableOriginalsDescription: DEFAULT_COLLECTOR_SIGNUP_SETTINGS.description,
      pageIntro: 'Explore available originals and get notified when new collections are released.',
    };
    for (const [key, value] of Object.entries(replacements)) {
      if (hasOldPromise(next[key])) next[key] = value;
    }
  }
  if (document._type === 'emailSettings' && hasOldPromise(next.collectorWelcome?.body)) {
    next.collectorWelcome.body = next.collectorWelcome.body.split(/\n\s*\n/)
      .map((paragraph) => hasOldPromise(paragraph)
        ? "I'll email you a link when a new collection is released, so you can explore the paintings as they become available."
        : paragraph)
      .join('\n\n');
  }

  function rewrite(value) {
    if (typeof value === 'string') {
      return normalizeCollectorHref(value)
        .replace('first access to new work, studio updates, and shop restocks', 'an email when new collections are released')
        .replace(/for early access\./gi, 'for an email when new collections are released.')
        .replace(/for updates and first access to new originals\./gi, 'for notifications when new collections are released.');
    }
    if (Array.isArray(value)) return value.map(rewrite);
    if (value && typeof value === 'object') return Object.fromEntries(
      Object.entries(value).map(([key, entry]) => [key, key.startsWith('_') ? entry : rewrite(entry)])
    );
    return value;
  }
  return rewrite(next);
}

async function run() {
  loadEnvConfig(process.cwd());
  const apply = process.argv.includes('--apply');
  const token = process.env.SANITY_WRITE_TOKEN || process.env.SANITY_AUTH_TOKEN ||
    process.env.SANITY_API_WRITE_TOKEN || process.env.SANITY_API_TOKEN || process.env.SANITY_TOKEN;
  if (!token) throw new Error('A Sanity token is required to preserve existing drafts.');
  const client = createClient({ projectId: 'wbr93909', dataset: 'production', apiVersion: '2025-02-05', useCdn: false, perspective: 'raw', token });
  const documents = await client.fetch('*[_type in ["collectorSignupSettings", "originalsPageSettings", "aboutPageSettings", "emailSettings"]]');
  const signupExists = documents.some((doc) => doc._id === 'collectorSignupSettings');
  const staged = [];
  for (const id of ['originalsPageSettings', 'aboutPageSettings', 'emailSettings']) {
    const draft = documents.find((doc) => doc._id === `drafts.${id}`);
    const source = draft ?? documents.find((doc) => doc._id === id);
    if (!source) continue;
    const updated = updatedCopy(source);
    const changes = Object.fromEntries(Object.entries(updated).filter(([key, value]) =>
      !key.startsWith('_') && JSON.stringify(value) !== JSON.stringify(source[key])
    ));
    if (Object.keys(changes).length) staged.push({ id, source, draft, changes });
  }
  console.log(JSON.stringify({
    mode: apply ? 'apply' : 'dry-run',
    createCollectorSignup: !signupExists,
    stagedDrafts: staged.map((entry) => ({ id: `drafts.${entry.id}`, fields: Object.keys(entry.changes) })),
    existingPublishedCopy: 'preserved',
  }, null, 2));
  if (!apply) return;

  const backup = `/private/tmp/mha-collector-settings-${Date.now()}.json`;
  writeFileSync(backup, JSON.stringify(documents, null, 2), { mode: 0o600 });
  const transaction = client.transaction();
  if (!signupExists) transaction.createIfNotExists({
    _id: 'collectorSignupSettings', _type: 'collectorSignupSettings', ...DEFAULT_COLLECTOR_SIGNUP_SETTINGS,
  });
  for (const entry of staged) {
    if (entry.draft) transaction.patch(entry.draft._id, (patch) =>
      patch.ifRevisionId(entry.draft._rev).set(entry.changes)
    );
    else {
      const { _rev, _createdAt, _updatedAt, ...source } = entry.source;
      transaction.createIfNotExists({ ...source, ...entry.changes, _id: `drafts.${entry.id}` });
    }
  }
  if (!signupExists || staged.length) await transaction.commit({ visibility: 'sync', returnDocuments: false });
  console.log(JSON.stringify({ saved: true, backup }));
}

module.exports = { updatedCopy };
if (require.main === module) run().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
