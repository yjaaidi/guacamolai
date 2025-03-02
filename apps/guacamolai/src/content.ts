import { suspensify } from '@jscutlery/operators';
import {
  BehaviorSubject,
  filter,
  map,
  of,
  share,
  startWith,
  Subject,
  switchMap,
} from 'rxjs';
import { getLlm } from './lib/domain/get-llm';
import { scrapHtml } from './lib/domain/scrap-html';
import { fetchHtmlPage } from './lib/infra/fetch-html-page';
import { fillTalkForm } from './lib/ui/fill-talk-form';
import { goToActivityForm } from './lib/ui/go-to-activity-form';
import { tryInjectScrapForm, updateScrapButton } from './lib/ui/scrap-form';
import { isValidUrl } from './lib/utils/is-valid-url';

export async function main() {
  const llm = await getLlm();
  if (llm == null) {
    return;
  }
  const click$ = new Subject<void>();
  const url$ = new BehaviorSubject<string | null>(null);

  await tryInjectScrapForm({
    onClick: () => click$.next(),
    onUrlChange: (url) => url$.next(url),
  });

  const page$ = url$.pipe(
    switchMap((url) => {
      if (url != null && isValidUrl(url)) {
        return fetchHtmlPage(url).pipe(startWith(null));
      }
      return of(null);
    }),
    share()
  );

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
          await goToActivityForm();
          await new Promise((resolve) => setTimeout(resolve, 500));
          await fillTalkForm(suspense.value);
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
