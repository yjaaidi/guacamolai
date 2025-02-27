import { Observable, of } from 'rxjs';
import { Talk } from '../../content';
import { Llm } from '../core/llm';

export function scrapUrl({
  llm,
  url,
}: {
  llm: Llm;
  url: string | null;
}): Observable<Talk | null> {
  if (url === null) {
    return of(null);
  }

  return llm.prompt<Talk>({
    prompt: `Scrap the content of this page ${url} and try to extract the presentation of a talk.
            Return the result in the following JSON format:
            - title: the title of the talk
            - description: the description of the talk
            `,
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string' },
        description: { type: 'string' },
      },
      required: ['title', 'description'],
    },
  });
}
