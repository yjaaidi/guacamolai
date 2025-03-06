import { AdvocuActivityForm, AdvocuScrapForm } from '@guacamolai/advocu-ui';
import { createLlm, scrapPage } from '@guacamolai/domain';
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
import { Llm } from '@guacamolai/core';

export async function main({ llm }: { llm?: Llm } = {}) {
  llm ??= await createLlm();

  if (llm == null) {
    return;
  }

  const click$ = new Subject<void>();
  const url$ = new BehaviorSubject<string | null>(null);
  const activityForm = new AdvocuActivityForm();
  const scrapForm = new AdvocuScrapForm({
    onScrapClick: () => click$.next(),
    onUrlChange: (url) => url$.next(url),
  });
  await scrapForm.inject();

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
    scrapForm.updateScrapButton(page != null ? 'enabled' : 'disabled')
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
          activityForm.fillActivityForm(activity);
        }
      })
    )
    .subscribe();

  scrap$.subscribe((suspense) => {
    if (suspense.pending) {
      scrapForm.updateScrapButton('pending');
    }

    if (suspense.hasValue) {
      scrapForm.updateScrapButton('enabled');
    }

    if (suspense.hasError) {
      console.error(suspense.error);
      scrapForm.updateScrapButton('enabled');
    }
  });
}

main();
