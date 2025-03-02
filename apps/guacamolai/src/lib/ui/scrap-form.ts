import { waitForElement } from './dom';

export async function tryInjectScrapForm({
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

  if (_getScrapButton()) {
    return;
  }

  _tryInjectScrapButtonStyles();

  const scrapInputEl = document.createElement('input');
  scrapInputEl.classList.add('ant-input');
  scrapInputEl.placeholder = 'URL to scrap';
  scrapInputEl.addEventListener('input', () => onUrlChange(scrapInputEl.value));

  const scrapButtonEl = document.createElement('button');
  scrapButtonEl.id = _SCRAP_BUTTON_ID;
  scrapButtonEl.textContent = '✨ Scrap activity';
  scrapButtonEl.classList.add('ant-btn', 'ant-btn-default');
  scrapButtonEl.addEventListener('click', onClick);

  activityButtonsEl.append(scrapInputEl, scrapButtonEl);
}

export function updateScrapButton(status: 'disabled' | 'pending' | 'enabled') {
  const scrapButton = _getScrapButton();
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

function _tryInjectScrapButtonStyles() {
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

function _getScrapButton() {
  return document.getElementById(_SCRAP_BUTTON_ID);
}

const _SCRAP_BUTTON_ID = 'guacamolai-scrap-btn';
