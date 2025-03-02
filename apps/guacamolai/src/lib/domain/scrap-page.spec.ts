import { lastValueFrom } from 'rxjs';
import { describe, it } from 'vitest';
import { LlmFake } from '../core/llm.fake';
import { scrapPage } from './scrap-page';

describe(scrapPage.name, () => {
  it('converts date-time to date', async () => {
    const llm = new LlmFake();
    llm.setResponses({
      'Younes Jaaidi - NG-DE 2024': {
        activityType: 'talk',
        title: 'Fake it till you Mock it',
        description: `How much do you trust the Mocks, Stubs and Spies you are using in your tests?`,
        online: false,
        city: 'Berlin',
        country: 'Germany',
        date: '2024-10-01T00:00:00Z',
      },
    });

    const talk = await lastValueFrom(
      scrapPage({
        llm,
        page: {
          url: 'https://ng-de.org/speakers/younes-jaaidi/',
          html: 'Something about Younes Jaaidi - NG-DE 2024 ...',
        },
      })
    );
    expect(talk?.date).toBe('2024-10-01');
  });
});
