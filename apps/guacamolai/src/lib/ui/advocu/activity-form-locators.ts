import { screen } from '@testing-library/dom';
import { Locator } from '@guacamolai/shared-ui/dom';

export const activityFormLocators = {
  contentType: new Locator(() => document.getElementById(fieldIds.contentType)),
  title: new Locator(() => document.getElementById(fieldIds.title)),
  date: new Locator(() => screen.getByPlaceholderText('Select date')),
  description: new Locator(() =>
    document.getElementById(fieldIds.description)?.querySelector('p')
  ),
  url: new Locator(() => document.getElementById(fieldIds.url)),
};

export const fieldIds = {
  contentType: '#/properties/contentType',
  title: '#/properties/title',
  url: '#/properties/activityUrl',
  description: '#/properties/description',
  online: '#/properties/onlineEvent',
  country: '#/properties/country',
  city: '#/properties/city',
} as const;
