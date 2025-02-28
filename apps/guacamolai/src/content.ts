import { fromEvent, map, Observable, of, switchMap } from 'rxjs';
import {
  SCRAP_ACTION,
  ScrapMessage,
  ScrapResponse,
} from './lib/core/extension-messages';
import { isValidUrl } from './lib/utils/is-valid-url';

async function main() {
  watchUrlInputEl()
    .pipe(switchMap(watchInputValue), switchMap(scrap))
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

async function scrap(url: string | null): Promise<ScrapResponse | null> {
  if (!url) {
    return null;
  }

  return await chrome.runtime.sendMessage<ScrapMessage, ScrapResponse>({
    action: SCRAP_ACTION,
    data: url,
  });
}

const fieldIds = {
  url: '#/properties/activityUrl',
} as const;

main();
