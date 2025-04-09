import { Llm, PromptRequest, Schema } from '@guacamolai/core';
import { map, Observable, switchMap } from 'rxjs';
import { fromFetch } from 'rxjs/fetch';

export class Gemini implements Llm {
  #geminiApiKey: string;

  constructor(geminiApiKey: string) {
    this.#geminiApiKey = geminiApiKey;
  }

  prompt<T>(request: PromptRequest): Observable<T> {
    const geminiRequest: GenerateContentRequest = {
      contents: [{ parts: request.prompt.map((text) => ({ text })) }],
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: request.schema,
      },
    };

    return fromFetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro-preview-03-25:generateContent?key=${
        this.#geminiApiKey
      }`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(geminiRequest),
      }
    ).pipe(
      switchMap(
        async (response) => (await response.json()) as GenerateContentResponse
      ),
      map((body) => {
        if ('error' in body) {
          if (body.error.code === 429) {
            throw new Error('Too many requests');
          }

          throw new Error(`Gemini error: ${body.error.message}`);
        }

        const text = _sanitizeGeminiResponse(body.candidates[0].content.parts[0].text);

        return JSON.parse(text);
      })
    );
  }
}
export interface GenerateContentRequest {
  contents: Content[];
  generationConfig?: GenerationConfig;
  systemInstruction?: Content;
}
export type GenerateContentResponse =
  | {
      candidates: Candidate[];
    }
  | { error: { code: number; message: string } };
interface GenerationConfig {
  responseSchema: Schema;
  responseMimeType: string;
}
interface Candidate {
  content: Content;
}
interface Content {
  role?: 'user' | 'model';
  parts: Part[];
}
interface Part {
  text: string;
}

/**
 * Fixes weird issue with Gemini.
 * CF. https://discuss.ai.google.dev/t/gemini-2-5-pro-inserting-random-text-and-format-tokens-around-json-responses/76977
 */
function _sanitizeGeminiResponse(text: string): string {
  const startIndex = text.indexOf('{') ?? 0;
  const endIndex = text.lastIndexOf('}') ?? (text.length - 1);
  return text.slice(startIndex, endIndex + 1);
}
