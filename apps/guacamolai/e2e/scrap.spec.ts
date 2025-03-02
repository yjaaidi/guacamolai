import { expect, test } from './testing/fixtures';
import { ACTIVITIES_URL } from './testing/urls';

test.beforeEach(async ({ page, setUpLlmFake }) => {
  await setUpLlmFake({
    'Younes Jaaidi - NG-DE 2024': {
      activityType: 'talk',
      url: 'https://ng-de.org/speakers/younes-jaaidi/',
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

  await page.goto(ACTIVITIES_URL);
});

test('disables scrap button initially as URL is empty', async ({
  scrapFormGlove,
}) => {
  await expect(scrapFormGlove.scrapButton).toBeDisabled();
});

test('disables scrap button if URL becomes invalid', async ({
  scrapFormGlove,
}) => {
  await scrapFormGlove.fill('https://ng-de.org/speakers/younes-jaaidi/');

  await scrapFormGlove.fill('INVALID_URL');

  await expect(scrapFormGlove.scrapButton).toBeDisabled();
});

test('disables scrap button on click', async ({ scrapFormGlove }) => {
  await scrapFormGlove.fillAndSubmit(
    'https://ng-de.org/speakers/younes-jaaidi/'
  );

  await expect(scrapFormGlove.scrapButton).toBeDisabled();
});

test('loads talk', async ({ page, scrapFormGlove }) => {
  await scrapFormGlove.fillAndSubmit(
    'https://ng-de.org/speakers/younes-jaaidi/'
  );

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
  await expect
    .soft(page.getByLabel('Share any relevant link'))
    .toHaveValue('https://ng-de.org/speakers/younes-jaaidi/');

  await expect.soft(scrapFormGlove.scrapButton).toBeEnabled();
});
