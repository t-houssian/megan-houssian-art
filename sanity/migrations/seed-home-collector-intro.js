const { getCliClient } = require('@sanity/cli')

const client = getCliClient({ apiVersion: '2026-04-28' })

const homeCollectorIntro =
  'Timeless landscapes collected in homes across the Texas Hill Country and featured in local shops.'

const run = async () => {
  const docs = await client.fetch(`*[_type == "originalsPageSettings"]{_id, homeCollectorIntro}`)

  if (docs.length === 0) {
    await client.createIfNotExists({
      _id: 'originalsPageSettings',
      _type: 'originalsPageSettings',
      homeCollectorIntro,
    })
    console.log('Created originalsPageSettings with homeCollectorIntro')
    return
  }

  let updated = 0

  for (const doc of docs) {
    if (doc.homeCollectorIntro === homeCollectorIntro) continue

    await client.patch(doc._id).set({ homeCollectorIntro }).commit()
    updated += 1
  }

  console.log(`Checked ${docs.length} originalsPageSettings document(s), updated ${updated}`)
}

run().catch((error) => {
  console.error('Failed to seed homeCollectorIntro', error)
  process.exit(1)
})
