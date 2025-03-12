import {
  BackgroundServer,
  HtmlLoader,
  Llm,
  ScrapAction
} from '@guacamolai/core';
import { createLlm, scrapPage } from '@guacamolai/domain';
import { BackgroundServerImpl, HtmlLoaderChromeTab } from '@guacamolai/infra';
import { catchError, map, of, Subject, switchMap } from 'rxjs';

export async function main({
  backgroundServer = new BackgroundServerImpl(),
  htmlLoader = new HtmlLoaderChromeTab(),
  llm,
}: {
  backgroundServer?: BackgroundServer;
  htmlLoader?: HtmlLoader;
  llm?: Llm;
} = {}) {
  const work$ = new Subject<Work<string, ScrapAction['result']>>();

  work$
    .pipe(
      switchMap(({ payload: url, fakeLlmResponses, sendResult }) =>
        htmlLoader.loadHtml(url).pipe(
          switchMap(async (page) => {
            if (!page) {
              throw new Error(`Can't load the page.`);
            }

            llm ??= await createLlm({ fakeLlmResponses });

            if (!llm) {
              throw new Error(`Can't set up LLM.`);
            }

            return { llm, page };
          }),
          switchMap(scrapPage),
          map((activity) => {
            if (!activity) {
              throw new Error(`Can't scrap the page.`);
            }
            return { activity, sendResult };
          }),
          catchError((error) => of({ error, sendResult }))
        )
      )
    )
    .subscribe(({ sendResult, ...result }) => {
      sendResult(result);
    });

  backgroundServer.onAction<ScrapAction>(
    'scrap',
    async ({ url, fakeLlmResponses }) => {
      return new Promise((resolve) => {
        work$.next({
          fakeLlmResponses,
          payload: url,
          sendResult: resolve,
        });
      });
    }
  );
}

interface Work<PAYLOAD, RESULT> {
  fakeLlmResponses?: Record<string, unknown>;
  payload: PAYLOAD;
  sendResult(result: RESULT): void;
}
