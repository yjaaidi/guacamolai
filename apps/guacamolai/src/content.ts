import { fromEvent, map, Observable, of, switchMap } from 'rxjs';
import { Gemini } from './lib/infra/gemini';
import { isValidUrl } from './lib/utils/is-valid-url';
import { scrapPage } from './lib/domain/scrap-page';
import { fromFetch } from 'rxjs/fetch';

async function main() {
  const llm = new Gemini('TODO');

  watchUrlInputEl()
    .pipe(
      switchMap(watchInputValue),
      switchMap(loadUrl),
      switchMap((html) => scrapPage({ llm, html }))
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

export interface Talk {
  title: string;
  description: string;
}

main();
