import { ChromeStorage } from '@guacamolai/infra';

export class KeyStorage {
  #storage = new ChromeStorage();

  getGeminiApiKey(): Promise<string | null> {
    return this.#storage.get(GEMINI_API_KEY_NAME);
  }

  setGeminiApiKey(value: string): Promise<void> {
    return this.#storage.set(GEMINI_API_KEY_NAME, value);
  }
}

const GEMINI_API_KEY_NAME = 'geminiApiKey';
