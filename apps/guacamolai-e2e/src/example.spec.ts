import { test, expect } from '@playwright/test';

test('loads fake advocu', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByLabel('URL')).toBeVisible();
});
