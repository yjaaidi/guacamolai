import { describe, it } from 'vitest';
import {
  AdvocuActivityFormFake,
  AdvocuScrapFormFactoryFake,
} from '@guacamolai/advocu-core/testing';
import { main } from './content';
import { HtmlLoaderFake, LlmFake } from '@guacamolai/core/testing';
import { createHtmlPage } from '@guacamolai/core';

describe('GuacamolAI', () => {
  it('updates the form with scrapped URL', async () => {
    const { activityForm, fillAndSubmitForm } = await setUpAndRun();

    fillAndSubmitForm('https://ng-de.org/speakers/younes-jaaidi/');

    await expect
      .poll(() => activityForm.activity?.title)
      .toBe('Fake it till you Mock it');
  });
});

async function setUpAndRun() {
  const { runContent, ...utils } = setUp();
  await runContent();
  return utils;
}

function setUp() {
  const activityForm = new AdvocuActivityFormFake();
  const scrapFormFactory = new AdvocuScrapFormFactoryFake();
  const htmlLoader = new HtmlLoaderFake();
  const llm = new LlmFake();

  htmlLoader.setPages([
    createHtmlPage({
      url: 'https://ng-de.org/speakers/younes-jaaidi/',
      html: '<html><head><title>Something about Younes Jaaidi - NG-DE 2024 ...</title></head></html>',
    }),
  ]);

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
      await main({ activityForm, scrapFormFactory, htmlLoader, llm });
    },
  };
}
