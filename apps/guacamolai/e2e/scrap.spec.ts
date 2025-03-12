import { expect, test } from './testing/fixtures';
import { ACTIVITIES_URL } from './testing/urls';

test.beforeEach(async ({ page, setUpLlmFake }) => {
  await setUpLlmFake({
    'Younes Jaaidi - NG-DE 2024': {
      activityType: 'talk',
      url: 'https://ng-de.org/speakers/younes-jaaidi/',
      title: 'Fake it till you Mock it',
      description: `How much do you trust the Mocks, Stubs and Spies you are using in your tests?`,
      date: '2024-10-01T00:00:00Z',
      online: false,
      city: 'Berlin',
      country: 'Germany',
    },
    Marmicode: {
      activityType: 'article',
      title:
        'The Missing Ingredient for Angular Template Code Coverage and Future-Proof Testing',
      description:
        'This article presents how turning on Ahead-Of-Time (AOT) compilation for your Angular tests enables accurate template code coverage, faster test execution, production-symmetry, and future-proof tests.',
      date: '2024-11-18',
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

test('loads article', async ({ page, scrapFormGlove }) => {
  test.slow();

  await scrapFormGlove.fillAndSubmit(
    'https://marmicode.io/blog/angular-template-code-coverage-and-future-proof-testing'
  );

  await expect(page.getByLabel('What was the title?')).toHaveValue(
    'The Missing Ingredient for Angular Template Code Coverage and Future-Proof Testing',
    {
      timeout: 10_000,
    }
  );

  await expect
    .soft(page.locator('[id="#/properties/contentType"]'))
    .toHaveText('Articles');

  await expect
    .soft(
      page
        .locator('[id="\\#\\/properties\\/description"]')
        .getByRole('paragraph')
    )
    .toContainText(
      'This article presents how turning on Ahead-Of-Time (AOT) compilation for your Angular tests enables accurate template code coverage, faster test execution, production-symmetry, and future-proof tests.'
    );
  await expect
    .soft(page.getByPlaceholder('Select date'))
    .toHaveValue('2024-11-18');
  await expect
    .soft(page.getByLabel('Link to Content'))
    .toHaveValue(
      'https://marmicode.io/blog/angular-template-code-coverage-and-future-proof-testing'
    );

  await expect.soft(scrapFormGlove.scrapButton).toBeEnabled();
});

test('loads talk', async ({ page, scrapFormGlove }) => {
  test.slow();

  await scrapFormGlove.fillAndSubmit(
    'https://ng-de.org/speakers/younes-jaaidi/'
  );

  await expect(page.getByLabel('What was the title of your talk?')).toHaveValue(
    'Fake it till you Mock it',
    {
      timeout: 10_000,
    }
  );

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
    .soft(page.locator('[id="#/properties/country"]'))
    .toHaveText('Germany');
  await expect
    .soft(page.locator('[id="#/properties/city"]'))
    .toHaveValue('Berlin');

  await expect
    .soft(page.getByPlaceholder('Select date'))
    .toHaveValue('2024-10-01');
  await expect
    .soft(page.getByLabel('Share any relevant link'))
    .toHaveValue('https://ng-de.org/speakers/younes-jaaidi/');

  await expect.soft(scrapFormGlove.scrapButton).toBeEnabled();
});

test('close scrapping tab', async ({ context, page, scrapFormGlove }) => {
  test.slow();

  await scrapFormGlove.fillAndSubmit(
    'https://ng-de.org/speakers/younes-jaaidi/'
  );

  await expect(page.getByLabel('What was the title of your talk?')).toHaveValue(
    'Fake it till you Mock it',
    {
      timeout: 10_000,
    }
  );

  /* Make sure `ng-de.org` tab is closed after scraping. */
  await expect
    .poll(() => context.pages().map((p) => p.url()))
    .not.toEqual(
      expect.arrayContaining([expect.stringContaining('ng-de.org')])
    );
});
