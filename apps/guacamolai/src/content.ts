import { fromEvent, map, Observable, of, switchMap } from 'rxjs';
import { Gemini } from './lib/infra/gemini';
import { isValidUrl } from './lib/utils/is-valid-url';
import { scrapUrl } from './lib/domain/scrap-url';

async function main() {
  const llm = new Gemini('TODO');

  watchUrlInputEl()
    .pipe(
      switchMap((el) => {
        if (!el) {
          return of(null);
        }

        return fromEvent(el, 'input').pipe(
          map(() => {
            const url = el.value.trim();
            return isValidUrl(url) ? url : null;
          })
        );
      }),
      switchMap((url) => scrapUrl({ llm, url }))
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

const fieldIds = {
  url: '#/properties/activityUrl',
} as const;

export interface Talk {
  title: string;
  description: string;
}

main();
