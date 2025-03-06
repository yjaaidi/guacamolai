import {
  fillArticleForm,
  fillTalkForm,
  goToActivityForm,
  tryInjectScrapForm,
  updateScrapButton,
} from '@guacamolai/advocu-ui';
import { getLlm, scrapPage } from '@guacamolai/domain';
import { fetchHtmlPage } from '@guacamolai/infra';
import { isValidUrl } from '@guacamolai/shared-util';
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
    switchMap((page) => scrapPage({ page, llm }).pipe(suspensify())),
    share()
  );

  scrap$
    .pipe(
      switchMap(async (suspense) => {
        if (suspense.finalized && suspense.hasValue && suspense.value != null) {
          const activity = suspense.value;
          await goToActivityForm(activity.type);

          /* HACK: for some reason we have to wait a bit here,
           * otherwise, Advocu closes the form. */
          await new Promise((resolve) => setTimeout(resolve, 500));

          switch (activity.type) {
            case 'article':
              await fillArticleForm(activity);
              break;
            case 'talk':
              await fillTalkForm(activity);
              break;
          }
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
