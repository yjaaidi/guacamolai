import { waitForElement } from '@guacamolai/shared-ui/dom';

export class AdvocuScrapForm {
  private static _SCRAP_BUTTON_ID = 'guacamolai-scrap-btn';

  private _onScrapClick: () => void;
  private _onUrlChange: (url: string) => void;

  constructor({
    onScrapClick,
    onUrlChange,
  }: {
    onScrapClick: () => void;
    onUrlChange: (url: string) => void;
  }) {
    this._onScrapClick = onScrapClick;
    this._onUrlChange = onUrlChange;
  }

  async inject() {
    await this._tryInjectScrapForm({
      onClick: this._onScrapClick,
      onUrlChange: this._onUrlChange,
    });
  }

  updateScrapButton(status: 'disabled' | 'enabled' | 'pending') {
    const scrapButton = this._getScrapButton();
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

  private _getScrapButton() {
    return document.getElementById(AdvocuScrapForm._SCRAP_BUTTON_ID);
  }

  private async _tryInjectScrapForm({
    onClick,
    onUrlChange,
  }: {
    onClick: () => void;
    onUrlChange: (url: string) => void;
  }) {
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
    scrapInputEl.addEventListener('input', () =>
      onUrlChange(scrapInputEl.value)
    );

    const scrapButtonEl = document.createElement('button');
    scrapButtonEl.id = AdvocuScrapForm._SCRAP_BUTTON_ID;
    scrapButtonEl.textContent = '✨ Scrap activity';
    scrapButtonEl.classList.add('ant-btn', 'ant-btn-default');
    scrapButtonEl.addEventListener('click', onClick);

    activityButtonsEl.append(scrapInputEl, scrapButtonEl);
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
