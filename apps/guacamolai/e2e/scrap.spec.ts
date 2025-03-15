import { expect, test } from './testing/fixtures';

test.beforeEach(async ({ advocuActivitiesPage, setUpLlmFake }) => {
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
    'focus only on the content related to "Younes Jaaidi"': {
      activityType: 'talk',
      title: 'Nx Implicit Libraries',
      description: `How to create and share implicit libraries in Nx`,
      date: '2024-12-12',
      city: 'Graz',
      country: 'Austria',
    },
  });

  await advocuActivitiesPage.goto();
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

test('loads article', async ({
  advocuActivitiesPage: { activityForm },
  scrapFormGlove,
}) => {
  test.slow();

  await scrapFormGlove.fillAndSubmit(
    'https://marmicode.io/blog/angular-template-code-coverage-and-future-proof-testing'
  );

  await expect(activityForm.title).toHaveValue(
    'The Missing Ingredient for Angular Template Code Coverage and Future-Proof Testing',
    { timeout: 10_000 }
  );

  await expect.soft(activityForm.contentType).toHaveText('Articles');

  await expect
    .soft(activityForm.description)
    .toContainText(
      'This article presents how turning on Ahead-Of-Time (AOT) compilation for your Angular tests enables accurate template code coverage, faster test execution, production-symmetry, and future-proof tests.'
    );
  await expect.soft(activityForm.date).toHaveValue('2024-11-18');
  await expect
    .soft(activityForm.link)
    .toHaveValue(
      'https://marmicode.io/blog/angular-template-code-coverage-and-future-proof-testing'
    );

  await expect.soft(scrapFormGlove.scrapButton).toBeEnabled();
});

test('loads talk', async ({
  advocuActivitiesPage: { activityForm },
  scrapFormGlove,
}) => {
  test.slow();

  await scrapFormGlove.fillAndSubmit(
    'https://ng-de.org/speakers/younes-jaaidi/'
  );

  await expect(activityForm.title).toHaveValue('Fake it till you Mock it', {
    timeout: 10_000,
  });

  await expect
    .soft(activityForm.description)
    .toContainText(
      'How much do you trust the Mocks, Stubs and Spies you are using in your tests?'
    );
  await expect.soft(activityForm.isOnlineCheckbox).not.toBeChecked();
  await expect.soft(activityForm.isOfflineCheckbox).toBeChecked();

  await expect.soft(activityForm.country).toHaveText('Germany');
  await expect.soft(activityForm.city).toHaveValue('Berlin');

  await expect.soft(activityForm.date).toHaveValue('2024-10-01');
  await expect
    .soft(activityForm.link)
    .toHaveValue('https://ng-de.org/speakers/younes-jaaidi/');

  await expect.soft(scrapFormGlove.scrapButton).toBeEnabled();
});

test('loads talk with speaker', async ({
  advocuActivitiesPage,
  page,
  goToExtensionPopup,
  scrapFormGlove,
}) => {
  test.slow();

  await goToExtensionPopup();

  await page.getByPlaceholder('Speaker Name').fill('Younes Jaaidi');

  await advocuActivitiesPage.goto();

  await scrapFormGlove.fillAndSubmit(
    'https://www.meetup.com/angular-meetup-graz/events/304485230/'
  );

  await expect(advocuActivitiesPage.activityForm.title).toHaveValue(
    'Nx Implicit Libraries',
    { timeout: 20_000 }
  );
});

test('close scrapping tab', async ({
  context,
  advocuActivitiesPage: { activityForm },
  scrapFormGlove,
}) => {
  test.slow();

  await scrapFormGlove.fillAndSubmit(
    'https://ng-de.org/speakers/younes-jaaidi/'
  );

  await expect(activityForm.title).toHaveValue('Fake it till you Mock it', {
    timeout: 10_000,
  });

  /* Make sure `ng-de.org` tab is closed after scraping. */
  await expect
    .poll(() => context.pages().map((p) => p.url()))
    .not.toEqual(
      expect.arrayContaining([expect.stringContaining('ng-de.org')])
    );
});
