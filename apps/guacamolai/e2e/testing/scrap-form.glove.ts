import { expect, type Locator, type Page } from '@playwright/test';

export class ScrapFormGlove {
  scrapButton: Locator;
  #page: Page;
  #urlInputLocator: Locator;

  constructor(page: Page) {
    this.#page = page;
    this.scrapButton = this.#page.getByRole('button', { name: 'Scrap' });
    this.#urlInputLocator = this.#page.getByPlaceholder('URL to scrap');
  }

  async fillAndSubmit(url: string) {
    await this.waitForUrlInput();
    await this.fill(url);
    await this.scrapButton.click();
  }

  async fill(url: string): Promise<void> {
    await this.#urlInputLocator.fill(url);
  }

  /**
   * This method waits for the URL input to be visible.
   *
   * For some reason, the URL input is not always visible when the page is loaded.
   * This seems to only happen on the CI.
   * Maybe the page is loaded before the extension is fully loaded or something like that.
   */
  async waitForUrlInput() {
    await expect
      .poll(
        async () => {
          try {
            await this.#urlInputLocator.waitFor({
              state: 'visible',
              timeout: 5_000,
            });
            return true;
          } catch {
            await this.#page.reload();
            return false;
          }
        },
        {
          timeout: 30_000,
          message: 'URL input is not visible',
        }
      )
      .toBe(true);
  }
}
