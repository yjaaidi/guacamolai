import { defer, delay, Observable, of } from 'rxjs';
import { Llm, PromptRequest } from './llm';

export class LlmFake implements Llm {
  #responses: LlmFakeResponse<unknown>[] = [];

  prompt<T>(request: PromptRequest): Observable<T> {
    return defer(() => {
      const response = this.#responses.find(({ pattern }) => {
        for (const part of request.prompt) {
          if (part.includes(pattern)) {
            return true;
          }
        }
        return false;
      });

      if (response) {
        return of(response.value as T);
      }

      throw new Error(`No response found for prompt: ${request.prompt}`);
    }).pipe(delay(500));
  }

  setResponses(responses: LlmFakeResponse<unknown>[]): void {
    this.#responses = responses;
  }
}

export interface LlmFakeResponse<T> {
  pattern: string;
  value: T;
}
