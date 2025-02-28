import {
  filter,
  fromEventPattern,
  map,
  Observable,
  of,
  switchMap,
  withLatestFrom,
} from 'rxjs';
import { fromFetch } from 'rxjs/fetch';
import {
  SCRAP_ACTION,
  ScrapInput,
  ScrapOutput,
} from './lib/core/extension-messages';
import { KeyStorage } from './lib/domain/key-storage';
import { scrapPage } from './lib/domain/scrap-page';
import { Gemini } from './lib/infra/gemini';

function main() {
  const keyStorage = new KeyStorage();

  listenToMessage<ScrapInput, ScrapOutput>(SCRAP_ACTION)
    .pipe(
      map(({ message, sendResponse }) => ({ url: message.data, sendResponse })),
      switchMap(({ url, sendResponse }) =>
        loadUrl(url).pipe(map((html) => ({ sendResponse, html })))
      ),
      withLatestFrom(keyStorage.getGeminiApiKey()),
      switchMap(([{ html, sendResponse }, key]) => {
        if (!key) {
          return of({ error: 'Gemini API key not found', sendResponse });
        }
        const llm = new Gemini(key);
        return scrapPage({ llm, html }).pipe(
          map((data) => ({ data, sendResponse }))
        );
      })
    )
    .subscribe((args) => {
      const sendResponse = args.sendResponse;
      if ('data' in args) {
        sendResponse({ data: args.data });
      } else if ('error' in args) {
        sendResponse({ error: args.error });
      }
    });
}

function listenToMessage<DATA, RESPONSE>(
  action: string
): Observable<Request<DATA, RESPONSE>> {
  return fromEventPattern<Request<DATA, RESPONSE>>(
    (handler) =>
      chrome.runtime.onMessage.addListener((message, _, sendResponse) => {
        handler({ message, sendResponse });
      }),
    (handler) => chrome.runtime.onMessage.removeListener(handler)
  ).pipe(filter(({ message }) => message.action === action));
}

function loadUrl(url: string): Observable<string | null> {
  if (!url) {
    return of(null);
  }

  return fromFetch(`https://corsproxy.io/?url=${encodeURIComponent(url)}`).pipe(
    switchMap((response) => (response.ok ? response.text() : of(null)))
  );
}

interface Request<INPUT, OUTPUT> {
  message: { action: string; data: INPUT };
  sendResponse: (response: { error: unknown } | { data: OUTPUT }) => void;
}

main();
