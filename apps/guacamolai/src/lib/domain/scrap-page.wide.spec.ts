import { HtmlPage } from '@guacamolai/core';
import { lastValueFrom } from 'rxjs';
import { describe, it } from 'vitest';
import { Gemini } from '../infra/gemini';
import { scrapPage } from './scrap-page';
import marmicodeBlogPostHtml from './test-fixtures/marmicode-blog-post.html?raw';
import ngDeYounesJaaidiHtml from './test-fixtures/ng-de-younes-jaaidi.html?raw';

describe(scrapPage.name, () => {
  it('scraps content from url', async () => {
    const { scrap } = setUp();

    expect(
      await scrap({
        url: 'https://marmicode.io/blog/angular-template-code-coverage-and-future-proof-testing',
        html: marmicodeBlogPostHtml,
      })
    ).toMatchObject({
      type: 'article',
      title: expect.stringContaining(
        'The Missing Ingredient for Angular Template Code Coverage and Future-Proof Testing'
      ),
      description:
        'This article presents how turning on Ahead-Of-Time (AOT) compilation for your Angular tests enables accurate template code coverage, faster test execution, production-symmetry, and future-proof tests.',
      date: '2024-11-18',
    });
  });

  it('scraps talk from url', async () => {
    const { scrap } = setUp();

    expect(
      await scrap({
        url: 'https://ng-de.org/speakers/younes-jaaidi/',
        html: ngDeYounesJaaidiHtml,
      })
    ).toMatchObject({
      type: 'talk',
      title: 'Fake it till you Mock it',
      description: `How much do you trust the Mocks, Stubs and Spies you are using in your tests? Aren’t you tired of maintaining and debugging them, or trying to keep them in sync with the real implementation? Join us to see how Fakes and their fellow companions, Object Mothers, and Gloves might just become the pillars of your testing strategy.`,
      city: 'Berlin',
      country: 'Germany',
    });
  });
});

function setUp() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not set');
  }
  const llm = new Gemini(apiKey);
  return {
    async scrap(page: HtmlPage) {
      return lastValueFrom(
        scrapPage({
          llm,
          page,
        })
      );
    },
  };
}
