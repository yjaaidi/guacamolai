import { map, Observable, of } from 'rxjs';
import { Activity, Article, Talk } from '../core/activity';
import { HtmlPage } from '../core/html-page';
import { Llm } from '../core/llm';

export function scrapPage({
  llm,
  page,
}: {
  llm: Llm;
  page: HtmlPage;
}): Observable<Activity | null> {
  const { html, url } = page;
  if (html === null) {
    return of(null);
  }

  return llm
    .prompt<LlmResult>({
      prompt: [
        `Scrap the content of the page below and try to extract the presentation of a talk.
Return the result in the following JSON format:
- activityType: whether this page presents a content creation (e.g. blog post or article) or public speaking (e.g. a talk at a conferences)
- title: the title of the talk or blog post or article
- description: the description of the talk or a summary of the article
- online: whether the talk or conference is online or on-site
- city: the city where the talk is happening
- country: the country where the talk is happening
- attendees: the number of attendees (if available, otherwise remove field)
- date: the event date (if available, otherwise remove field)
`,
        html,
      ],
      schema: {
        type: 'object',
        properties: {
          activityType: {
            type: 'string',
            enum: ['article', 'talk'],
          },
          title: { type: 'string' },
          description: { type: 'string' },
          date: { type: 'string', format: 'date-time' },
          attendees: { type: 'number' },
          online: { type: 'boolean' },
          city: { type: 'string' },
          country: { type: 'string' },
        },
        required: ['activityType', 'title', 'description'],
      },
    })
    .pipe(
      map((result) => {
        if (result.date) {
          result = {
            ...result,
            date: new Date(result.date).toISOString().split('T')[0],
          };
        }

        result = {
          ...result,
          title: result.title.trim(),
          description: result.description.trim(),
          city: result.city?.trim(),
          country: result.country?.trim(),
        };

        const shared = {
          url,
          title: result.title,
          date: result.date,
          description: result.description,
        };

        switch (result.activityType) {
          case 'article':
            return {
              ...shared,
              type: 'article',
            } satisfies Article;
          case 'talk':
            return {
              ...shared,
              type: 'talk',
              attendees: result.attendees,
              online: result.online,
              city: result.city,
              country: result.country,
            } satisfies Talk;
        }
      })
    );
}

export const SCRAP_BUTTON_ID = 'guacamolai-scrap-btn';

interface LlmResult {
  activityType: 'article' | 'talk';
  title: string;
  description: string;
  attendees?: number;
  city?: string;
  country?: string;
  date?: string;
  online?: boolean;
}
