import { BackgroundAction } from './background-actions';
import { BackgroundClient } from './background-client';
import { BackgroundServer } from './background-server';

export class BackgroundClientServerFake
  implements BackgroundClient, BackgroundServer
{
  private _handlers: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [action: string]: (payload: any) => Promise<any>;
  } = {};

  onAction<ACTION extends BackgroundAction>(
    type: ACTION['type'],
    handler: (payload: ACTION['payload']) => Promise<ACTION['result']>
  ): void {
    this._handlers[type] = handler;
  }

  async sendAction<T, R>(action: string, payload: T): Promise<R> {
    const handler = this._handlers[action];

    if (!handler) {
      throw new Error(`No handler for action ${action}`);
    }

    return handler(payload);
  }
}
