import { test, expect } from './testing/fixtures';

test.beforeEach(async ({ advocuActivitiesPage, setUpGeminiApiKey }) => {
  await setUpGeminiApiKey();

  await advocuActivitiesPage.goto();
});

test('loads talk', async ({ advocuActivitiesPage, scrapFormGlove }) => {
  test.slow();

  await scrapFormGlove.fillAndSubmit(
    'https://ng-de.org/speakers/younes-jaaidi/'
  );

  await expect(advocuActivitiesPage.activityForm.title).toHaveValue(
    'Fake it till you Mock it',
    {
      timeout: 10_000,
    }
  );

  await expect
    .soft(advocuActivitiesPage.activityForm.description)
    .toContainText('Fake');
});
