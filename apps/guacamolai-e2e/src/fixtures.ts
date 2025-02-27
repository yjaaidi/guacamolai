import { workspaceRoot } from '@nx/devkit';
import { test as base, chromium, type BrowserContext } from '@playwright/test';
import path from 'path';

const EXTENSION_ID = Symbol('extensionId');

export const test = base.extend<{
  context: BrowserContext;
  goToExtensionPopup: () => Promise<void>;
  [EXTENSION_ID]: string;
}>({
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
    await use(context);
    await context.close();
  },
  goToExtensionPopup: async ({ page, [EXTENSION_ID]: extensionId }) => {
    await page.goto(`chrome-extension://${extensionId}/popup.html`);
  },
  [EXTENSION_ID]: async ({ context }, use) => {
    let [background] = context.serviceWorkers();
    if (!background) {
      background = await context.waitForEvent('serviceworker');
    }

    const extensionId = background.url().split('/')[2];
    await use(extensionId);
  },
});

export const expect = test.expect;
