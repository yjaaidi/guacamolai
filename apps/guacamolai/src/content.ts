import {
  AdvocuActivityForm,
  AdvocuScrapFormFactory,
} from '@guacamolai/advocu-core';
import {
  AdvocuActivityFormImpl,
  AdvocuScrapFormFactoryImpl,
} from '@guacamolai/advocu-ui';
import { HtmlLoader, Llm } from '@guacamolai/core';
import { createLlm, scrapPage } from '@guacamolai/domain';
import { HtmlLoaderImpl } from '@guacamolai/infra';
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

export async function main({
  activityForm = new AdvocuActivityFormImpl(),
  htmlLoader = new HtmlLoaderImpl(),
  llm,
  scrapFormFactory = new AdvocuScrapFormFactoryImpl(),
}: {
  activityForm?: AdvocuActivityForm;
  htmlLoader?: HtmlLoader;
  llm?: Llm;
  scrapFormFactory?: AdvocuScrapFormFactory;
} = {}) {
  llm ??= await createLlm();

  if (llm == null) {
    return;
  }

  const click$ = new Subject<void>();
  const url$ = new BehaviorSubject<string | null>(null);
  const scrapForm = await scrapFormFactory.create();

  if (!scrapForm) {
    return;
  }

  const page$ = url$.pipe(
    switchMap((url) => {
      if (url != null && isValidUrl(url)) {
        return htmlLoader.loadHtml(url).pipe(startWith(null));
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
