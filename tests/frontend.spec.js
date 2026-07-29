import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

for (const viewport of [
  { name: 'mobile', width: 390, height: 844 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'desktop', width: 1440, height: 900 },
]) {
  test(`${viewport.name}: routes remain accessible and honest`, async ({ page }, testInfo) => {
    const consoleErrors = [];
    page.on('console', (message) => {
      if (message.type() === 'error') consoleErrors.push(message.text());
    });
    await page.setViewportSize(viewport);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/#/prepare');
    await expect(page.getByRole('heading', { name: 'Prepare a presentation request' })).toBeFocused();
    await expect(page.getByRole('status')).toContainText('not configured');
    await expect(page.getByRole('link', { name: 'Prepare' })).toHaveAttribute('aria-current', 'page');
    if (viewport.name === 'mobile') {
      await expect(page.locator('.action-bar')).toHaveCSS('position', 'static');
      const tooSmall = await page.getByRole('button').evaluateAll((buttons) =>
        buttons.filter((button) => {
          const box = button.getBoundingClientRect();
          return box.width < 44 || box.height < 44;
        }).map((button) => button.textContent));
      expect(tooSmall).toEqual([]);
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await expect(page.getByRole('button', { name: 'Request credential' })).toHaveCSS('transition-duration', '0s');
    await page.keyboard.press('Tab');
    await expect(page.locator(':focus')).toBeVisible();
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
    await page.screenshot({
      path: testInfo.outputPath(`${viewport.name}-prepare.png`),
      fullPage: true,
      animations: 'disabled',
    });
    await page.goto('/#/verify');
    await expect(page.getByText('Your institution still makes its own KYB decision.').first()).toBeVisible();
    await expect(page.getByText(/Connect Freighter/)).toHaveCount(0);
    await page.goto('/#/anchor');
    await expect(page.getByRole('heading', { name: 'Pending request events' })).toBeVisible();
    await expect(page.getByText(/No unresolved request event/)).toBeVisible();
    expect(consoleErrors).toEqual([]);
  });
}
