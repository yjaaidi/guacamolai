import { screen } from '@testing-library/dom';
import { Talk } from '../core/talk';
import { Locator } from './dom';

export const fieldIds = {
  title: '#/properties/title',
  url: '#/properties/activityUrl',
  description: '#/properties/description',
  online: '#/properties/onlineEvent',
  country: '#/properties/country',
  city: '#/properties/city',
} as const;

export async function fillTalkForm(talk: Talk) {
  const locators = {
    title: new Locator(() => document.getElementById(fieldIds.title)),
    date: new Locator(() => screen.getByPlaceholderText('Select date')),
    description: new Locator(() =>
      document.getElementById(fieldIds.description)?.querySelector('p')
    ),
  };

  await locators.title.fill(talk.title);
  await locators.description.setTextContent(talk.description);

  if (talk.online != null) {
    await setOnline(talk.online);
  }

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

async function setOnline(online: boolean) {
  const label = online ? 'Yes' : 'No';
  const locator = new Locator(() =>
    Array.from(
      document.querySelectorAll<HTMLElement>('nz-radio-group label')
    ).find((el) => el.textContent === label)
  );
  await locator.click();
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
