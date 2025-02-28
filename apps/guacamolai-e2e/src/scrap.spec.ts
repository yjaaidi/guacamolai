import { test, expect } from './fixtures';

test.beforeEach(async ({ setUpApiKey }) => {
  await setUpApiKey();
});

test('loads talk', async ({ page }) => {
  await page.goto('/');

  await page.getByRole('button', { name: 'Add Activity' }).click();

  await page
    .getByLabel('URL')
    .fill('https://ng-de.org/speakers/younes-jaaidi/');

  const scrapButtonEl = page.getByRole('button', { name: 'Scrap' });
  await scrapButtonEl.click();

  await expect.soft(scrapButtonEl).toBeDisabled();

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
