import { test, expect } from './testing/fixtures';
import { ACTIVITIES_URL } from './testing/urls';

test.beforeEach(async ({ page, setUpGeminiApiKey }) => {
  await setUpGeminiApiKey();

  await page.addLocatorHandler(
    page.getByRole('button', { name: 'Close Stonly widget' }),
    (el) => el.click()
  );

  await page.goto(ACTIVITIES_URL);
});

test('loads talk', async ({ page, scrapFormGlove }) => {
  test.slow();

  await scrapFormGlove.fillAndSubmit(
    'https://ng-de.org/speakers/younes-jaaidi/'
  );

  await expect
    .soft(page.getByLabel('What was the title of your talk?'))
    .toHaveValue('Fake it till you Mock it', {
      timeout: 10_000,
    });

  await expect
    .soft(
      page
        .locator('[id="\\#\\/properties\\/description"]')
        .getByRole('paragraph')
    )
    .toContainText('Fake');
});
