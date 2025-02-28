import { fromEvent, map, Observable, of, switchMap } from 'rxjs';
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
      switchMap((args) => (args != null ? scrapPage(args) : of(null)))
    )
    .subscribe(console.log);
}

function watchUrlInputEl(): Observable<HTMLInputElement | null> {
  return new Observable((observer) => {
    const mutationObserver = new MutationObserver(() => {
      const el = document.getElementById(fieldIds.url);
      observer.next(el instanceof HTMLInputElement ? el : null);
    });

    mutationObserver.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => mutationObserver.disconnect();
  });
}

function watchInputValue(
  el: HTMLInputElement | null
): Observable<string | null> {
  if (!el) {
    return of(null);
  }

  return fromEvent(el, 'input').pipe(
    map(() => {
      const url = el.value.trim();
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

const fieldIds = {
  url: '#/properties/activityUrl',
} as const;

main();
