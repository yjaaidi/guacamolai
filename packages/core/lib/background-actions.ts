import { HtmlPage } from './html-page';

export interface BackgroundAction<
  TYPE extends string = string,
  PAYLOAD = unknown,
  RESULT = unknown
> {
  type: TYPE;
  payload: PAYLOAD;
  result: RESULT;
}

export type ScrapAction = BackgroundAction<
  'scrap',
  { url: string; fakeLlmResponses?: Record<string, unknown> },
  HtmlPage
>;
