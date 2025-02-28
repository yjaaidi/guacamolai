import { suspensify } from '@jscutlery/operators';
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
  const key = await keyStorage.getGeminiApiKey();
  if (key == null) {
    return;
  }

  const llm = new Gemini(key);
  const click$ = new Subject<void>();
  const url$ = watchEl<HTMLInputElement>(fieldIds.url).pipe(
    switchMap(watchInputValue),
    share()
  );
  const page$ = url$.pipe(
    filter((url) => url != null),
    filter(isValidUrl),
    switchMap((url) => {
      return loadUrl(url).pipe(
        map((html) => (html != null ? { url, html } : null))
      );
    }),
    filter((page) => page != null),
    share()
  );
  const onClick = () => click$.next();

  applyStyles();

  page$.subscribe((page) => {
    if (page != null) {
      showScrapButton({ onClick });
    } else {
      disableScrapButton();
    }
  });

  click$
    .pipe(
      withLatestFrom(page$),
      map(([, page]) => page),
      /* Fetch URL and scrap... */
      switchMap(({ html }) =>
        scrapPage({ html, llm }).pipe(
          suspensify(),
          /* ... and stop if the URL changes. */
          takeUntil(url$)
        )
      )
    )
    .subscribe((suspense) => {
      if (suspense.pending) {
        updateScrapButton('pending');
      }
      if (suspense.hasValue && suspense.value != null) {
        updateScrapButton('enabled');
        updateForm(suspense.value);
      }
      if (suspense.hasError) {
        console.error(suspense.error);
        updateScrapButton('enabled');
      }
    });
}

const fieldIds = {
  title: '#/properties/title',
  url: '#/properties/activityUrl',
  description: '#/properties/description',
  online: '#/properties/onlineEvent',
  country: '#/properties/country',
  city: '#/properties/city',
} as const;

function applyStyles() {
  const style = document.createElement('style');
  style.textContent = `
    button.pending {
      animation: blink 2s alternate infinite;
    }

    @keyframes blink {
      0% { opacity: 1; }
      50% { opacity: .2; }
      100% { opacity: 1; }
    }
  `;
  document.head.appendChild(style);
}

function loadUrl(url: string | null): Observable<string | null> {
  if (!url) {
    return of(null);
  }

  return fromFetch(`https://corsproxy.io/?url=${encodeURIComponent(url)}`, {
    credentials: 'omit',
    mode: 'cors',
  }).pipe(switchMap((response) => (response.ok ? response.text() : of(null))));
}

function showScrapButton({ onClick }: { onClick: () => void }) {
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

function updateScrapButton(status: 'disabled' | 'pending' | 'enabled') {
  const scrapButton = getScrapButton();
  if (!scrapButton) {
    return;
  }

  if (['disabled', 'pending'].includes(status)) {
    scrapButton.setAttribute('disabled', '');
  } else {
    scrapButton.removeAttribute('disabled');
  }

  if (status === 'pending') {
    scrapButton.classList.add('pending');
  } else {
    scrapButton.classList.remove('pending');
  }
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
