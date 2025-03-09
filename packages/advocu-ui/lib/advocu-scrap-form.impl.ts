import type {
  AdvocuScrapForm,
  AdvocuScrapFormFactory,
} from '@guacamolai/advocu-core';
import { waitForElement } from '@guacamolai/shared-ui/dom';
import { fromEvent, map, Observable } from 'rxjs';

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
    scrapButtonEl.textContent = '✨ Scrap activity';
    scrapButtonEl.classList.add('ant-btn', 'ant-btn-default');

    activityButtonsEl.append(scrapInputEl, scrapButtonEl);

    return { scrapButtonEl, scrapInputEl };
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
  scrapClick$: Observable<void>;

  #scrapButtonEl: HTMLElement;
  #scrapInputEl: HTMLInputElement;

  constructor({
    scrapButtonEl,
    scrapInputEl,
  }: {
    scrapButtonEl: HTMLElement;
    scrapInputEl: HTMLInputElement;
  }) {
    this.#scrapButtonEl = scrapButtonEl;
    this.#scrapInputEl = scrapInputEl;
    this.urlChange$ = fromEvent(this.#scrapInputEl, 'input').pipe(
      map(() => this.#scrapInputEl.value)
    );
    this.scrapClick$ = fromEvent(this.#scrapButtonEl, 'click').pipe(
      map(() => undefined)
    );
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
