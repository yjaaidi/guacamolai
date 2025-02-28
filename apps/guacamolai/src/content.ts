import { filter, Observable, of, switchMap } from 'rxjs';
import { fromFetch } from 'rxjs/fetch';
import { KeyStorage } from './lib/domain/key-storage';
import { scrapPage } from './lib/domain/scrap-page';
import { Gemini } from './lib/infra/gemini';
import {
  trySetInputValue,
  trySetParagraphContent,
  trySetBooleanValue,
  watchInputValue,
  watchUrlInputEl,
} from './lib/infra/dom';

export async function main() {
  const keyStorage = new KeyStorage();

  watchUrlInputEl()
    .pipe(
      switchMap(watchInputValue),
      switchMap(loadUrl),
      switchMap(async (html) => {
        const key = await keyStorage.getGeminiApiKey();
        return key != null ? { llm: new Gemini(key), html } : null;
      }),
      switchMap((args) => (args != null ? scrapPage(args) : of(null))),
      filter((talk) => talk != null)
    )
    .subscribe((talk) => {
      trySetInputValue(document.getElementById(fieldIds.title), talk.title);
      trySetParagraphContent(
        document.getElementById(fieldIds.description),
        talk.description
      );
      trySetBooleanValue(document.getElementById(fieldIds.online), talk.online);
      if (talk.country) {
        trySetInputValue(
          document.getElementById(fieldIds.country)?.querySelector('input') ??
            null,
          talk.country
        );
      }
      if (talk.city) {
        trySetInputValue(document.getElementById(fieldIds.city), talk.city);
      }
    });
}

export const fieldIds = {
  title: '#/properties/title',
  url: '#/properties/activityUrl',
  description: '#/properties/description',
  online: '#/properties/onlineEvent',
  country: '#/properties/country',
  city: '#/properties/city',
} as const;

function loadUrl(url: string | null): Observable<string | null> {
  if (!url) {
    return of(null);
  }

  return fromFetch(`https://corsproxy.io/?url=${encodeURIComponent(url)}`).pipe(
    switchMap((response) => (response.ok ? response.text() : of(null)))
  );
}

main();
