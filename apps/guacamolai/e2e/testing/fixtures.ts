import { workspaceRoot } from '@nx/devkit';
import { test as base, chromium, type BrowserContext } from '@playwright/test';
import path from 'path';
import { authFilePath } from './auth-user';
import { readFile } from 'fs/promises';

export interface Fixtures {
  context: BrowserContext;
  goToExtensionPopup: () => Promise<void>;
  setUpApiKey: () => Promise<void>;
  _extensionId: string;
}

export interface Options {
  geminiApiKey: string | null;
}

export const test = base.extend<Fixtures & Options>({
  // eslint-disable-next-line no-empty-pattern
  context: async ({}, use) => {
    const pathToExtension = path.join(workspaceRoot, 'apps/guacamolai/dist');
    const context = await chromium.launchPersistentContext('', {
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
    use(async () => {
      await page.goto(`chrome-extension://${_extensionId}/popup.html`);
    });
  },
  setUpApiKey: async ({ goToExtensionPopup, geminiApiKey, page }, use) => {
    use(async () => {
      if (!geminiApiKey) {
        throw new Error('geminiApiKey is required');
      }

      await goToExtensionPopup();
      await page.fill('input', geminiApiKey);
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
