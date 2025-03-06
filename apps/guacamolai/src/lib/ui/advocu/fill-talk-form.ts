import { Talk } from '@guacamolai/core';
import { screen } from '@testing-library/dom';
import { Locator } from '../dom';
import { fieldIds } from './activity-form-locators';
import { fillActivityFormSharedFields } from './fill-activity-form-shared-fields';

export async function fillTalkForm(talk: Talk) {
  await fillActivityFormSharedFields(talk);

  if (talk.online != null) {
    await setOnline(talk.online);
  }

  if (talk.country) {
    await setCountry(talk.country);
  }

  if (talk.city) {
    await setCity(talk.city);
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
