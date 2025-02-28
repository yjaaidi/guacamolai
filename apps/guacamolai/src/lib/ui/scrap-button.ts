export function tryInjectScrapButton({ onClick }: { onClick: () => void }) {
  const actionsEl = document.querySelector('.steps-action');
  if (!actionsEl) {
    return;
  }

  if (getScrapButton()) {
    return;
  }

  tryInjectScrapButtonStyles();

  const scrapButtonEl = document.createElement('button');
  scrapButtonEl.id = SCRAP_BUTTON_ID;
  scrapButtonEl.textContent = '✨ Scrap';
  scrapButtonEl.classList.add('ant-btn', 'ant-btn-default');
  scrapButtonEl.addEventListener('click', onClick);

  actionsEl.prepend(scrapButtonEl);
}

function tryInjectScrapButtonStyles() {
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

export function updateScrapButton(status: 'disabled' | 'pending' | 'enabled') {
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

function getScrapButton() {
  return document.getElementById(SCRAP_BUTTON_ID);
}

const SCRAP_BUTTON_ID = 'guacamolai-scrap-btn';
