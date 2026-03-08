const { getCliClient } = require('@sanity/cli')

const client = getCliClient({ apiVersion: '2026-03-08' })

const DEFAULT_ABOUT = {
  introParagraph: "Hi, I'm Megan! I'm a Texas Hill Country landscape painter, wife, and mama.",
  instrumentsParagraph:
    "I've loved creating all my life, and not just art. I learned to play three different instruments, and I've been making crepes for family breakfasts since I was eight.",
  collegeParagraph:
    'Fun fact: I actually started college as an art major... but I switched out on the very first day of class. I instinctively knew that turning art into an assignment would steal the joy from it.',
  motherhoodParagraph:
    'Motherhood brought it all back in the best way. It inspired me to protect my time, get really honest about what I wanted, and build a life that makes room for creating. My faith in Jesus Christ is also a guiding light in my daily life.',
  napTimeParagraph:
    `During my daughter's nap time, you'll find me painting distant blue hills, wildflowers, and open skies. Or, on days that aren't 100 degrees (Texas summers are brutal), you'll find me "cooking" outside with my daughter, where we make leaf and dirt soup topped with flowers we find in our yard.`,
  closingPrefix:
    "Whether you are drawn to the reverent landscapes, atmospheric skies, or the story of a happy mom who has found meaning in creation, welcome. If you'd like first access to new work, studio updates, and shop restocks,",
  closingLinkText: 'join my email list here',
  closingLinkHref: '/#collector-early-access',
  closingSuffix: 'so we can stay in touch.',
}

const DEFAULT_ORIGINALS = {
  comingSoonTextBeforeLink: 'A new collection is coming soon! Join my',
  comingSoonLinkText: 'collector list',
  comingSoonTextAfterLink: 'for updates and first access to new originals.',
  comingSoonLinkHref: '/#collector-early-access',
}

const LEGACY_ABOUT_FIELDS = [
  'introParagraph',
  'instrumentsParagraph',
  'collegeParagraph',
  'motherhoodParagraph',
  'napTimeParagraph',
  'closingPrefix',
  'closingLinkText',
  'closingLinkHref',
  'closingSuffix',
]

const LEGACY_ORIGINALS_FIELDS = [
  'comingSoonTextBeforeLink',
  'comingSoonLinkText',
  'comingSoonTextAfterLink',
]

const nonEmpty = (value, fallback) => {
  if (typeof value !== 'string') return fallback
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : fallback
}

const ensureTrailingSpace = (value) => (/\s$/.test(value) ? value : `${value} `)
const ensureLeadingSpace = (value) => (/^\s/.test(value) ? value : ` ${value}`)

const createParagraphBlock = (text) => ({
  _type: 'block',
  style: 'normal',
  children: [{ _type: 'span', text, marks: [] }],
  markDefs: [],
})

const createLinkedParagraphBlock = ({ beforeLink, linkText, linkHref, afterLink }) => {
  const linkKey = 'collector-link'

  return {
    _type: 'block',
    style: 'normal',
    children: [
      { _type: 'span', text: ensureTrailingSpace(beforeLink), marks: [] },
      { _type: 'span', text: linkText, marks: [linkKey] },
      { _type: 'span', text: ensureLeadingSpace(afterLink), marks: [] },
    ],
    markDefs: [{ _key: linkKey, _type: 'link', href: linkHref }],
  }
}

const hasBlocks = (value) =>
  Array.isArray(value) &&
  value.length > 0 &&
  value.every((item) => item && typeof item === 'object' && item._type === 'block' && Array.isArray(item.children))

const buildAboutContent = (doc) => {
  const introParagraph = nonEmpty(doc.introParagraph, DEFAULT_ABOUT.introParagraph)
  const instrumentsParagraph = nonEmpty(doc.instrumentsParagraph, DEFAULT_ABOUT.instrumentsParagraph)
  const collegeParagraph = nonEmpty(doc.collegeParagraph, DEFAULT_ABOUT.collegeParagraph)
  const motherhoodParagraph = nonEmpty(doc.motherhoodParagraph, DEFAULT_ABOUT.motherhoodParagraph)
  const napTimeParagraph = nonEmpty(doc.napTimeParagraph, DEFAULT_ABOUT.napTimeParagraph)
  const closingPrefix = nonEmpty(doc.closingPrefix, DEFAULT_ABOUT.closingPrefix)
  const closingLinkText = nonEmpty(doc.closingLinkText, DEFAULT_ABOUT.closingLinkText)
  const closingLinkHref = nonEmpty(doc.closingLinkHref, DEFAULT_ABOUT.closingLinkHref)
  const closingSuffix = nonEmpty(doc.closingSuffix, DEFAULT_ABOUT.closingSuffix)

  return [
    createParagraphBlock(introParagraph),
    createParagraphBlock(instrumentsParagraph),
    createParagraphBlock(collegeParagraph),
    createParagraphBlock(motherhoodParagraph),
    createParagraphBlock(napTimeParagraph),
    createLinkedParagraphBlock({
      beforeLink: closingPrefix,
      linkText: closingLinkText,
      linkHref: closingLinkHref,
      afterLink: closingSuffix,
    }),
  ]
}

const buildOriginalsContent = (doc) => {
  const beforeLink = nonEmpty(doc.comingSoonTextBeforeLink, DEFAULT_ORIGINALS.comingSoonTextBeforeLink)
  const linkText = nonEmpty(doc.comingSoonLinkText, DEFAULT_ORIGINALS.comingSoonLinkText)
  const afterLink = nonEmpty(doc.comingSoonTextAfterLink, DEFAULT_ORIGINALS.comingSoonTextAfterLink)

  return [
    createLinkedParagraphBlock({
      beforeLink,
      linkText,
      linkHref: DEFAULT_ORIGINALS.comingSoonLinkHref,
      afterLink,
    }),
  ]
}

const migrateAbout = async () => {
  const docs = await client.fetch(
    `*[_type == "aboutPageSettings"]{
      _id,
      content,
      introParagraph,
      instrumentsParagraph,
      collegeParagraph,
      motherhoodParagraph,
      napTimeParagraph,
      closingPrefix,
      closingLinkText,
      closingLinkHref,
      closingSuffix
    }`
  )

  let updated = 0

  for (const doc of docs) {
    const patch = client.patch(doc._id)
    let shouldCommit = false

    if (!hasBlocks(doc.content)) {
      patch.set({ content: buildAboutContent(doc) })
      shouldCommit = true
    }

    patch.unset(LEGACY_ABOUT_FIELDS)
    shouldCommit = true

    if (shouldCommit) {
      await patch.commit()
      updated += 1
    }
  }

  return { found: docs.length, updated }
}

const migrateOriginals = async () => {
  const docs = await client.fetch(
    `*[_type == "originalsPageSettings"]{
      _id,
      comingSoonContent,
      comingSoonTextBeforeLink,
      comingSoonLinkText,
      comingSoonTextAfterLink
    }`
  )

  let updated = 0

  for (const doc of docs) {
    const patch = client.patch(doc._id)
    let shouldCommit = false

    if (!hasBlocks(doc.comingSoonContent)) {
      patch.set({ comingSoonContent: buildOriginalsContent(doc) })
      shouldCommit = true
    }

    patch.unset(LEGACY_ORIGINALS_FIELDS)
    shouldCommit = true

    if (shouldCommit) {
      await patch.commit()
      updated += 1
    }
  }

  return { found: docs.length, updated }
}

const run = async () => {
  const aboutResult = await migrateAbout()
  const originalsResult = await migrateOriginals()

  console.log('Migration complete:')
  console.log(`- aboutPageSettings: found ${aboutResult.found}, updated ${aboutResult.updated}`)
  console.log(`- originalsPageSettings: found ${originalsResult.found}, updated ${originalsResult.updated}`)
}

run().catch((error) => {
  console.error('Migration failed', error)
  process.exit(1)
})
