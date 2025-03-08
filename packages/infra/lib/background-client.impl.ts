import { BackgroundClient } from '@guacamolai/core';

export class BackgroundClientImpl implements BackgroundClient {
  sendAction<T, R>(action: string, payload: T): Promise<R> {
    throw new Error('🚧 Work in progress!');
  }
}
