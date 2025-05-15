import type { Activity, Article, HtmlPage, Llm, Talk } from '@guacamolai/core';
import { map, Observable } from 'rxjs';

export function scrapPage({
  llm,
  page,
  speakerName,
}: {
  llm: Llm;
  page: HtmlPage;
  speakerName?: string;
}): Observable<Activity> {
  const { html, url } = page;

  let prompt = `Scrap the content of the page below and try to extract the presentation of a talk.
Return the result in the following JSON format:
- activityType: whether this page presents a content creation (e.g. blog post or article) or public speaking (e.g. a talk at a conferences)
- title: the title of the talk or blog post or article
- description: the description of the talk or article. If no description can be found for the article, generate a quick summary.
- online: whether the talk or conference is online or on-site
- city: the city where the talk is happening
- country: the country where the talk is happening
- attendees: the number of attendees (if available, otherwise remove field)
- date: the event date if it's a talk or the publication date if it's an article (if available, otherwise remove field)
`;

  if (speakerName) {
    prompt += `If there are multiple speakers, focus only on the content related to "${speakerName.replace(
      /[^(\w|\s)]/g,
      ''
    )}" and ignore others.`;
  }

  return llm
    .prompt<LlmResult>({
      prompt: [prompt, html],
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

        if (result.online == null && (result.city || result.country)) {
          result = {
            ...result,
            online: false,
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
