import type {
  AdvocuScrapForm,
  AdvocuScrapFormFactory,
} from '@guacamolai/advocu-core';
import { waitForElement } from '@guacamolai/shared-ui/dom';
import { fromEvent, map, Observable, tap } from 'rxjs';

export class AdvocuScrapFormFactoryImpl implements AdvocuScrapFormFactory {
  static #SCRAP_BUTTON_ID = 'guacamolai-scrap-btn';

  async create() {
    const els = await this.#tryInjectScrapForm();
    if (!els) {
      return;
    }

    return new AdvocuScrapFormImpl(els);
  }

  async #tryInjectScrapForm() {
    const activityButtonsEl = await waitForElement(() =>
      document.querySelector<HTMLElement>('.submit-activity-buttons')
    );
    if (!activityButtonsEl) {
      return;
    }

    if (this.#getScrapButton()) {
      return;
    }

    this.#tryInjectScrapButtonStyles();

    const scrapInputEl = document.createElement('input');
    scrapInputEl.classList.add('ant-input');
    scrapInputEl.placeholder = 'URL to scrap';

    const scrapButtonEl = document.createElement('button');
    scrapButtonEl.id = AdvocuScrapFormFactoryImpl.#SCRAP_BUTTON_ID;
    scrapButtonEl.type = 'submit';
    scrapButtonEl.textContent = '✨ Scrap activity';
    scrapButtonEl.classList.add('ant-btn', 'ant-btn-default');

    const scrapFormEl = document.createElement('form');
    scrapFormEl.append(scrapInputEl, scrapButtonEl);
    scrapFormEl.classList.add('horizontal');

    activityButtonsEl.appendChild(scrapFormEl);

    return { scrapButtonEl, scrapFormEl, scrapInputEl };
  }

  #getScrapButton() {
    return document.getElementById(AdvocuScrapFormFactoryImpl.#SCRAP_BUTTON_ID);
  }

  #tryInjectScrapButtonStyles() {
    const attr = 'data-guacamolai-scrap-button-styles';
    if (document.head.querySelector(`style[${attr}]`)) {
      return;
    }

    const style = document.createElement('style');
    style.setAttribute(attr, '');
    style.textContent = `
    form.horizontal {
      display: flex;
    }

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
}

export class AdvocuScrapFormImpl implements AdvocuScrapForm {
  urlChange$: Observable<string>;
  scrapSubmit$: Observable<void>;

  #scrapFormEl: HTMLFormElement;
  #scrapButtonEl: HTMLElement;
  #scrapInputEl: HTMLInputElement;

  constructor({
    scrapFormEl,
    scrapButtonEl,
    scrapInputEl,
  }: {
    scrapFormEl: HTMLFormElement;
    scrapButtonEl: HTMLElement;
    scrapInputEl: HTMLInputElement;
  }) {
    this.#scrapFormEl = scrapFormEl;
    this.#scrapButtonEl = scrapButtonEl;
    this.#scrapInputEl = scrapInputEl;
    this.urlChange$ = fromEvent(this.#scrapInputEl, 'input').pipe(
      map(() => this.#scrapInputEl.value)
    );
    this.scrapSubmit$ = fromEvent(this.#scrapFormEl, 'submit').pipe(
      tap((e) => e.preventDefault()),
      map(() => undefined)
    );
  }

  showErrorToast(error: unknown) {
    const toastEl = document.createElement('div');
    toastEl.role = 'alert';
    toastEl.textContent = `🥑 GuacamolAI Error: ${error}`;
    toastEl.style.position = 'fixed';
    toastEl.style.top = '10px';
    toastEl.style.transform = 'translateX(calc(50vw - 50%))';
    toastEl.style.margin = 'auto';
    toastEl.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
    toastEl.style.color = 'white';
    toastEl.style.padding = '10px';
    toastEl.style.borderRadius = '5px';
    toastEl.style.boxShadow = '0 0 10px 0 rgba(0, 0, 0, 0.5)';

    document.body.appendChild(toastEl);

    setTimeout(() => toastEl.remove(), 5_000);
  }

  updateScrapButton(status: 'disabled' | 'enabled' | 'pending') {
    if (['disabled', 'pending'].includes(status)) {
      this.#scrapButtonEl.setAttribute('disabled', '');
    } else {
      this.#scrapButtonEl.removeAttribute('disabled');
    }

    if (status === 'pending') {
      this.#scrapButtonEl.classList.add('pending');
    } else {
      this.#scrapButtonEl.classList.remove('pending');
    }
  }
}
