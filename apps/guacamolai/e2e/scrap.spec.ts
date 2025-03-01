import { test, expect } from './testing/fixtures';

test.beforeEach(async ({ page, setUpLlmFake }) => {
  await setUpLlmFake({
    'Younes Jaaidi - NG-DE 2024': {
      title: 'Fake it till you Mock it',
      description: `How much do you trust the Mocks, Stubs and Spies you are using in your tests?`,
      online: false,
      city: 'Berlin',
      country: 'Germany',
      date: '2024-10-01T00:00:00Z',
    },
  });

  await page.addLocatorHandler(
    page.getByRole('button', { name: 'Close Stonly widget' }),
    (el) => el.click()
  );

  await page.goto('/');
  await page.getByRole('button', { name: 'Add new activity' }).click();
  await page.getByRole('listitem').filter({ hasText: 'New activity' }).click();
  await page.getByRole('heading', { name: 'Public speaking' }).click();
});

test('disables scrap button initially as URL is empty', async ({ page }) => {
  await expect(page.getByRole('button', { name: 'Scrap' })).toBeDisabled();
});

test('disables scrap button if URL becomes invalid', async ({ page }) => {
  await page
    .getByLabel('Share any relevant link')
    .fill('https://ng-de.org/speakers/younes-jaaidi/');

  await page.getByLabel('Share any relevant link').fill('INVALID_URL');

  await expect(page.getByRole('button', { name: 'Scrap' })).toBeDisabled();
});

test('disables scrap button on click', async ({ page }) => {
  await page
    .getByLabel('Share any relevant link')
    .fill('https://ng-de.org/speakers/younes-jaaidi/');

  const scrapButtonEl = page.getByRole('button', { name: 'Scrap' });
  await scrapButtonEl.click();

  await expect(scrapButtonEl).toBeDisabled();
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
  await expect
    .soft(page.getByPlaceholder('Select date'))
    .toHaveValue('2024-10-01');
  await expect.soft(scrapButtonEl).toBeEnabled();
});
