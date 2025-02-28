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
  trySetInputValue(document.getElementById(fieldIds.title), talk.title);
  trySetParagraphContent(
    document.getElementById(fieldIds.description)?.querySelector('p') ?? null,
    talk.description
  );
  trySetBooleanValue(document.getElementById(fieldIds.online), talk.online);

  if (talk.country) {
    await setCountry(talk.country);
  }

  if (talk.city) {
    await setCity(talk.city);
  }
}

async function setCountry(country: string) {
  await waitForElementAndTry<HTMLInputElement>(
    () => document.getElementById(fieldIds.country)?.querySelector('input'),
    (el) => userEvent.type(el, country)
  );

  await waitForElementAndTry(
    () => document.querySelector<HTMLElement>(`[title="${country}"]`),
    (el) => userEvent.click(el)
  );
}

async function setCity(city: string) {
  await waitForElementAndTry<HTMLElement>(
    () => document.getElementById(fieldIds.city),
    (el) => fill(el, city)
  );

  await waitForElementAndTry(
    () => screen.getAllByText(city, { selector: '.pac-item span' })[0],
    (el) => userEvent.click(el)
  );
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

async function fill(el: HTMLElement, value: string) {
  await userEvent.clear(el);
  await userEvent.type(el, value);
}
