import { expect, test } from './testing/fixtures';

test.beforeEach(
  async ({ advocuActivitiesPage, scrapFormGlove, setUpLlmFake }) => {
    test.slow();
    await setUpLlmFake([
      {
        pattern: 'Apps Are Over. Think Libs With Nx.',
        value: {
          activityType: 'talk',
          url: 'https://js-poland.pl/speaker/2024/younes-jaaidi',
          title: 'Apps Are Over. Think Libs With Nx.',
          description: `Beyond being the leading human-readable alternative to Bazel for organizing a Monorepo, among other qualities, Nx is also a tool that allows you to easily split and organize your applications into libraries. But why would we give in to such a temptation? Is it for simple aesthetics, or are there deeper benefits?
Let's meet at this talk to see for yourself the benefits that Nx can bring you, starting with a progressive adoption strategy tomorrow.`,
          date: '2024-10-01T00:00:00Z',
          online: false,
          city: 'Warsaw',
          country: 'Poland',
        },
      },
      {
        pattern: 'Marmicode',
        value: {
          activityType: 'article',
          title:
            'The Missing Ingredient for Angular Template Code Coverage and Future-Proof Testing',
          description:
            'This article presents how turning on Ahead-Of-Time (AOT) compilation for your Angular tests enables accurate template code coverage, faster test execution, production-symmetry, and future-proof tests.',
          date: '2024-11-18',
        },
      },
      {
        /* This response only matches if the user provides a speaker name. */
        pattern: 'focus only on the content related to "Younes Jaaidi"',
        value: {
          activityType: 'talk',
          title: 'Nx Implicit Libraries',
          description: `How to create and share implicit libraries in Nx`,
          date: '2024-12-12',
          city: 'Graz',
          country: 'Austria',
        },
      },
    ]);

    await advocuActivitiesPage.goto();

    await scrapFormGlove.waitForUrlInput();
  }
);

test('disables scrap button initially as URL is empty', async ({
  scrapFormGlove,
}) => {
  await expect(scrapFormGlove.scrapButton).toBeDisabled();
});

test('disables scrap button if URL becomes invalid', async ({
  scrapFormGlove,
}) => {
  await scrapFormGlove.fill('https://js-poland.pl/speaker/2024/younes-jaaidi');

  await scrapFormGlove.fill('INVALID_URL');

  await expect(scrapFormGlove.scrapButton).toBeDisabled();
});

test('disables scrap button on click', async ({ scrapFormGlove }) => {
  await scrapFormGlove.fillAndSubmit(
    'https://js-poland.pl/speaker/2024/younes-jaaidi'
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
    'https://js-poland.pl/speaker/2024/younes-jaaidi'
  );

  await expect(activityForm.title).toHaveValue(
    'Apps Are Over. Think Libs With Nx.',
    { timeout: 10_000 }
  );

  await expect.soft(activityForm.description).toContainText('Monorepo');
  await expect.soft(activityForm.eventFormat).toHaveText('In-Person');

  await expect.soft(activityForm.country).toHaveText('Poland');
  await expect.soft(activityForm.city).toHaveValue('Warsaw');

  await expect.soft(activityForm.date).toHaveValue('2024-10-01');
  await expect
    .soft(activityForm.link)
    .toHaveValue('https://js-poland.pl/speaker/2024/younes-jaaidi');

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
    'https://js-poland.pl/speaker/2024/younes-jaaidi'
  );

  await expect(activityForm.title).toHaveValue(
    'Apps Are Over. Think Libs With Nx.',
    { timeout: 10_000 }
  );

  /* Make sure `ng-de.org` tab is closed after scraping. */
  await expect
    .poll(() => context.pages().map((p) => p.url()))
    .not.toEqual(
      expect.arrayContaining([expect.stringContaining('js-poland.pl')])
    );
});

test('shows error toast', async ({ page, scrapFormGlove }) => {
  await scrapFormGlove.fillAndSubmit('https://some-invalid-url/');

  await expect(page.getByRole('alert')).toContainText('🥑 GuacamolAI Error');
});
