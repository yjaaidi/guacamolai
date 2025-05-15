import type { Llm } from '@guacamolai/core';
import { LlmFake, type LlmFakeResponse } from '@guacamolai/core/testing';
import { Gemini } from '@guacamolai/infra';
import { ConfigStorage } from './config-storage';

export async function createLlm({
  configStorage,
}: {
  configStorage: ConfigStorage;
}): Promise<Llm> {
  return (
    (await _tryCreateLlmFake({ configStorage })) ??
    (await _createLlmGemini({ configStorage }))
  );
}

async function _tryCreateLlmFake({
  configStorage,
}: {
  configStorage: ConfigStorage;
}): Promise<Llm | undefined> {
  const fakeLlmResponses = await configStorage.getLlmFakeResponses();

  if (fakeLlmResponses == null) {
    return;
  }

  const llm = new LlmFake();
  llm.setResponses(fakeLlmResponses as unknown as LlmFakeResponse<unknown>[]);
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
