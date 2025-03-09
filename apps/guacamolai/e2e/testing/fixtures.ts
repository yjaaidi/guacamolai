import { LLM_FAKE_STORAGE_KEY } from '@guacamolai/domain/testing';
import { workspaceRoot } from '@nx/devkit';
import { test as base, chromium, type BrowserContext } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { authFilePath } from './auth-user';
import { ScrapFormGlove } from './scrap-form.glove';
import { ACTIVITIES_URL } from './urls';

export interface Fixtures {
  context: BrowserContext;
  goToExtensionPopup: () => Promise<void>;
  scrapFormGlove: ScrapFormGlove;
  setUpGeminiApiKey: () => Promise<void>;
  setUpLlmFake: (
    responses: Record<string, Record<string, unknown>>
  ) => Promise<void>;
  _extensionId: string;
}

export interface Options {
  geminiApiKey: string | null;
}

export const test = base.extend<Fixtures & Options>({
  context: async ({}, use) => {
    const pathToExtension = path.join(workspaceRoot, 'apps/guacamolai/dist');
    const context = await chromium.launchPersistentContext('', {
      channel: 'chromium',
      headless: false,
      args: [
        `--disable-extensions-except=${pathToExtension}`,
        `--load-extension=${pathToExtension}`,
      ],
    });
    const { cookies } = JSON.parse(await readFile(authFilePath, 'utf-8'));
    context.addCookies(cookies);
    await use(context);
    await context.close();
  },
  goToExtensionPopup: async ({ page, _extensionId }, use) => {
    await use(async () => {
      await page.goto(`chrome-extension://${_extensionId}/popup.html`);
    });
  },
  scrapFormGlove: async ({ page }, use) => {
    await use(new ScrapFormGlove(page));
  },
  setUpGeminiApiKey: async (
    { goToExtensionPopup, geminiApiKey, page },
    use
  ) => {
    await use(async () => {
      if (!geminiApiKey) {
        throw new Error('geminiApiKey is required');
      }

      await goToExtensionPopup();
      await page.fill('input', geminiApiKey);
    });
  },
  setUpLlmFake: async ({ page }, use) => {
    await use(async (responses) => {
      await page.goto(ACTIVITIES_URL);
      await page.evaluate(
        ({ LLM_FAKE_STORAGE_KEY, responses }) =>
          localStorage.setItem(LLM_FAKE_STORAGE_KEY, JSON.stringify(responses)),
        { LLM_FAKE_STORAGE_KEY, responses }
      );
    });
  },
  geminiApiKey: [null, { option: true }],
  _extensionId: async ({ context }, use) => {
    let [background] = context.serviceWorkers();
    if (!background) {
      background = await context.waitForEvent('serviceworker');
    }

    const extensionId = background.url().split('/')[2];
    await use(extensionId);
  },
});

export const expect = test.expect;
