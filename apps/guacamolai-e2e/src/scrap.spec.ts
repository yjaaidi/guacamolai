import { test, expect } from './testing/fixtures';

test.beforeEach(async ({ page, setUpApiKey }) => {
  await setUpApiKey();
  await page.goto('/');
  await page.getByRole('button', { name: 'Add Activity' }).click();
});

test('disables scrap button initially as URL is empty', async ({ page }) => {
  await expect(page.getByRole('button', { name: 'Scrap' })).toBeDisabled();
});

test('disables scrap button if URL becomes invalid', async ({ page }) => {
  await page
    .getByLabel('URL')
    .fill('https://ng-de.org/speakers/younes-jaaidi/');

  await page.getByLabel('URL').fill('INVALID_URL');

  await expect(page.getByRole('button', { name: 'Scrap' })).toBeDisabled();
});

test('disables scrap button on click', async ({ page }) => {
  await page
    .getByLabel('URL')
    .fill('https://ng-de.org/speakers/younes-jaaidi/');

  const scrapButtonEl = page.getByRole('button', { name: 'Scrap' });
  await scrapButtonEl.click();

  await expect(scrapButtonEl).toBeDisabled();
});

test('loads talk', async ({ page }) => {
  await page
    .getByLabel('URL')
    .fill('https://ng-de.org/speakers/younes-jaaidi/');

  const scrapButtonEl = page.getByRole('button', { name: 'Scrap' });
  await scrapButtonEl.click();

  await expect
    .soft(page.getByLabel('Title'))
    .toHaveValue('Fake it till you Mock it');
  await expect
    .soft(page.getByTestId('description'))
    .toContainText(
      'How much do you trust the Mocks, Stubs and Spies you are using in your tests?'
    );
  await expect.soft(page.getByTestId('online-yes')).not.toHaveClass('checked');
  await expect.soft(page.getByTestId('online-no')).toHaveClass('checked');
  await expect.soft(scrapButtonEl).toBeEnabled();
});
