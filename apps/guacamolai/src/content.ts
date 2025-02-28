import { suspensify } from '@jscutlery/operators';
import { filter, map, of, share, startWith, Subject, switchMap } from 'rxjs';
import { KeyStorage } from './lib/domain/key-storage';
import { scrapPage } from './lib/domain/scrap-page';
import { watchEl, watchInputValue } from './lib/infra/dom';
import { fetchHtmlPage } from './lib/infra/fetch-html-page';
import { Gemini } from './lib/infra/gemini';
import { fieldIds, updateForm } from './lib/ui/advocu';
import { tryInjectScrapButton, updateScrapButton } from './lib/ui/scrap-button';
import { isValidUrl } from './lib/utils/is-valid-url';

export async function main() {
  const keyStorage = new KeyStorage();
  const key = await keyStorage.getGeminiApiKey();
  if (key == null) {
    return;
  }

  const llm = new Gemini(key);
  const click$ = new Subject<void>();

  const urlInput$ = watchEl<HTMLInputElement>(fieldIds.url).pipe(share());

  const url$ = urlInput$.pipe(switchMap(watchInputValue), share());

  const page$ = url$.pipe(
    switchMap((url) => {
      if (url != null && isValidUrl(url)) {
        return fetchHtmlPage(url).pipe(startWith(null));
      }
      return of(null);
    }),
    share()
  );
  const onClick = () => click$.next();

  /* Show scrap button when url input is detected. */
  urlInput$.subscribe(() => tryInjectScrapButton({ onClick }));

  /* Enable/disable scrap button depending on whether we have the HTML or not. */
  page$.subscribe((page) =>
    updateScrapButton(page != null ? 'enabled' : 'disabled')
  );

  page$
    .pipe(
      filter((page) => page != null),
      switchMap((page) => click$.pipe(map(() => page))),
      switchMap((page) =>
        scrapPage({ html: page.html, llm }).pipe(suspensify())
      )
    )
    .subscribe((suspense) => {
      if (suspense.pending) {
        updateScrapButton('pending');
      }

      if (suspense.hasValue) {
        if (suspense.value != null) {
          updateForm(suspense.value);
        }
        updateScrapButton('enabled');
      }

      if (suspense.hasError) {
        console.error(suspense.error);
        updateScrapButton('enabled');
      }
    });
}

main();
