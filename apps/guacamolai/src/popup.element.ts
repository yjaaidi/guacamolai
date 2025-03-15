import { ConfigStorage } from '@guacamolai/domain';
import { ChromeStorage } from '@guacamolai/infra';
import { fromEvent, Subscription, switchMap } from 'rxjs';

export class PopupElement extends HTMLElement {
  #shadowRoot: ShadowRoot;
  #configStorage = new ConfigStorage(new ChromeStorage());
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

        form {
          display: flex;
          flex-direction: column;
        }
      </style>
      <main class="container">
        <h1>GuacamolAI</h1>
        <form>
          <input id="speaker-name" placeholder="Speaker Name" type="text">
          <input id="gemini-api-key" placeholder="Gemini API Key" type="password">
          <a href="https://aistudio.google.com/app/apikey" target="_blank">Get Gemini API Key</a>
        </form>
      </main>
    `;

    const formEl = this.#queryElement('form');
    const geminiApiKeyEl =
      this.#queryElement<HTMLInputElement>('#gemini-api-key');
    const speakerNameEl = this.#queryElement<HTMLInputElement>('#speaker-name');

    this.#sub.add(
      fromEvent(formEl, 'input')
        .pipe(
          switchMap(async () => {
            const geminiApiKey = geminiApiKeyEl.value;
            const speakerName = speakerNameEl.value;
            await Promise.all([
              this.#configStorage.setGeminiApiKey(geminiApiKey),
              this.#configStorage.setSpeakerName(speakerName),
            ]);
          })
        )
        .subscribe()
    );

    Promise.all([
      this.#configStorage.getGeminiApiKey(),
      this.#configStorage.getSpeakerName(),
    ]).then(([geminiApiKey, speakerName]) => {
      if (geminiApiKey) {
        geminiApiKeyEl.value = geminiApiKey;
      }
      if (speakerName) {
        speakerNameEl.value = speakerName;
      }
    });
  }

  disconnectedCallback() {
    this.#sub.unsubscribe();
  }

  #queryElement<ELEMENT extends HTMLElement>(selector: string): ELEMENT {
    const el = this.#shadowRoot.querySelector<ELEMENT>(selector);
    if (el == null) {
      throw new Error(`Element with selector "${selector}" not found`);
    }
    return el;
  }
}
