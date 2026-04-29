const { getCliClient } = require('@sanity/cli')

const client = getCliClient({ apiVersion: '2026-04-28' })

const homeCollectorIntro =
  'Timeless landscapes collected in homes across the Texas Hill Country and featured in local shops.'

const run = async () => {
  const docs = await client.fetch(
    `*[_type == "siteSettings" && _id in ["siteSettings", "drafts.siteSettings"]]{
      _id,
      homepageContent
    }`
  )

  if (docs.length === 0) {
    await client.createIfNotExists({
      _id: 'siteSettings',
      _type: 'siteSettings',
      homepageContent: {
        homeCollectorIntro,
      },
    })
    console.log('Created siteSettings with homepageContent.homeCollectorIntro')
    return
  }

  let updated = 0

  for (const doc of docs) {
    if (doc.homepageContent?.homeCollectorIntro === homeCollectorIntro) continue

    await client
      .patch(doc._id)
      .set({ 'homepageContent.homeCollectorIntro': homeCollectorIntro })
      .commit()
    updated += 1
  }

  const originalsDocs = await client.fetch(
    `*[_type == "originalsPageSettings" && defined(homeCollectorIntro)]{_id}`
  )

  for (const doc of originalsDocs) {
    await client.patch(doc._id).unset(['homeCollectorIntro']).commit()
  }

  console.log(`Checked ${docs.length} siteSettings document(s), updated ${updated}`)
  console.log(`Cleaned ${originalsDocs.length} originalsPageSettings document(s)`)
}

run().catch((error) => {
  console.error('Failed to seed homepageContent.homeCollectorIntro', error)
  process.exit(1)
})
