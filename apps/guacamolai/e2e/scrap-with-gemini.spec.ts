import { test, expect } from './testing/fixtures';

test.beforeEach(async ({ page, setUpGeminiApiKey }) => {
  await setUpGeminiApiKey();

  await page.addLocatorHandler(
    page.getByRole('button', { name: 'Close Stonly widget' }),
    (el) => el.click()
  );

  await page.goto('/');
  await page.getByRole('button', { name: 'Add new activity' }).click();
  await page.getByRole('listitem').filter({ hasText: 'New activity' }).click();
  await page.getByRole('heading', { name: 'Public speaking' }).click();
});

test('loads talk', async ({ page }) => {
  await page
    .getByLabel('Share any relevant link')
    .fill('https://ng-de.org/speakers/younes-jaaidi/');

  const scrapButtonEl = page.getByRole('button', { name: 'Scrap' });
  await scrapButtonEl.click();
  
  await expect
    .soft(page.getByLabel('What was the title of your talk?'))
    .toHaveValue('Fake it till you Mock it');
  await expect
    .soft(
      page
        .locator('[id="\\#\\/properties\\/description"]')
        .getByRole('paragraph')
    )
    .toContainText(
      'How much do you trust the Mocks, Stubs and Spies you are using in your tests?'
    );
  await expect.soft(page.getByLabel('Yes')).not.toBeChecked();
  await expect.soft(page.getByLabel('No')).toBeChecked();
  await expect.soft(scrapButtonEl).toBeEnabled();
});
