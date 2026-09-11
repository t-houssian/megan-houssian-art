import { expect, test } from '@playwright/test';

for (const [path, field] of [['/contact', '#firstName'], ['/commissions', '#name']]) {
  test(`${path} waits for hydration before accepting input`, async ({ page }) => {
    let finishLoading!: () => void;
    const loading = new Promise<void>(resolve => { finishLoading = resolve; });
    await page.route('**/_next/static/**/*.js', async route => { await loading; await route.continue(); });
    await page.goto(path, { waitUntil: 'commit' });
    await expect(page.locator(field)).toBeDisabled();
    finishLoading();
    await expect(page.locator(field)).toBeEnabled({ timeout: 15000 });
    await page.locator(field).fill('Kept after hydration');
    await expect(page.locator(field)).toHaveValue('Kept after hydration');
  });
}

test('contact submission shows progress, prevents repeats, and keeps the cart', async ({ page }) => {
  let submissions = 0;
  let finish!: () => void;
  const pending = new Promise<void>(resolve => { finish = resolve; });
  await page.route('**/api/send-email', async route => {
    submissions++;
    await pending;
    await route.fulfill({ json: { success: true } });
  });
  await page.goto('/contact', { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => localStorage.setItem('mha-cart-v1', JSON.stringify([{ id: 'kept', title: 'Painting', type: 'original' }])));
  await page.locator('#firstName').fill('Test');
  await page.locator('#lastName').fill('Customer');
  await page.locator('#email').fill('customer@example.com');
  await page.locator('#subject').fill('Question');
  await page.locator('#message').fill('Tell me about this painting.');
  await page.getByRole('button', { name: 'Send Message' }).click();
  await expect(page.getByRole('button', { name: 'Sending message…' })).toBeDisabled();
  await expect.poll(() => submissions).toBe(1);
  finish();
  await expect(page).toHaveURL('/contact/success');
  await expect(page.getByRole('heading', { name: 'Message Sent', exact: true })).toBeInViewport();
  await expect(page.getByText('Payment Successful!')).toHaveCount(0);
  expect(await page.evaluate(() => localStorage.getItem('mha-cart-v1'))).toContain('kept');
});

test('contact failures are inline and preserve details for retry', async ({ page }) => {
  await page.route('**/api/send-email', route => route.fulfill({ status: 502, json: { error: 'Please try again.' } }));
  await page.goto('/contact', { waitUntil: 'domcontentloaded' });
  await page.locator('#firstName').fill('Test');
  await page.locator('#lastName').fill('Customer');
  await page.locator('#email').fill('customer@example.com');
  await page.locator('#subject').fill('Question');
  await page.locator('#message').fill('Keep this message.');
  await page.getByRole('button', { name: 'Send Message' }).click();
  await expect(page.locator('form').getByRole('alert')).toHaveText('Please try again.');
  await expect(page.locator('#message')).toHaveValue('Keep this message.');
  await expect(page.getByRole('button', { name: 'Send Message' })).toBeEnabled();
});

test('commission request has its own confirmation and preserves the cart', async ({ page }) => {
  await page.route('**/api/send-email', route => route.fulfill({ json: { success: true } }));
  await page.goto('/commissions', { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => localStorage.setItem('mha-cart-v1', JSON.stringify([{ id: 'kept', title: 'Painting', type: 'original' }])));
  await page.locator('#name').fill('Test Customer');
  await page.locator('#email').fill('customer@example.com');
  await page.locator('#description').fill('A landscape painting.');
  await page.locator('button[type=submit]').click();
  await expect(page).toHaveURL('/commissions/success');
  await expect(page.getByRole('heading', { name: 'Commission Request Sent' })).toBeInViewport();
  await expect(page.getByText('This is an inquiry only. No payment has been taken.')).toBeVisible();
  expect(await page.evaluate(() => localStorage.getItem('mha-cart-v1'))).toContain('kept');
});

test('oversized individual photos are rejected before uploading', async ({ page }) => {
  await page.goto('/commissions', { waitUntil: 'domcontentloaded' });
  await page.locator('#referenceImages').setInputFiles({ name: 'too-large.jpg', mimeType: 'image/jpeg', buffer: Buffer.alloc(26 * 1024 * 1024) });
  await expect(page.getByText('Please keep each reference image under 25 MB.')).toBeVisible();
});

test('non-JSON hosting errors stay on the form and allow retry', async ({ page }) => {
  await page.route('**/api/send-email', route => route.fulfill({ status: 413, contentType: 'text/plain', body: 'FUNCTION_PAYLOAD_TOO_LARGE' }));
  await page.goto('/commissions', { waitUntil: 'domcontentloaded' });
  await page.locator('#name').fill('Test Customer');
  await page.locator('#email').fill('customer@example.com');
  await page.locator('button[type=submit]').click();
  await expect(page.locator('form').getByRole('alert')).toContainText('upload is too large');
  await expect(page.locator('#name')).toHaveValue('Test Customer');
  await expect(page.locator('button[type=submit]')).toBeEnabled();
});

test('large photo uploads directly, stays private, and downloads through an expiring link', async ({ page, request }, testInfo) => {
  test.skip(process.env.RUN_STORAGE_SMOKE !== '1' || testInfo.project.name !== 'chromium', 'Opt-in test creates and removes a temporary photo in connected storage.');
  test.setTimeout(120_000);
  const { default: nextEnv } = await import('@next/env');
  nextEnv.loadEnvConfig(process.cwd());
  const { del } = await import('@vercel/blob');
  const { readReferenceToken, getReferenceLinks } = await import('../../lib/commission-uploads');
  let token = '';
  let requestBytes = 0;
  await page.route('**/api/send-email', async route => {
    const body = route.request().postDataBuffer()!;
    requestBytes = body.length;
    const form = await new Request('http://localhost', { method: 'POST', headers: { 'Content-Type': route.request().headers()['content-type'] }, body: new Uint8Array(body) }).formData();
    token = String(form.get('uploadSession'));
    await route.fulfill({ json: { success: true } });
  });
  try {
    await page.goto('/commissions', { waitUntil: 'domcontentloaded' });
    await page.locator('#name').fill('Automated storage check');
    await page.locator('#email').fill('test@example.com');
    // A synthetic 6 MB image fixture crosses the function body limit.
    await page.locator('#referenceImages').setInputFiles({ name: 'storage-check.jpg', mimeType: 'image/jpeg', buffer: Buffer.alloc(6 * 1024 * 1024) });
    await page.locator('button[type=submit]').click();
    await expect(page).toHaveURL('/commissions/success', { timeout: 90_000 });
    expect(requestBytes).toBeLessThan(10_000);
    const links = await getReferenceLinks(token);
    expect(links).toHaveLength(1);
    const downloadUrl = new URL(links[0].url);
    const response = await request.get(downloadUrl.pathname + downloadUrl.search, { maxRedirects: 0 });
    expect(response.status()).toBe(302);
    const signedUrl = response.headers().location;
    const signed = await fetch(signedUrl);
    expect(signed.status).toBe(200);
    expect((await signed.arrayBuffer()).byteLength).toBe(6 * 1024 * 1024);
    const unsignedUrl = new URL(signedUrl);
    unsignedUrl.search = '';
    expect((await fetch(unsignedUrl)).ok).toBe(false);
  } finally {
    if (token) {
      const session = readReferenceToken<{ purpose: 'upload'; validUntil: number; files: { pathname: string; name: string; size: number; contentType: string }[] }>(token, 'upload');
      await del(session.files.map(file => file.pathname));
    }
  }
});
