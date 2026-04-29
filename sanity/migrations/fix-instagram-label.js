const { getCliClient } = require('@sanity/cli')

const client = getCliClient({ apiVersion: '2026-04-28' })

const INSTAGRAM_LABEL = 'Instagram'

const isBlank = (value) => typeof value !== 'string' || value.trim().length === 0

const fixSiteSettings = async () => {
  const docs = await client.fetch(
    `*[_type == "siteSettings" && _id in ["siteSettings", "drafts.siteSettings"]]{
      _id,
      footerContent
    }`
  )

  let updated = 0

  for (const doc of docs) {
    if (!isBlank(doc.footerContent?.instagramLabel)) continue

    await client
      .patch(doc._id)
      .set({ 'footerContent.instagramLabel': INSTAGRAM_LABEL })
      .commit()
    updated += 1
  }

  return { found: docs.length, updated }
}

const fixEmailSettings = async () => {
  const docs = await client.fetch(
    `*[_type == "emailSettings" && _id in ["emailSettings", "drafts.emailSettings"]]{
      _id,
      brandTemplate
    }`
  )

  let updated = 0

  for (const doc of docs) {
    const socialLinks = Array.isArray(doc.brandTemplate?.socialLinks)
      ? doc.brandTemplate.socialLinks
      : []

    const nextSocialLinks = socialLinks.map((link) =>
      link?.platform === 'instagram' && isBlank(link.label)
        ? { ...link, label: INSTAGRAM_LABEL }
        : link
    )

    const changed = nextSocialLinks.some((link, index) => link !== socialLinks[index])

    if (!changed) continue

    await client
      .patch(doc._id)
      .set({ 'brandTemplate.socialLinks': nextSocialLinks })
      .commit()
    updated += 1
  }

  return { found: docs.length, updated }
}

const run = async () => {
  const siteSettings = await fixSiteSettings()
  const emailSettings = await fixEmailSettings()

  console.log('Fixed Instagram label validation:')
  console.log(`- siteSettings: found ${siteSettings.found}, updated ${siteSettings.updated}`)
  console.log(`- emailSettings: found ${emailSettings.found}, updated ${emailSettings.updated}`)
}

run().catch((error) => {
  console.error('Failed to fix Instagram label', error)
  process.exit(1)
})
