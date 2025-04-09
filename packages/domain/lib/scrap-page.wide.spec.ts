import { createHtmlPage } from '@guacamolai/core';
import { Gemini } from '@guacamolai/infra';
import { lastValueFrom } from 'rxjs';
import { describe, it } from 'vitest';
import { scrapPage } from './scrap-page';
import angularGrazMeetupHtml from './test-fixtures/angular-graz-meetup.html?raw';
import marmicodeBlogPostHtml from './test-fixtures/marmicode-blog-post.html?raw';
import ngDeYounesJaaidiHtml from './test-fixtures/ng-de-younes-jaaidi.html?raw';

const TIMEOUT = 60_000;

describe(scrapPage.name, () => {
  it('scraps content from url', { timeout: TIMEOUT }, async () => {
    const { scrap } = setUp();

    const result = await scrap({
      page: createHtmlPage({
        url: 'https://marmicode.io/blog/angular-template-code-coverage-and-future-proof-testing',
        html: marmicodeBlogPostHtml,
      }),
    });

    expect(
      result
    ).toMatchObject({
      type: 'article',
      title: expect.stringContaining(
        'The Missing Ingredient for Angular Template Code Coverage and Future-Proof Testing'
      ),
      description: expect.stringContaining('Ahead-Of-Time (AOT)'),
      date: '2024-11-17',
    });
  });

  it('scraps talk from url', { timeout: TIMEOUT }, async () => {
    const { scrap } = setUp();

    expect(
      await scrap({
        page: createHtmlPage({
          url: 'https://ng-de.org/speakers/younes-jaaidi/',
          html: ngDeYounesJaaidiHtml,
        }),
      })
    ).toMatchObject({
      type: 'talk',
      title: 'Fake it till you Mock it',
      description: expect.stringContaining('Fake'),
      city: 'Bonn',
      country: 'Germany',
    });
  });

  it('scraps talk among other talks', { timeout: TIMEOUT }, async () => {
    const { scrap } = setUp();

    const { description } = await scrap({
      page: createHtmlPage({
        url: 'https://www.meetup.com/angular-meetup-graz/events/304485230/',
        html: angularGrazMeetupHtml,
      }),
      speakerName: 'Younes Jaaidi',
    });

    expect.soft(description).toContain('Nx Implicit');
    expect.soft(description).not.toContain('Alex Rickabaugh');
  });
});

function setUp() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not set');
  }
  const llm = new Gemini(apiKey);
  return {
    async scrap(args: Omit<Parameters<typeof scrapPage>[0], 'llm'>) {
      return lastValueFrom(
        scrapPage({
          llm,
          ...args,
        })
      );
    },
  };
}
