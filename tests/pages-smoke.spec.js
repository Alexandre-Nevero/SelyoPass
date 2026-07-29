import { expect, test } from '@playwright/test';

test('deployed hash routes load without browser errors', async ({ page }) => {
  const errors = [];
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  await page.goto('./#/verify');
  await expect(page.getByRole('heading', { name: 'Credential integrity result' })).toBeVisible();
  await expect(page.getByText('Your institution still makes its own KYB decision.').first()).toBeVisible();
  await page.goto('./#/prepare');
  await expect(page.getByRole('heading', { name: 'Prepare a presentation request' })).toBeVisible();
  expect(errors).toEqual([]);
});
