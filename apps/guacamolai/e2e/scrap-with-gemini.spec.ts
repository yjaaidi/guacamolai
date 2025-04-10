import { test, expect } from './testing/fixtures';

test.beforeEach(async ({ advocuActivitiesPage, setUpGeminiApiKey }) => {
  await setUpGeminiApiKey();

  await advocuActivitiesPage.goto();
});

test('loads talk', async ({ advocuActivitiesPage, scrapFormGlove }) => {
  test.slow();

  await scrapFormGlove.fillAndSubmit(
    'https://js-poland.pl/speaker/2024/younes-jaaidi'
  );

  await expect(advocuActivitiesPage.activityForm.title).toHaveValue(
    'Apps Are Over. Think Libs With Nx.',
    { timeout: 15_000 }
  );

  await expect
    .soft(advocuActivitiesPage.activityForm.description)
    .toContainText('Monorepo');
});
