import { Observable, of } from 'rxjs';
import { Llm } from '../core/llm';
import { Talk } from '../core/talk';

export function scrapHtml({
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
- online: whether the talk is online or not
- city: the city where the talk is happening
- country: the country where the talk is happening
- attendees: the number of attendees (if available, otherwise remove field)
- date: the event date (if available, otherwise remove field)

Trim all the fields.
`,
      html,
    ],
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string' },
        description: { type: 'string' },
        attendees: { type: 'number' },
        online: { type: 'boolean' },
        date: { type: 'string', format: 'date-time' },
        city: { type: 'string' },
        country: { type: 'string' },
      },
      required: ['title', 'description'],
    },
  });
}
export const SCRAP_BUTTON_ID = 'guacamolai-scrap-btn';
