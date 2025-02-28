import { Observable, of, fromEvent, startWith, map, debounceTime } from 'rxjs';
import { isValidUrl } from '../utils/is-valid-url';
import { fieldIds } from '../../content';

export function watchInputValue(
  el: HTMLInputElement | null
): Observable<string | null> {
  if (!el) {
    return of(null);
  }

  return fromEvent(el, 'input').pipe(
    startWith(getInputValue(el)),
    map(() => {
      const url = getInputValue(el);
      return isValidUrl(url) ? url : null;
    })
  );
}

export function trySetInputValue(el: HTMLElement | null, value: string) {
  if (!el || !('value' in el)) {
    return;
  }
  el.value = value;
}

export function trySetParagraphContent(
  el: HTMLElement | null,
  content: string
) {
  if (!el) {
    return;
  }
  el.textContent = content;
}

export function trySetBooleanValue(
  el: HTMLElement | null,
  value: boolean | undefined
) {
  const spanEls = Array.from(el?.querySelectorAll('span') ?? []);
  const yesEl = spanEls.find((spanEl) => compareText(spanEl, 'yes'));
  const noEl = spanEls.find((spanEl) => compareText(spanEl, 'no'));
  if (!yesEl || !noEl) {
    return;
  }

  switch (value) {
    case true:
      yesEl.click();
      break;
    case false:
      noEl.click();
      break;
  }
}

export function watchEl<T extends HTMLElement>(
  id: string
): Observable<T | null> {
  return new Observable<T | null>((observer) => {
    const mutationObserver = new MutationObserver(() => {
      const el = document.getElementById(id);
      observer.next(el != null ? (el as T) : null);
    });

    mutationObserver.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => mutationObserver.disconnect();
  }).pipe(debounceTime(50));
}

function compareText(el: HTMLElement, text: string): boolean {
  return el.textContent?.trim().toLocaleLowerCase() === text;
}

function getInputValue(el: HTMLInputElement): string {
  return el.value.trim();
}
