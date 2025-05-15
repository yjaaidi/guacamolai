import type { Locator, Page } from '@playwright/test';

export class AdvocuActivitiesPage {
  #page: Page;

  constructor(page: Page) {
    this.#page = page;
  }

  get activityForm() {
    return new AdvocuActivityFormGlove(this.#page);
  }

  async goto() {
    await this.#page.addLocatorHandler(
      this.#page.getByRole('button', { name: 'Close Stonly widget' }),
      (el) => el.click()
    );

    await this.#page.goto('/activities');
  }

  async waitForMyActivities() {
    await this.#page.getByRole('heading', { name: 'My Activities' }).waitFor({
      state: 'visible',
      timeout: 10_000,
    });
  }
}

export class AdvocuActivityFormGlove {
  title: Locator;
  contentType: Locator;
  description: Locator;
  date: Locator;
  link: Locator;
  eventFormat: Locator;
  country: Locator;
  city: Locator;
  #page: Page;

  constructor(page: Page) {
    this.#page = page;
    this.title = this.#page.getByLabel('What was the title', { exact: false });
    this.contentType = this.#page.locator('[id="#/properties/contentType"]');
    this.description = this.#page
      .locator('[id="#/properties/description"]')
      .getByRole('paragraph');
    this.date = this.#page.getByPlaceholder('Select date');
    this.link = this.#page.getByRole('textbox', { exact: false, name: 'Link' });
    this.eventFormat = this.#page.locator('[id="#/properties/eventFormat"]');
    this.country = this.#page.locator('[id="#/properties/country"]');
    this.city = this.#page.locator('[id="#/properties/city"]');
  }
}
