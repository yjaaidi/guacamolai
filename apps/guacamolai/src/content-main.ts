import {
  AdvocuActivityForm,
  AdvocuScrapFormFactory,
} from '@guacamolai/advocu-core';
import {
  AdvocuActivityFormImpl,
  AdvocuScrapFormFactoryImpl,
} from '@guacamolai/advocu-ui';
import { BackgroundClient, HtmlLoader, ScrapAction } from '@guacamolai/core';
import { LLM_FAKE_STORAGE_KEY } from '@guacamolai/domain';
import {
  BackgroundClientImpl,
  tryReadLocalStorageJson,
} from '@guacamolai/infra';
import { isValidUrl } from '@guacamolai/shared-util';
import { suspensify } from '@jscutlery/operators';
import { filter, from, map, share, startWith, switchMap } from 'rxjs';

export async function main({
  activityForm = new AdvocuActivityFormImpl(),
  backgroundClient = new BackgroundClientImpl(),
  scrapFormFactory = new AdvocuScrapFormFactoryImpl(),
}: {
  activityForm?: AdvocuActivityForm;
  backgroundClient?: BackgroundClient;
  htmlLoader?: HtmlLoader;
  scrapFormFactory?: AdvocuScrapFormFactory;
} = {}) {
  /* We use the local storage to set up the fake LLM in Playwright. */
  const fakeLlmResponses =
    tryReadLocalStorageJson<Record<string, unknown>>(LLM_FAKE_STORAGE_KEY);

  const scrapForm = await scrapFormFactory.create();

  if (!scrapForm) {
    return;
  }

  const url$ = scrapForm.urlChange$.pipe(
    startWith(null),
    map((url) => (url != null && isValidUrl(url) ? url : null)),
    share()
  );

  /* Enable/disable scrap button depending on whether the URL is valid or not. */
  url$.subscribe((url) =>
    scrapForm.updateScrapButton(url != null ? 'enabled' : 'disabled')
  );

  const scrap$ = url$.pipe(
    filter((url) => url != null),
    switchMap((url) => scrapForm.scrapSubmit$.pipe(map(() => url))),
    switchMap((url) =>
      from(
        backgroundClient.sendAction<ScrapAction>('scrap', {
          url,
          fakeLlmResponses: fakeLlmResponses ?? undefined,
        })
      ).pipe(suspensify())
    ),
    share()
  );

  scrap$
    .pipe(
      switchMap(async (suspense) => {
        if (suspense.finalized && suspense.hasValue && suspense.value != null) {
          const result = suspense.value;
          if ('error' in result) {
            console.error(result.error);
          } else {
            activityForm.fillActivityForm(result.activity);
          }
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
