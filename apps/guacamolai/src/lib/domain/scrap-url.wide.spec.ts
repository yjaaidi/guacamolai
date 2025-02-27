import { firstValueFrom } from 'rxjs';
import { Gemini } from '../infra/gemini';
import { scrapUrl } from './scrap-url';

describe(scrapUrl.name, () => {
  it('scraps talk from url', async () => {
    const { scrap } = setUp();

    expect(
      await firstValueFrom(scrap('https://ng-de.org/speakers/younes-jaaidi/'))
    ).toEqual({
      title: 'Fake it till you Mock it',
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
    scrap(url: string) {
      return scrapUrl({ llm, url });
    },
  };
}
