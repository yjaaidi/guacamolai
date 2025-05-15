import type { ExtensionStorage } from '@guacamolai/core';

export class ConfigStorage {
  #storage: ExtensionStorage;

  constructor(storage: ExtensionStorage) {
    this.#storage = storage;
  }

  getGeminiApiKey(): Promise<string | null> {
    return this.#storage.get(GEMINI_API_KEY_KEY);
  }

  setGeminiApiKey(value: string): Promise<void> {
    return this.#storage.set(GEMINI_API_KEY_KEY, value);
  }

  getSpeakerName(): Promise<string | null> {
    return this.#storage.get(SPEAKER_NAME_KEY);
  }

  setSpeakerName(value: string): Promise<void> {
    return this.#storage.set(SPEAKER_NAME_KEY, value);
  }

  async getLlmFakeResponses(): Promise<Record<string, unknown>[] | null> {
    const data = await this.#storage.get(LLM_FAKE_RESPONSES_KEY);

    if (data == null) {
      return null;
    }

    try {
      return JSON.parse(data);
    } catch {
      return null;
    }
  }
}

export const LLM_FAKE_RESPONSES_KEY = 'llmFakeResponses';
const GEMINI_API_KEY_KEY = 'geminiApiKey';
const SPEAKER_NAME_KEY = 'speakerName';
