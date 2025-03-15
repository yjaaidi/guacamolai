import { Locator, Page } from '@playwright/test';

export class AdvocuActivityFormGlove {
  title: Locator;
  contentType: Locator;
  description: Locator;
  date: Locator;
  linkToContent: Locator;
  #page: Page;

  constructor(page: Page) {
    this.#page = page;
    this.title = this.#page.getByLabel('What was the title?');
    this.contentType = this.#page.locator('[id="#/properties/contentType"]');
    this.description = this.#page
      .locator('[id="\\#\\/properties\\/description"]')
      .getByRole('paragraph');
    this.date = this.#page.getByPlaceholder('Select date');
    this.linkToContent = this.#page.getByLabel('Link to Content');
  }
}
