import { Llm } from '@guacamolai/core';
import { LlmFake } from '@guacamolai/core/testing';
import { Gemini } from '@guacamolai/infra';
import { ConfigStorage } from './config-storage';

export async function createLlm({
  configStorage,
  fakeLlmResponses,
}: {
  configStorage: ConfigStorage;
  fakeLlmResponses?: Record<string, unknown>;
}): Promise<Llm> {
  return (
    (await _tryCreateLlmFake({ fakeLlmResponses })) ??
    (await _createLlmGemini({ configStorage }))
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

async function _createLlmGemini({
  configStorage,
}: {
  configStorage: ConfigStorage;
}): Promise<Llm> {
  const key = await configStorage.getGeminiApiKey();

  if (key == null) {
    throw new Error(`Can't get Gemini API key.`);
  }

  return new Gemini(key);
}

export const LLM_FAKE_STORAGE_KEY = 'llm-fake';
