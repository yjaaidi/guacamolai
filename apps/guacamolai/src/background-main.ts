import {
  BackgroundServer,
  ExtensionStorage,
  HtmlLoader,
  Llm,
  ScrapAction,
} from '@guacamolai/core';
import { ConfigStorage, createLlm, scrapPage } from '@guacamolai/domain';
import {
  BackgroundServerImpl,
  ChromeStorage,
  HtmlLoaderAggregate,
} from '@guacamolai/infra';
import { catchError, map, of, Subject, switchMap } from 'rxjs';

export async function main({
  backgroundServer = new BackgroundServerImpl(),
  extensionStorage = new ChromeStorage(),
  htmlLoader = new HtmlLoaderAggregate(),
  llm,
}: {
  backgroundServer?: BackgroundServer;
  extensionStorage?: ExtensionStorage;
  htmlLoader?: HtmlLoader;
  llm?: Llm;
} = {}) {
  const configStorage = new ConfigStorage(extensionStorage);
  const work$ = new Subject<Work<string, ScrapAction['result']>>();

  work$
    .pipe(
      switchMap(({ payload: url, sendResult }) =>
        htmlLoader.loadHtml(url).pipe(
          switchMap(async (page) => {
            llm ??= await createLlm({ configStorage });

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

  backgroundServer.onAction<ScrapAction>('scrap', async ({ url }) => {
    return new Promise((resolve) => {
      work$.next({
        payload: url,
        sendResult: resolve,
      });
    });
  });
}

interface Work<PAYLOAD, RESULT> {
  payload: PAYLOAD;
  sendResult(result: RESULT): void;
}
