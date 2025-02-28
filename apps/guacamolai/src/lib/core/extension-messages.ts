import { Talk } from './talk';

export interface Message<ACTION extends string, INPUT> {
  action: ACTION;
  data: INPUT;
}

export type Response<OUTPUT> =
  | { error: unknown }
  | {
      data: OUTPUT;
    };

export const SCRAP_ACTION = 'scrap';
export type ScrapInput = string;
export type ScrapMessage = Message<typeof SCRAP_ACTION, ScrapInput>;
export type ScrapOutput = Talk | null;
export type ScrapResponse = Response<ScrapOutput>;
