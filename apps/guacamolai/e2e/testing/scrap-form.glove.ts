import { Locator, Page } from '@playwright/test';

export class ScrapFormGlove {
  #page: Page;
  scrapButton: Locator;

  constructor(page: Page) {
    this.#page = page;
    this.scrapButton = this.#page.getByRole('button', { name: 'Scrap' });
  }

  async fillAndSubmit(url: string) {
    await this.fill(url);
    await this.scrapButton.click();
  }

  async fill(url: string): Promise<void> {
    await this.#page.getByPlaceholder('URL to scrap').fill(url);
  }
}
