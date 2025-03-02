import { screen } from '@testing-library/dom';
import { Talk } from '../core/activity';
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
    url: new Locator(() => document.getElementById(fieldIds.url)),
  };

  await locators.title.fill(talk.title);
  await locators.description.setTextContent(talk.description);
  await locators.url.fill(talk.url);

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
  await new Locator(() => screen.getByText(online ? 'Yes' : 'No')).click();
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
