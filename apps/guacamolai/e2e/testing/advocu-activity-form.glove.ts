import { Locator, Page } from '@playwright/test';

export class AdvocuActivityFormGlove {
  title: Locator;
  contentType: Locator;
  description: Locator;
  date: Locator;
  linkToContent: Locator;
  isOnlineCheckbox: Locator;
  isOfflineCheckbox: Locator;
  country: Locator;
  city: Locator;
  #page: Page;

  constructor(page: Page) {
    this.#page = page;
    this.title = this.#page.getByLabel('What was the title', { exact: false });
    this.contentType = this.#page.locator('[id="#/properties/contentType"]');
    this.description = this.#page
      .locator('[id="\\#\\/properties\\/description"]')
      .getByRole('paragraph');
    this.date = this.#page.getByPlaceholder('Select date');
    this.link = this.#page.getByRole('textbox', { exact: false, name: 'Link' });
    this.isOnlineCheckbox = this.#page.getByLabel('Yes');
    this.isOfflineCheckbox = this.#page.getByLabel('No');
    this.country = this.#page.locator('[id="#/properties/country"]');
    this.city = this.#page.locator('[id="#/properties/city"]');
  }
}
