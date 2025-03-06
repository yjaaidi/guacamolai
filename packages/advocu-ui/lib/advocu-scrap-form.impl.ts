import type {
  AdvocuScrapForm,
  AdvocuScrapFormFactory,
} from '@guacamolai/advocu-core';
import { waitForElement } from '@guacamolai/shared-ui/dom';

export class AdvocuScrapFormFactoryImpl implements AdvocuScrapFormFactory {
  private static _SCRAP_BUTTON_ID = 'guacamolai-scrap-btn';

  async create() {
    const els = await this._tryInjectScrapForm();
    if (!els) {
      return;
    }

    return new AdvocuScrapFormImpl(els);
  }

  private async _tryInjectScrapForm() {
    const activityButtonsEl = await waitForElement(() =>
      document.querySelector<HTMLElement>('.submit-activity-buttons')
    );
    if (!activityButtonsEl) {
      return;
    }

    if (this._getScrapButton()) {
      return;
    }

    this._tryInjectScrapButtonStyles();

    const scrapInputEl = document.createElement('input');
    scrapInputEl.classList.add('ant-input');
    scrapInputEl.placeholder = 'URL to scrap';

    const scrapButtonEl = document.createElement('button');
    scrapButtonEl.id = AdvocuScrapFormFactory._SCRAP_BUTTON_ID;
    scrapButtonEl.textContent = '✨ Scrap activity';
    scrapButtonEl.classList.add('ant-btn', 'ant-btn-default');

    activityButtonsEl.append(scrapInputEl, scrapButtonEl);

    return { scrapButtonEl, scrapInputEl };
  }

  private _getScrapButton() {
    return document.getElementById(AdvocuScrapFormFactoryImpl._SCRAP_BUTTON_ID);
  }

  private _tryInjectScrapButtonStyles() {
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
  private _scrapButtonEl: HTMLElement;
  private _scrapInputEl: HTMLInputElement;

  constructor({
    scrapButtonEl,
    scrapInputEl,
  }: {
    scrapButtonEl: HTMLElement;
    scrapInputEl: HTMLInputElement;
  }) {
    this._scrapButtonEl = scrapButtonEl;
    this._scrapInputEl = scrapInputEl;
  }

  onScrapClick(onClick: () => void) {
    this._scrapButtonEl.addEventListener('click', onClick);
  }

  onUrlChange(onUrlChange: (url: string) => void) {
    this._scrapInputEl.addEventListener('input', () =>
      onUrlChange(this._scrapInputEl.value)
    );
  }

  updateScrapButton(status: 'disabled' | 'enabled' | 'pending') {
    if (['disabled', 'pending'].includes(status)) {
      this._scrapButtonEl.setAttribute('disabled', '');
    } else {
      this._scrapButtonEl.removeAttribute('disabled');
    }

    if (status === 'pending') {
      this._scrapButtonEl.classList.add('pending');
    } else {
      this._scrapButtonEl.classList.remove('pending');
    }
  }
}
