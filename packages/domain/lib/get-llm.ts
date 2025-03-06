import { LlmFake } from '@guacamolai/core/testing';
import { Gemini, tryReadLocalStorageJson } from '@guacamolai/infra';
import { KeyStorage } from './key-storage';
import { Llm } from '@guacamolai/core';

export async function createLlm() {
  /* We use the local storage to set up the fake LLM in Playwright. */
  const llm = _tryCreateLlmFake();
  if (!llm) {
    return _tryCreateLlmGemini();
  }

  return;
}

async function _tryCreateLlmFake(): Promise<Llm | undefined> {
  const responses =
    tryReadLocalStorageJson<Record<string, unknown>>(LLM_FAKE_STORAGE_KEY);

  if (responses == null) {
    return;
  }

  const llm = new LlmFake();
  llm.setResponses(responses);
  return llm;
}

async function _tryCreateLlmGemini(): Promise<Llm | undefined> {
  const keyStorage = new KeyStorage();
  const key = await keyStorage.getGeminiApiKey();
  if (key == null) {
    return;
  }
  return new Gemini(key);
}

export const LLM_FAKE_STORAGE_KEY = 'llm-fake';
