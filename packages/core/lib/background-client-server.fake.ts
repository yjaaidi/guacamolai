import { BackgroundClient } from './background-client';
import { BackgroundServer } from './background-server';

export class BackgroundClientServerFake
  implements BackgroundClient, BackgroundServer
{
  private _handlers: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [action: string]: (payload: any) => Promise<any>;
  } = {};

  onAction<T, R>(action: string, handler: (payload: T) => Promise<R>): void {
    this._handlers[action] = handler;
  }

  async sendAction<T, R>(action: string, payload: T): Promise<R> {
    const handler = this._handlers[action];

    if (!handler) {
      throw new Error(`No handler for action ${action}`);
    }

    return handler(payload);
  }
}
