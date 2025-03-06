import { LlmFake } from '@guacamolai/core/testing';
import { Gemini } from '../infra/gemini';
import { tryReadLocalStorageJson } from '../infra/local-storage';
import { KeyStorage } from './key-storage';

export async function getLlm() {
  const responses =
    tryReadLocalStorageJson<Record<string, unknown>>(LLM_FAKE_KEY);
  if (responses) {
    const llm = new LlmFake();
    llm.setResponses(responses);
    return llm;
  } else {
    const keyStorage = new KeyStorage();
    const key = await keyStorage.getGeminiApiKey();
    if (key == null) {
      return;
    }
    return new Gemini(key);
  }
}

export const LLM_FAKE_KEY = 'llm-fake';
