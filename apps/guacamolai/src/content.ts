import { suspensify } from '@jscutlery/operators';
import {
  BehaviorSubject,
  defer,
  filter,
  from,
  map,
  Observable,
  of,
  share,
  startWith,
  Subject,
  switchMap,
  tap,
} from 'rxjs';
import { getLlm } from './lib/domain/get-llm';
import { scrapPage as scrapPage } from './lib/domain/scrap-page';
import { fetchHtmlPage } from './lib/infra/fetch-html-page';
import { fillTalkForm } from './lib/ui/advocu/fill-talk-form';
import { goToActivityForm } from './lib/ui/advocu/go-to-activity-form';
import {
  tryInjectScrapForm,
  updateScrapButton,
} from './lib/ui/advocu/scrap-form';
import { isValidUrl } from './lib/utils/is-valid-url';
import { fillArticleForm } from './lib/ui/advocu/fill-article-form';

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

  const scrap$ = url$.pipe(
    switchMap((url) => click$.pipe(map(() => url))),
    switchMap((url) => {
      return defer(() => {
        if (url != null && isValidUrl(url)) {
          return from(chrome.runtime.sendMessage(url)).pipe(startWith(null));
        }
        return of(null);
      }).pipe(suspensify());
    }),
    share()
  );

  scrap$
    .pipe(
      switchMap(async (suspense) => {
        updateScrapButton(suspense.pending ? 'disabled' : 'enabled');

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
