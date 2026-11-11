import { expect, test } from '@playwright/test';

test('collector signup prevents duplicate requests and uses the editable site confirmation', async ({ page }) => {
  let submissions = 0;
  let submitted: unknown;
  let finish!: () => void;
  const pending = new Promise<void>((resolve) => { finish = resolve; });
  await page.route('**/api/kit/subscribe', async (route) => {
    submissions++;
    submitted = route.request().postDataJSON();
    await pending;
    await route.fulfill({ json: { success: true, message: 'Old API early access promise' } });
  });
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  const section = page.locator('#collector-list');
  await section.getByRole('button').click();
  await section.locator('#collector-first-name').fill('  Collector  ');
  await section.locator('#collector-email').fill('collector@example.com');
  const submit = section.locator('button[type="submit"]');
  await submit.dblclick({ delay: 20 });
  await expect(submit).toBeDisabled();
  await expect(section.locator('button[type="button"]')).toBeDisabled();
  await expect.poll(() => submissions).toBe(1);
  expect(submitted).toMatchObject({ firstName: 'Collector', email: 'collector@example.com' });
  finish();
  await expect(section.getByRole('status')).not.toHaveText('');
  await expect(section.getByRole('status')).not.toContainText('Old API early access promise');
  await expect(section.locator('#collector-first-name')).toHaveValue('');
  await expect(section.locator('#collector-email')).toHaveValue('');
  await expect(submit).toBeEnabled();
});

test('collector signup keeps details after hosting errors and allows a safe retry', async ({ page }) => {
  let submissions = 0;
  await page.route('**/api/kit/subscribe', async (route) => {
    submissions++;
    if (submissions === 1) {
      await route.fulfill({ status: 503, contentType: 'text/html', body: '<h1>Hosting error</h1>' });
    } else {
      await route.fulfill({ json: { success: true } });
    }
  });
  await page.goto('/#collector-list', { waitUntil: 'domcontentloaded' });
  const section = page.locator('#collector-list');
  await section.locator('#collector-first-name').fill('Kept name');
  await section.locator('#collector-email').fill('collector@example.com');
  await section.locator('button[type="submit"]').click();
  await expect(section.getByRole('alert')).not.toHaveText('');
  await expect(section.getByRole('alert')).not.toContainText('Hosting error');
  await expect(section.locator('#collector-first-name')).toHaveValue('Kept name');
  await expect(section.locator('#collector-email')).toHaveValue('collector@example.com');
  await section.locator('button[type="submit"]').click();
  await expect(section.getByRole('status')).not.toHaveText('');
  expect(submissions).toBe(2);
});

test('collector links retain canonical and legacy hashes and open the form after hydration', async ({ page }) => {
  await page.route('**/api/kit/subscribe', (route) => route.abort());
  for (const hash of ['collector-list', 'collector-early-access']) {
    await page.goto(`/#${hash}`, { waitUntil: 'domcontentloaded' });
    await expect(page.locator('#collector-first-name')).toBeEnabled();
    await expect(page).toHaveURL(new RegExp(`#${hash}$`));
  }
});

test('about and contact invitations lead to the local collector form', async ({ page }) => {
  await page.route('**/api/kit/subscribe', (route) => route.abort());
  for (const path of ['/about', '/contact']) {
    await page.goto(path, { waitUntil: 'domcontentloaded' });
    const link = page.locator('main a[href="/#collector-list"]').first();
    await expect(link).toBeVisible();
    await link.click();
    await expect(page).toHaveURL('/#collector-list');
    await expect(page.locator('#collector-first-name')).toBeEnabled();
  }
});
