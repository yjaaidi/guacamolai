import { describe, it } from 'vitest';
import {
  AdvocuActivityFormFake,
  AdvocuScrapFormFactoryFake,
} from '@guacamolai/advocu-core/testing';
import { main } from './content';
import { LlmFake } from '@guacamolai/core/testing';

describe('GuacamolAI', () => {
  it.todo('updates the form with scrapped URL');
});

function setUp() {
  const activityForm = new AdvocuActivityFormFake();
  const scrapFormFactory = new AdvocuScrapFormFactoryFake();
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

  return {
    activityForm,
    fillAndSubmitForm(url: string) {
      if (!scrapFormFactory.form) {
        throw new Error('Scrap form not initialized');
      }

      scrapFormFactory.form.fillAndSubmitForm(url);
    },
    async runContent() {
      await main({ activityForm, scrapFormFactory, llm });
    },
  };
}
