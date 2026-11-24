import { expect, test } from '@playwright/test';

test('collection and detail previews load before the on-demand enlargement', async ({ page, isMobile }) => {
  const enlargements = new Set<string>();
  page.on('request', request => {
    const url = new URL(request.url());
    if (url.hostname === 'cdn.sanity.io' && url.searchParams.get('w') === '4200') {
      enlargements.add(url.pathname);
    }
  });

  await page.goto('/originals/collections/hillside-studies');
  const card = page.locator('main article').first();
  const preview = card.locator('img').first();
  await expect(preview).toHaveAttribute('srcset', /auto=format/);
  await preview.evaluate((img: HTMLImageElement) => img.decode());
  const previewWidth = await preview.evaluate((img: HTMLImageElement) => Number(new URL(img.currentSrc).searchParams.get('w')));
  expect(previewWidth).toBeGreaterThan(0);
  expect(previewWidth).toBeLessThan(2400);
  await expect(card.locator('img')).toHaveCount(1);

  if (!isMobile) {
    await card.hover();
    const alternate = card.getByRole('img', { name: /alternate view$/ });
    await expect(alternate).toHaveCSS('opacity', '1');
    await expect(alternate).toHaveAttribute('srcset', /auto=format/);
  }

  await preview.click();
  const painting = page.getByRole('img', { name: / image 1$/ });
  await expect(painting).toHaveAttribute('srcset', /auto=format/);
  const pageSizes = await painting.getAttribute('sizes');
  const alternate = page.getByRole('img', { name: / image 2$/ });
  const thumbnail = page.getByRole('img', { name: / thumbnail 2$/ });
  await expect(alternate).toHaveAttribute('sizes', (await thumbnail.getAttribute('sizes'))!);
  await thumbnail.click();
  await expect(alternate).toHaveAttribute('sizes', pageSizes!);
  expect(enlargements.size).toBe(0);
  await alternate.click();

  const close = page.getByRole('button', { name: 'Close enlarged image' });
  await expect(close).toBeVisible();
  const enlarged = page.locator('main img[src*="w=4200"]');
  await expect(enlarged).toHaveCount(1);
  await enlarged.evaluate((img: HTMLImageElement) => img.decode());
  const previewPath = await alternate.first().evaluate((img: HTMLImageElement) => new URL(img.currentSrc).pathname);
  expect([...enlargements]).toEqual([previewPath]);
  await close.click();
  await expect(enlarged).toHaveCount(0);
});
