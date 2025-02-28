import {
  filter,
  map,
  Observable,
  of,
  share,
  Subject,
  switchMap,
  takeUntil,
  withLatestFrom,
} from 'rxjs';
import { fromFetch } from 'rxjs/fetch';
import { Talk } from './lib/core/talk';
import { KeyStorage } from './lib/domain/key-storage';
import { scrapPage } from './lib/domain/scrap-page';
import {
  trySetBooleanValue,
  trySetInputValue,
  trySetParagraphContent,
  watchEl,
  watchInputValue,
} from './lib/infra/dom';
import { Gemini } from './lib/infra/gemini';
import { isValidUrl } from './lib/utils/is-valid-url';

export async function main() {
  const keyStorage = new KeyStorage();
  const click$ = new Subject<void>();
  const url$ = watchEl<HTMLInputElement>(fieldIds.url).pipe(
    switchMap(watchInputValue),
    share()
  );

  url$.subscribe((url) => {
    if (url && isValidUrl(url)) {
      tryShowScrapButton({
        onClick: () => click$.next(),
      });
    } else {
      disableScrapButton();
    }
  });

  click$
    .pipe(
      withLatestFrom(url$),
      map(([, url]) => url),
      /* Fetch URL and scrap... */
      switchMap((url) =>
        loadUrl(url).pipe(
          switchMap(async (html) => {
            const key = await keyStorage.getGeminiApiKey();
            return key != null ? { llm: new Gemini(key), html } : null;
          }),
          switchMap((args) => (args != null ? scrapPage(args) : of(null))),
          /* ... and stop if the URL changes. */
          takeUntil(url$)
        )
      ),
      filter((talk) => talk != null)
    )
    .subscribe(updateForm);
}

const fieldIds = {
  title: '#/properties/title',
  url: '#/properties/activityUrl',
  description: '#/properties/description',
  online: '#/properties/onlineEvent',
  country: '#/properties/country',
  city: '#/properties/city',
} as const;

function loadUrl(url: string | null): Observable<string | null> {
  if (!url) {
    return of(null);
  }

  return fromFetch(`https://corsproxy.io/?url=${encodeURIComponent(url)}`, {
    credentials: 'omit',
  }).pipe(switchMap((response) => (response.ok ? response.text() : of(null))));
}

function tryShowScrapButton({ onClick }: { onClick: () => void }) {
  const actionsEl = document.querySelector('.steps-action');
  if (!actionsEl) {
    return;
  }

  let scrapButtonEl = getScrapButton();
  if (scrapButtonEl) {
    scrapButtonEl.removeAttribute('disabled');
    return;
  }

  scrapButtonEl = document.createElement('button');
  scrapButtonEl.id = SCRAP_BUTTON_ID;
  scrapButtonEl.textContent = '✨ Scrap';
  scrapButtonEl.classList.add('ant-btn', 'ant-btn-default');
  scrapButtonEl.addEventListener('click', onClick);

  actionsEl.prepend(scrapButtonEl);
}

function disableScrapButton() {
  getScrapButton()?.setAttribute('disabled', '');
}

function getScrapButton() {
  return document.getElementById(SCRAP_BUTTON_ID);
}

const SCRAP_BUTTON_ID = 'guacamolai-scrap-btn';

function updateForm(talk: Talk) {
  trySetInputValue(document.getElementById(fieldIds.title), talk.title);
  trySetParagraphContent(
    document.getElementById(fieldIds.description)?.querySelector('p') ?? null,
    talk.description
  );
  trySetBooleanValue(document.getElementById(fieldIds.online), talk.online);
  if (talk.country) {
    trySetInputValue(
      document.getElementById(fieldIds.country)?.querySelector('input') ?? null,
      talk.country
    );
  }
  if (talk.city) {
    trySetInputValue(document.getElementById(fieldIds.city), talk.city);
  }
}

main();
