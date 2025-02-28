import { Observable } from 'rxjs';

export interface Llm {
  prompt<T>(request: PromptRequest): Observable<T>;
}

export interface PromptRequest {
  prompt: string[];
  schema: Schema;
}

export type Schema =
  | {
      type: string;
    }
  | {
      type: 'string';
      format?: string;
    }
  | { type: 'object'; properties: Record<string, Schema>; required?: string[] };

export class TooManyRequestsError extends Error {
  override name = 'TooManyRequestsError';
  constructor() {
    super('Too many requests');
  }
}
