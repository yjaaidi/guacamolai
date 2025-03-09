import { BackgroundAction } from './background-actions';

export interface BackgroundClient {
  sendAction<ACTION extends BackgroundAction>(
    type: ACTION['type'],
    input: ACTION['payload']
  ): Promise<ACTION['result']>;
}
