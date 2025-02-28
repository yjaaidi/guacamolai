import { fromEvent, Subscription, switchMap } from 'rxjs';
import { ChromeStorage } from '../lib/infra/chrome-storage';

export class PopupElement extends HTMLElement {
  #shadowRoot: ShadowRoot;
  #storage = new ChromeStorage();
  #sub = new Subscription();

  constructor() {
    super();
    this.#shadowRoot = this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.#shadowRoot.innerHTML = `
      <style>
        .container {
          width: 300px;
          display: flex;
          flex-direction: column;          
        }

        a {
          font-style: italic;
        }
      </style>
      <main class="container">
        <h1>GuacamolAI</h1>
        <input placeholder="Gemini API Key" type="password">
        <a href="https://aistudio.google.com/app/apikey" target="_blank">Get Gemini API Key</a>
      </main>
    `;
    const inputEl = this.#shadowRoot.querySelector('input');
    if (!inputEl) {
      throw new Error('Input element not found');
    }

    this.#sub.add(
      fromEvent(inputEl, 'input')
        .pipe(
          switchMap(async () => {
            const value = inputEl.value;
            await this.#storage.set(GEMINI_API_KEY_NAME, value);
          })
        )
        .subscribe()
    );

    this.#storage.get(GEMINI_API_KEY_NAME).then((key) => {
      if (key) {
        inputEl.value = key;
      }
    });
  }

  disconnectedCallback() {
    this.#sub.unsubscribe();
  }
}

const GEMINI_API_KEY_NAME = 'geminiApiKey';
