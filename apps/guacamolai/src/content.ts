import { suspensify } from '@jscutlery/operators';
import {
  filter,
  map,
  share,
  Subject,
  switchMap,
  takeUntil,
  withLatestFrom,
} from 'rxjs';
import { KeyStorage } from './lib/domain/key-storage';
import { scrapPage } from './lib/domain/scrap-page';
import { watchEl, watchInputValue } from './lib/infra/dom';
import { Gemini } from './lib/infra/gemini';
import { isValidUrl } from './lib/utils/is-valid-url';
import { fieldIds, updateForm } from './lib/ui/advocu';
import {
  showScrapButton,
  disableScrapButton,
  updateScrapButton,
  applyScrapButtonStyles,
} from './lib/ui/scrap-button';
import { fetchHtmlPage } from './lib/infra/fetch-html-page';

export async function main() {
  const keyStorage = new KeyStorage();
  const key = await keyStorage.getGeminiApiKey();
  if (key == null) {
    return;
  }

  const llm = new Gemini(key);
  const click$ = new Subject<void>();
  const url$ = watchEl<HTMLInputElement>(fieldIds.url).pipe(
    switchMap(watchInputValue),
    share()
  );
  const page$ = url$.pipe(
    filter((url) => url != null),
    filter(isValidUrl),
    switchMap(fetchHtmlPage),
    filter((page) => page != null),
    share()
  );
  const onClick = () => click$.next();

  applyScrapButtonStyles();

  page$.subscribe((page) => {
    if (page != null) {
      showScrapButton({ onClick });
    } else {
      disableScrapButton();
    }
  });

  click$
    .pipe(
      withLatestFrom(page$),
      map(([, page]) => page),
      /* Fetch URL and scrap... */
      switchMap(({ html }) =>
        scrapPage({ html, llm }).pipe(
          suspensify(),
          /* ... and stop if the URL changes. */
          takeUntil(url$)
        )
      )
    )
    .subscribe((suspense) => {
      if (suspense.pending) {
        updateScrapButton('pending');
      }
      if (suspense.hasValue && suspense.value != null) {
        updateScrapButton('enabled');
        updateForm(suspense.value);
      }
      if (suspense.hasError) {
        console.error(suspense.error);
        updateScrapButton('enabled');
      }
    });
}

main();
