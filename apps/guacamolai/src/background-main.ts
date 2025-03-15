import {
  BackgroundServer,
  HtmlLoader,
  Llm,
  ScrapAction,
} from '@guacamolai/core';
import { ConfigStorage, createLlm, scrapPage } from '@guacamolai/domain';
import { BackgroundServerImpl, HtmlLoaderAggregate } from '@guacamolai/infra';
import { catchError, map, of, Subject, switchMap } from 'rxjs';

export async function main({
  backgroundServer = new BackgroundServerImpl(),
  htmlLoader = new HtmlLoaderAggregate(),
  llm,
}: {
  backgroundServer?: BackgroundServer;
  htmlLoader?: HtmlLoader;
  llm?: Llm;
} = {}) {
  const configStorage = new ConfigStorage();
  const work$ = new Subject<Work<string, ScrapAction['result']>>();

  work$
    .pipe(
      switchMap(({ payload: url, fakeLlmResponses, sendResult }) =>
        htmlLoader.loadHtml(url).pipe(
          switchMap(async (page) => {
            llm ??= await createLlm({ fakeLlmResponses });

            const speakerName =
              (await configStorage.getSpeakerName()) ?? undefined;

            return { llm, page, speakerName };
          }),
          switchMap(scrapPage),
          map((activity) => ({ activity, sendResult })),
          catchError((error) => of({ error, sendResult }))
        )
      )
    )
    .subscribe(({ sendResult, ...result }) => {
      if ('error' in result) {
        console.error('Error:', result.error);
      }
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
