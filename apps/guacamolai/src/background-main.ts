import {
  BackgroundServer,
  HtmlLoader,
  HtmlPage,
  Llm,
  ScrapAction,
} from '@guacamolai/core';
import { createLlm, scrapPage } from '@guacamolai/domain';
import { BackgroundServerImpl, HtmlLoaderChromeTab } from '@guacamolai/infra';
import { map, of, Subject, switchMap } from 'rxjs';

export async function main({
  backgroundServer = new BackgroundServerImpl(),
  htmlLoader = new HtmlLoaderChromeTab(),
  llm,
}: {
  backgroundServer?: BackgroundServer;
  htmlLoader?: HtmlLoader;
  llm?: Llm;
} = {}) {
  const work$ = new Subject<Work<string, HtmlPage>>();

  work$
    .pipe(
      switchMap(({ payload: url, ...work }) =>
        htmlLoader.loadHtml(url).pipe(map((page) => ({ page, ...work })))
      ),
      switchMap(async ({ fakeLlmResponses, page, sendResult }) => {
        llm ??= await createLlm({ fakeLlmResponses });

        if (!llm) {
          console.warn(`Can't set up LLM.`);
        }

        return { llm, page, sendResult };
      }),
      switchMap(({ llm, page, sendResult }) => {
        return (page && llm ? scrapPage({ page, llm }) : of(null)).pipe(
          map((activity) => ({ activity, sendResult }))
        );
      })
    )
    .subscribe(({ activity, sendResult }) => {
      sendResult(activity);
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
