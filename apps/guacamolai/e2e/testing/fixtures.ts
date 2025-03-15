import { LLM_FAKE_RESPONSES_KEY } from '@guacamolai/domain';
import { workspaceRoot } from '@nx/devkit';
import { test as base, chromium, type BrowserContext } from '@playwright/test';
import { mkdtemp, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { AdvocuActivitiesPage } from './advocu-activity.page';
import { authFilePath } from './auth-user';
import { ScrapFormGlove } from './scrap-form.glove';

export interface Fixtures {
  advocuActivitiesPage: AdvocuActivitiesPage;
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
  advocuActivitiesPage: async ({ page }, use) => {
    await use(new AdvocuActivitiesPage(page));
  },
  context: async ({}, use) => {
    const pathToExtension = join(workspaceRoot, 'apps/guacamolai/dist');
    const userDataDir = await mkdtemp(
      join(tmpdir(), 'guacamolai-chromium-user-data-dir-')
    );
    const context = await chromium.launchPersistentContext(userDataDir, {
      channel: 'chromium',
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

      await page.getByPlaceholder('Gemini API key').fill(geminiApiKey);
    });
  },
  setUpLlmFake: async ({ goToExtensionPopup, page }, use) => {
    await use(async (responses) => {
      await goToExtensionPopup();

      await page.evaluate(
        ({ LLM_FAKE_RESPONSES_KEY, responses }) =>
          chrome.storage.local.set({
            [LLM_FAKE_RESPONSES_KEY]: JSON.stringify(responses),
          }),
        { LLM_FAKE_RESPONSES_KEY, responses }
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
