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

export function updateForm(talk: Talk) {
  trySetInputValue(document.getElementById(fieldIds.title), talk.title);
  trySetParagraphContent(
    document.getElementById(fieldIds.description)?.querySelector('p') ?? null,
    talk.description
  );
  trySetBooleanValue(document.getElementById(fieldIds.online), talk.online);

  if (talk.country) {
    trySetInputValue(
      document.getElementById(fieldIds.country)?.querySelector('input') ?? null,
      talk.country
    );
  }

  if (talk.city) {
    trySetInputValue(document.getElementById(fieldIds.city), talk.city);
  }
}
