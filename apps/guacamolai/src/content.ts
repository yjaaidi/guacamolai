import {
  AdvocuActivityForm,
  AdvocuScrapFormFactory,
} from '@guacamolai/advocu-core';
import {
  AdvocuActivityFormImpl,
  AdvocuScrapFormFactoryImpl,
} from '@guacamolai/advocu-ui';
import { BackgroundClient, HtmlLoader, Llm } from '@guacamolai/core';
import { createLlm, scrapPage } from '@guacamolai/domain';
import { BackgroundClientImpl, HtmlLoaderImpl } from '@guacamolai/infra';
import { isValidUrl } from '@guacamolai/shared-util';
import { suspensify } from '@jscutlery/operators';
import { filter, map, of, share, startWith, switchMap } from 'rxjs';

export async function main({
  activityForm = new AdvocuActivityFormImpl(),
  backgroundClient = new BackgroundClientImpl(),
  htmlLoader = new HtmlLoaderImpl(),
  llm,
  scrapFormFactory = new AdvocuScrapFormFactoryImpl(),
}: {
  activityForm?: AdvocuActivityForm;
  backgroundClient?: BackgroundClient;
  htmlLoader?: HtmlLoader;
  llm?: Llm;
  scrapFormFactory?: AdvocuScrapFormFactory;
} = {}) {
  llm ??= await createLlm();

  if (llm == null) {
    return;
  }

  const scrapForm = await scrapFormFactory.create();

  if (!scrapForm) {
    return;
  }

  const page$ = scrapForm.urlChange$.pipe(
    startWith(null),
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
    switchMap((page) => scrapForm.scrapClick$.pipe(map(() => page))),
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
