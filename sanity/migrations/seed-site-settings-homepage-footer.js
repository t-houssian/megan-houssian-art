const { getCliClient } = require('@sanity/cli')

const client = getCliClient({ apiVersion: '2026-04-01' })

const homepageContent = {
  aboutHeading: 'Megan Houssian',
  aboutLocation: 'Marble Falls, Texas.',
  aboutDescription:
    "Megan Houssian is a Texas-based artist known for peaceful, atmospheric landscapes rooted in everyday life. Painted in quiet moments, each piece invites you to slow down and welcome nature's calm into your home.",
  aboutButtonLabel: 'About',
  commissionsHeading: 'Interested in a Commission?',
  commissionsDescription:
    "I accept a limited number of commissions each season. If you're drawn to the mood and atmosphere in my landscapes, I'd love to create a one-of-a-kind piece for your home.",
  commissionsButtonLabel: 'Commission a Piece',
  contactHeading: 'Contact the Artist',
  contactIntroText: 'Fill out the form below or email me at',
  contactEmail: 'meganhoussianart@gmail.com',
  contactButtonLabel: 'Go to Contact Page',
}

const footerContent = {
  brandTitle: 'Megan Houssian Art',
  brandDescription: 'Creating unique art that brings beauty and inspiration to your everyday spaces.',
  exploreHeading: 'Explore',
  galleryLabel: 'Gallery',
  originalsLabel: 'Originals',
  commissionsLabel: 'Commissions',
  aboutLabel: 'About the Artist',
  connectHeading: 'Connect',
  pinterestLabel: 'Pinterest',
  facebookLabel: 'Facebook',
  contactLabel: 'Get in Touch',
  copyrightName: 'Megan Houssian',
  location: 'Marble Falls, Texas',
}

async function run() {
  const docs = await client.fetch(
    `*[_type == "siteSettings" && _id in ["siteSettings", "drafts.siteSettings"]]{_id, _type}`
  )

  const docIds = docs.length > 0 ? docs.map((doc) => doc._id) : ['siteSettings']
  const transaction = client.transaction()

  if (docs.length === 0) {
    transaction.createIfNotExists({ _id: 'siteSettings', _type: 'siteSettings' })
  }

  for (const id of docIds) {
    transaction.patch(id, (patch) =>
      patch.setIfMissing({
        homepageContent,
        footerContent,
      })
    )
  }

  await transaction.commit()
  console.log(`Seeded homepage/footer copy defaults for: ${docIds.join(', ')}`)
}

run().catch((error) => {
  console.error('Failed to seed site settings homepage/footer copy', error)
  process.exit(1)
})
