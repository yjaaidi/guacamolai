import {
  debounceTime,
  filter,
  fromEvent,
  map,
  Observable,
  of,
  startWith,
  switchMap,
} from 'rxjs';
import { fromFetch } from 'rxjs/fetch';
import { KeyStorage } from './lib/domain/key-storage';
import { scrapPage } from './lib/domain/scrap-page';
import { Gemini } from './lib/infra/gemini';
import { isValidUrl } from './lib/utils/is-valid-url';

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
      trySetInputValue(fieldIds.title, talk.title);
      trySetParagraphContent(fieldIds.description, talk.description);
      trySetBooleanValue(fieldIds.online, talk.online);
    });
}

const fieldIds = {
  title: '#/properties/title',
  url: '#/properties/activityUrl',
  description: '#/properties/description',
  online: '#/properties/onlineEvent',
} as const;

function watchUrlInputEl(): Observable<HTMLInputElement | null> {
  return new Observable<HTMLInputElement | null>((observer) => {
    const mutationObserver = new MutationObserver(() => {
      const el = document.getElementById(fieldIds.url);
      observer.next(el != null ? (el as HTMLInputElement) : null);
    });

    mutationObserver.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => mutationObserver.disconnect();
  }).pipe(debounceTime(50));
}

function watchInputValue(
  el: HTMLInputElement | null
): Observable<string | null> {
  if (!el) {
    return of(null);
  }

  return fromEvent(el, 'input').pipe(
    startWith(getInputValue(el)),
    map(() => {
      const url = getInputValue(el);
      return isValidUrl(url) ? url : null;
    })
  );
}

function loadUrl(url: string | null): Observable<string | null> {
  if (!url) {
    return of(null);
  }

  return fromFetch(`https://corsproxy.io/?url=${encodeURIComponent(url)}`).pipe(
    switchMap((response) => (response.ok ? response.text() : of(null)))
  );
}

function trySetInputValue(id: string, value: string) {
  const el = document.getElementById(id);
  if (!(el instanceof HTMLInputElement)) {
    return;
  }
  el.value = value;
}

function trySetParagraphContent(id: string, content: string) {
  const el = document.getElementById(id);
  if (!el) {
    return;
  }
  el.textContent = content;
}

function trySetBooleanValue(id: string, value: boolean | undefined) {
  const el = document.getElementById(id);
  const spanEls = Array.from(el?.querySelectorAll('span') ?? []);
  const yesEl = spanEls.find((spanEl) => compareText(spanEl, 'yes'));
  const noEl = spanEls.find((spanEl) => compareText(spanEl, 'no'));
  if (!yesEl || !noEl) {
    return;
  }

  switch (value) {
    case true:
      yesEl.click();
      break;
    case false:
      noEl.click();
      break;
  }
}

function compareText(el: HTMLElement, text: string): boolean {
  return el.textContent?.trim().toLocaleLowerCase() === text;
}

function getInputValue(el: HTMLInputElement): string {
  return el.value.trim();
}

main();
