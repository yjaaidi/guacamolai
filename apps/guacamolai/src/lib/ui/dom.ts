import { waitFor } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';
import { debounceTime, fromEvent, map, Observable, of, startWith } from 'rxjs';
import { isValidUrl } from '../utils/is-valid-url';

export class Locator<ELEMENT extends HTMLElement> {
  #locatorFn: LocatorFn<ELEMENT>;

  constructor(locatorFn: LocatorFn<ELEMENT>) {
    this.#locatorFn = locatorFn;
  }

  async click() {
    await _waitForElementAndTry(this.#locatorFn, (el) => userEvent.click(el));
  }

  async fill(value: string) {
    await _waitForElementAndTry(this.#locatorFn, async (el) => {
      await userEvent.clear(el);
      await userEvent.type(el, value);
    });
  }

  async setTextContent(description: string) {
    await _waitForElementAndTry(this.#locatorFn, async (el) => {
      el.textContent = description;
    });
  }
}
interface LocatorFn<ELEMENT> {
  (): ELEMENT | null | undefined;
}

async function _waitForElementAndTry<ELEMENT extends HTMLElement>(
  locatorFn: LocatorFn<ELEMENT>,
  act: (el: ELEMENT) => Promise<void>
) {
  const el = await waitForElement(locatorFn);
  if (!el) {
    return;
  }

  try {
    await act(el);
  } catch {
    return;
  }
}

export async function waitForElement<ELEMENT extends HTMLElement>(
  locatorFn: LocatorFn<ELEMENT>
) {
  try {
    return await waitFor(() => {
      const el = locatorFn();
      if (el == null) {
        throw new Error('Element not found');
      }
      return el;
    });
  } catch {
    return;
  }
}

export function watchInputValue(
  el: HTMLInputElement | null
): Observable<string | null> {
  if (!el) {
    return of(null);
  }

  return fromEvent(el, 'input').pipe(
    startWith(_getInputValue(el)),
    map(() => {
      const url = _getInputValue(el);
      return isValidUrl(url) ? url : null;
    })
  );
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

function _getInputValue(el: HTMLInputElement): string {
  return el.value.trim();
}
