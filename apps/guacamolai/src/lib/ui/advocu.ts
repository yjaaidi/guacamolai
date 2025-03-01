import { screen, waitFor } from '@testing-library/dom';
import { userEvent } from '@testing-library/user-event';
import { Talk } from '../core/talk';
import {
  trySetInputValue,
  trySetParagraphContent,
  trySetBooleanValue,
} from '../infra/dom';

export const fieldIds = {
  title: '#/properties/title',
  url: '#/properties/activityUrl',
  description: '#/properties/description',
  online: '#/properties/onlineEvent',
  country: '#/properties/country',
  city: '#/properties/city',
} as const;

export async function updateForm(talk: Talk) {
  const locators = {
    title: new Locator(() => document.getElementById(fieldIds.title)),
    date: new Locator(() => screen.getByPlaceholderText('Select date')),
    description: new Locator(() =>
      document.getElementById(fieldIds.description)?.querySelector('p')
    ),
  };

  await locators.title.fill(talk.title);
  await locators.description.setTextContent(talk.description);

  trySetBooleanValue(document.getElementById(fieldIds.online), talk.online);

  if (talk.country) {
    await setCountry(talk.country);
  }

  if (talk.city) {
    await setCity(talk.city);
  }

  if (talk.date) {
    await locators.date.fill(talk.date);
  }
}

async function setCountry(country: string) {
  await new Locator(() =>
    document.getElementById(fieldIds.country)?.querySelector('input')
  ).fill(country);
  await new Locator(() =>
    document.querySelector<HTMLElement>(`[title="${country}"]`)
  ).click();
}

async function setCity(city: string) {
  await new Locator(() => document.getElementById(fieldIds.city)).fill(city);
  await new Locator(
    () => screen.getAllByText(city, { selector: '.pac-item span' })[0]
  ).click();
}

class Locator<ELEMENT extends HTMLElement> {
  #locatorFn: LocatorFn<ELEMENT>;

  constructor(locatorFn: LocatorFn<ELEMENT>) {
    this.#locatorFn = locatorFn;
  }

  async click() {
    await waitForElementAndTry(this.#locatorFn, (el) => userEvent.click(el));
  }

  async fill(value: string) {
    await waitForElementAndTry(this.#locatorFn, async (el) => {
      await userEvent.clear(el);
      await userEvent.type(el, value);
    });
  }

  async setTextContent(description: string) {
    await waitForElementAndTry(this.#locatorFn, async (el) => {
      el.textContent = description;
    });
  }
}

interface LocatorFn<ELEMENT> {
  (): ELEMENT | null | undefined;
}

async function waitForElementAndTry<T>(
  getEl: () => T | null | undefined,
  act: (el: T) => Promise<void>
) {
  try {
    const el = await waitFor(() => {
      const el = getEl();
      if (el == null) {
        throw new Error('Element not found');
      }
      return el;
    });
    await act(el);
  } catch {
    return;
  }
}
