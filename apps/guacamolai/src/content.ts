import { suspensify } from '@jscutlery/operators';
import { filter, map, of, share, startWith, Subject, switchMap } from 'rxjs';
import { getLlm } from './lib/domain/get-llm';
import { scrapHtml } from './lib/domain/scrap-html';
import { watchEl, watchInputValue } from './lib/infra/dom';
import { fetchHtmlPage } from './lib/infra/fetch-html-page';
import { fieldIds, updateForm } from './lib/ui/advocu';
import { tryInjectScrapButton, updateScrapButton } from './lib/ui/scrap-button';
import { isValidUrl } from './lib/utils/is-valid-url';

export async function main() {
  const llm = await getLlm();
  if (llm == null) {
    return;
  }

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

  const scrap$ = page$.pipe(
    filter((page) => page != null),
    switchMap((page) => click$.pipe(map(() => page))),
    switchMap((page) => scrapHtml({ html: page.html, llm }).pipe(suspensify())),
    share()
  );

  scrap$
    .pipe(
      switchMap(async (suspense) => {
        if (suspense.finalized && suspense.hasValue && suspense.value != null) {
          await updateForm(suspense.value);
        }
      })
    )
    .subscribe();

  scrap$.subscribe((suspense) => {
    if (suspense.pending) {
      updateScrapButton('pending');
    }

    if (suspense.hasValue) {
      updateScrapButton('enabled');
    }

    if (suspense.hasError) {
      console.error(suspense.error);
      updateScrapButton('enabled');
    }
  });
}

main();
