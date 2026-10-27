import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test('feed page has no automatically detectable accessibility violations', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Feed' })).toBeVisible();

  const results = await new AxeBuilder({ page }).analyze();

  expect(results.violations).toEqual([]);
});
