const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'wbr93909';
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production';
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2025-02-05';
const token =
  process.env.SANITY_WRITE_TOKEN || process.env.SANITY_AUTH_TOKEN || process.env.SANITY_API_WRITE_TOKEN;

if (!token) {
  console.error('Missing Sanity write token. Set SANITY_WRITE_TOKEN, SANITY_AUTH_TOKEN, or SANITY_API_WRITE_TOKEN.');
  process.exit(1);
}

const collectorWelcome = {
  subject: "You're on the Collector List",
  preheader: "Welcome, and thank you for joining my Collector Circle.",
  title: 'Welcome to the Collector Circle',
  greetingTemplate: '',
  intro: "Welcome, and thank you for joining my Collector Circle. I'm so happy to have you!",
  highlightsIntro:
    "This is where I'll share new work, first looks at upcoming paintings, and notes from the studio along the way. You'll be the first to hear about new collections, available pieces, and the ongoing process behind my journey.",
  highlights: [],
  body: "I'm so glad you're here, and I look forward to sharing my work with you!",
  ctaLabel: 'Browse Originals',
  ctaHref: '/originals',
  outro: '',
};

const mutations = {
  mutations: [
    {
      patch: {
        id: 'emailSettings',
        set: {
          collectorWelcome,
        },
      },
    },
  ],
};

const run = async () => {
  const response = await fetch(
    `https://${projectId}.api.sanity.io/v${apiVersion}/data/mutate/${dataset}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(mutations),
    }
  );

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Sanity mutation failed (${response.status}): ${body}`);
  }

  console.log('Updated emailSettings.collectorWelcome');
};

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
