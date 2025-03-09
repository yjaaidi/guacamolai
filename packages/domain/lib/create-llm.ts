import { Llm } from '@guacamolai/core';
import { LlmFake } from '@guacamolai/core/testing';
import { Gemini } from '@guacamolai/infra';
import { KeyStorage } from './key-storage';

export async function createLlm({
  fakeLlmResponses,
}: { fakeLlmResponses?: Record<string, unknown> } = {}): Promise<
  Llm | undefined
> {
  return (
    (await _tryCreateLlmFake({ fakeLlmResponses })) ??
    (await _tryCreateLlmGemini())
  );
}

async function _tryCreateLlmFake({
  fakeLlmResponses,
}: {
  fakeLlmResponses?: Record<string, unknown>;
}): Promise<Llm | undefined> {
  if (fakeLlmResponses == null) {
    return;
  }

  const llm = new LlmFake();
  llm.setResponses(fakeLlmResponses);
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
