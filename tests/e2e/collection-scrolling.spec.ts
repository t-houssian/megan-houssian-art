import { expect, test, type Page } from '@playwright/test';

// Mobile WebKit does not expose wheel input. Keep mobile viewport dimensions while
// using native wheel gestures in both engines rather than setting scrollTop in JS.
test.use({ isMobile: false });

const collections = [
  { slug: 'hillside-studies', title: 'Hillside Studies' },
  { slug: 'evening-light', title: 'Evening Light Collection' },
];

async function scrollThroughArtworkAndReturn(page: Page) {
  await expect(page.locator('main article').first()).toBeVisible();
  const viewport = page.viewportSize()!;
  await page.mouse.move(viewport.width / 2, viewport.height * 0.65);
  await page.mouse.wheel(0, 4000);
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(1500);

  // The header scrolls away with the page, then returns through ordinary scrolling.
  await expect(page.getByRole('navigation', { name: 'Main navigation' })).not.toBeInViewport();

  await page.mouse.wheel(0, -24000);
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
  await expect(page.getByRole('navigation', { name: 'Main navigation' })).toBeInViewport({ ratio: 1 });

  const bounds = await page.locator('main article').first().evaluate((article) => {
    const frame = article.querySelector('img')!.parentElement!.getBoundingClientRect();
    return {
      left: frame.left,
      right: frame.right,
      width: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
    };
  });
  expect(bounds.left).toBeCloseTo(0, 1);
  expect(bounds.right).toBeCloseTo(bounds.width, 1);
  expect(bounds.scrollWidth).toBe(bounds.width);
}

for (const width of [320, 393, 430]) {
  test(`both collections scroll back to their normal header at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 852 });
    await page.goto(`/originals/collections/${collections[0].slug}`, { waitUntil: 'domcontentloaded' });

    for (let index = 0; index < collections.length; index++) {
      const collection = collections[index];
      await expect(page.getByRole('heading', { name: collection.title, exact: true })).toBeAttached();
      await scrollThroughArtworkAndReturn(page);

      // Navigation is used only after returning to the top; clicks cannot hide a scroll bug.
      const toggle = page.getByRole('button', { name: 'Toggle Menu' });
      await expect(toggle).toBeInViewport({ ratio: 1 });
      await toggle.click();
      await expect(toggle).toHaveAttribute('aria-expanded', 'true');
      const next = collections[(index + 1) % collections.length];
      const nextLink = page.locator('#mobile-navigation').getByRole('link', { name: next.title, exact: true });
      await expect(nextLink).toBeInViewport({ ratio: 1 });
      await nextLink.click();
      await page.waitForURL(`/originals/collections/${next.slug}`, { timeout: 30_000 });
      await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    }
  });
}

test('collection navigation remains usable in a short landscape viewport', async ({ page }) => {
  await page.setViewportSize({ width: 852, height: 393 });
  await page.goto('/originals/collections/hillside-studies', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('main article').first()).toBeVisible();
  await page.mouse.move(426, 280);
  await page.mouse.wheel(0, 2500);
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(1000);
  await expect(page.getByRole('navigation', { name: 'Main navigation' })).not.toBeInViewport();
  await page.mouse.wheel(0, -12000);
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
  const toggle = page.getByRole('button', { name: 'Toggle Menu' });
  await expect(toggle).toBeInViewport({ ratio: 1 });
  await toggle.click();
  const about = page.locator('#mobile-navigation').getByRole('link', { name: 'About', exact: true });
  await expect(about).toBeInViewport({ ratio: 1 });
  await about.click();
  await page.waitForURL('/about', { timeout: 30_000 });
});

test('desktop collection navigation retains its normal document flow', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('/originals/collections/hillside-studies', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('main article').first()).toBeVisible();
  await page.mouse.move(640, 450);
  await page.mouse.wheel(0, 2000);
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(1000);
  await expect(page.getByRole('navigation', { name: 'Main navigation' })).not.toBeInViewport();
  await page.mouse.wheel(0, -12000);
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
  await expect(page.getByRole('navigation', { name: 'Main navigation' })).toBeInViewport({ ratio: 1 });
});
