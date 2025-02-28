import { Observable, of } from 'rxjs';
import { Talk } from '../../content';
import { Llm } from '../core/llm';

export function scrapPage({
  llm,
  html,
}: {
  llm: Llm;
  html: string | null;
}): Observable<Talk | null> {
  if (html === null) {
    return of(null);
  }

  return llm.prompt<Talk>({
    prompt: [
      `Scrap the content of the page below and try to extract the presentation of a talk.
            Return the result in the following JSON format:
            - title: the title of the talk
            - description: the description of the talk
            `,
      html,
    ],
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
