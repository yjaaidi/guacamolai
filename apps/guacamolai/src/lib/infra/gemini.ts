import { map, Observable, switchMap } from 'rxjs';
import { Llm, PromptRequest, Schema } from '../core/llm';
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
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-pro-exp-02-05:generateContent?key=${
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

        return JSON.parse(body.candidates[0].content.parts[0].text);
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
