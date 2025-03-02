import { map, Observable, of } from 'rxjs';
import { Llm } from '../core/llm';
import { Talk } from '../core/talk';
import { HtmlPage } from '../core/html-page';

export function scrapPage({
  llm,
  page,
}: {
  llm: Llm;
  page: HtmlPage;
}): Observable<Talk | null> {
  const { html, url } = page;
  if (html === null) {
    return of(null);
  }

  return llm
    .prompt<Omit<Talk, 'url'>>({
      prompt: [
        `Scrap the content of the page below and try to extract the presentation of a talk.
Return the result in the following JSON format:
- activityType: whether this page presents a content creation (e.g. blog post) or public speaking (e.g. a talk at a conferences)
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
          activityType: {
            type: 'string',
            enum: ['content-creation', 'public-speaking'],
          },
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
    })
    .pipe(
      map((talk) => {
        if (talk.date) {
          talk = {
            ...talk,
            date: new Date(talk.date).toISOString().split('T')[0],
          };
        }
        return { ...talk, url };
      })
    );
}
export const SCRAP_BUTTON_ID = 'guacamolai-scrap-btn';
