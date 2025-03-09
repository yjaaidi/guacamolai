import { BackgroundAction } from './background-actions';

export interface BackgroundServer {
  onAction<ACTION extends BackgroundAction>(
    action: ACTION['type'],
    handler: (payload: ACTION['payload']) => Promise<ACTION['result']>
  ): void;
}
