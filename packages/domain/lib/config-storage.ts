import { ChromeStorage } from '@guacamolai/infra';

export class ConfigStorage {
  #storage = new ChromeStorage();

  getGeminiApiKey(): Promise<string | null> {
    return this.#storage.get(GEMINI_API_KEY_NAME);
  }

  setGeminiApiKey(value: string): Promise<void> {
    return this.#storage.set(GEMINI_API_KEY_NAME, value);
  }

  getSpeakerName(): Promise<string | null> {
    return this.#storage.get(SPEAKER_NAME);
  }

  setSpeakerName(value: string): Promise<void> {
    return this.#storage.set(SPEAKER_NAME, value);
  }
}

const GEMINI_API_KEY_NAME = 'geminiApiKey';
const SPEAKER_NAME = 'speakerName';
