import { Activity, Talk } from '@guacamolai/core';
import { LlmFake } from '@guacamolai/core/testing';
import { lastValueFrom, NEVER } from 'rxjs';
import { describe, it } from 'vitest';
import { scrapPage } from './scrap-page';

describe(scrapPage.name, () => {
  it('does not add speaker name to the prompt if not present', async () => {
    const llm = new LlmFake();

    const spy = vi.spyOn(llm, 'prompt').mockImplementation(() => NEVER);

    scrapPage({
      llm,
      page: {
        url: 'https://ng-de.org/speakers/younes-jaaidi/',
        html: 'Something about Younes Jaaidi - NG-DE 2024 ...',
      },
    });

    expect(spy.mock.calls[0][0].prompt[0]).not.toContain(
      'If there are multiple speakers'
    );
  });

  it('adds speaker name to the prompt and remove special characters', async () => {
    const llm = new LlmFake();

    const spy = vi.spyOn(llm, 'prompt').mockImplementation(() => NEVER);

    scrapPage({
      llm,
      page: {
        url: 'https://ng-de.org/speakers/younes-jaaidi/',
        html: 'Something about Younes Jaaidi - NG-DE 2024 ...',
      },
      speakerName: 'Younes "\'Jaaidi',
    });

    expect(spy.mock.calls[0][0].prompt[0]).toContain(
      'focus only on the content related to "Younes Jaaidi"'
    );
  });

  it('converts date-time to date', async () => {
    const llm = new LlmFake();
    llm.setResponses([
      {
        pattern: 'Younes Jaaidi - NG-DE 2024',
        value: {
          activityType: 'talk',
          title: 'Fake it till you Mock it',
          description: `How much do you trust the Mocks, Stubs and Spies you are using in your tests?`,
          online: false,
          city: 'Berlin',
          country: 'Germany',
          date: '2024-10-01T00:00:00Z',
        },
      },
    ]);

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

  it('sets online to false if undefined and country present', async () => {
    const llm = new LlmFake();
    llm.setResponses([
      {
        pattern: 'Younes Jaaidi - NG-DE 2024',
        value: {
          activityType: 'talk',
          title: 'Fake it till you Mock it',
          description: `How much do you trust the Mocks, Stubs and Spies you are using in your tests?`,
          country: 'Germany',
        },
      },
    ]);

    const talk = await lastValueFrom(
      scrapPage({
        llm,
        page: {
          url: 'https://ng-de.org/speakers/younes-jaaidi/',
          html: 'Something about Younes Jaaidi - NG-DE 2024 ...',
        },
      })
    );
    assertIsTalk(talk);
    expect(talk.online).toBe(false);
  });
});

function assertIsTalk(activity: Activity): asserts activity is Talk {
  if (activity.type !== 'talk') {
    throw new Error('Activity is not a talk');
  }
}
