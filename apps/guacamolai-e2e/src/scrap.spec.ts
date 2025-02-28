import { test, expect } from '@playwright/test';

test('loads title', async ({ page }) => {
  test.fixme();

  await page.goto('/');

  await page.getByRole('button', { name: 'Add Activity' }).click();

  await page
    .getByLabel('URL')
    .fill('https://ng-de.org/speakers/younes-jaaidi/');

  await expect(page.getByLabel('Title')).toHaveText('Fake it till you Mock it');
});
