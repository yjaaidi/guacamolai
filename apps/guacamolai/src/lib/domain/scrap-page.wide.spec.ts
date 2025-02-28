import { firstValueFrom } from 'rxjs';
import { Gemini } from '../infra/gemini';
import { scrapPage as scrapHtml } from './scrap-page';
import ngDeYounesJaaidiHtml from './test-fixtures/ng-de-younes-jaaidi.html?raw';

describe(scrapHtml.name, () => {
  it('scraps talk from url', async () => {
    const { scrap } = setUp();

    expect(await firstValueFrom(scrap(ngDeYounesJaaidiHtml))).toEqual({
      title: 'Fake it till you Mock it',
      description: `How much do you trust the Mocks, Stubs and Spies you are using in your tests? Aren’t you tired of maintaining and debugging them, or trying to keep them in sync with the real implementation? Join us to see how Fakes and their fellow companions, Object Mothers, and Gloves might just become the pillars of your testing strategy.`,
      online: false,
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
    scrap(html: string) {
      return scrapHtml({ llm, html });
    },
  };
}
