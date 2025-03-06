import { defer, delay, Observable, of } from 'rxjs';
import { Llm, PromptRequest } from './llm';

export class LlmFake implements Llm {
  #responses: Record<string, unknown> = {};

  prompt<T>(request: PromptRequest): Observable<T> {
    return defer(() => {
      for (const [key, response] of Object.entries(this.#responses)) {
        for (const part of request.prompt) {
          if (part.includes(key)) {
            return of(response as T);
          }
        }
      }
      throw new Error(`No response found for prompt: ${request.prompt}`);
    }).pipe(delay(500));
  }

  setResponses(responses: Record<string, unknown>): void {
    this.#responses = responses;
  }
}
