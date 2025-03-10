import { HtmlPage } from '@guacamolai/core';
import { Gemini } from '@guacamolai/infra';
import { lastValueFrom } from 'rxjs';
import { describe, it } from 'vitest';
import { scrapPage } from './scrap-page';
import marmicodeBlogPostHtml from './test-fixtures/marmicode-blog-post.html?raw';
import ngDeYounesJaaidiHtml from './test-fixtures/ng-de-younes-jaaidi.html?raw';

const TIMEOUT = 30_000;

describe(scrapPage.name, () => {
  it('scraps content from url', { timeout: TIMEOUT }, async () => {
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
      description: expect.stringContaining('Ahead-Of-Time (AOT)'),
      date: '2024-11-18',
    });
  });

  it('scraps talk from url', { timeout: TIMEOUT }, async () => {
    const { scrap } = setUp();

    expect(
      await scrap({
        url: 'https://ng-de.org/speakers/younes-jaaidi/',
        html: ngDeYounesJaaidiHtml,
      })
    ).toMatchObject({
      type: 'talk',
      title: 'Fake it till you Mock it',
      description: expect.stringContaining('Fake'),
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
