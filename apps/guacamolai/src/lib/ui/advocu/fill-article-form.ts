import { Article } from '../../core/activity';
import { Locator } from '../dom';
import { fieldIds } from './activity-form-locators';
import { fillActivityFormSharedFields } from './fill-activity-form-shared-fields';

export async function fillArticleForm(article: Article) {
  await fillActivityFormSharedFields(article);
  await setContentType('Articles');
}

async function setContentType(contentType: string) {
  await new Locator(() =>
    document.getElementById(fieldIds.contentType)?.querySelector('input')
  ).fill(contentType);
  await new Locator(() =>
    document.querySelector<HTMLElement>(`[title="${contentType}"]`)
  ).click();
}
