import { BackgroundServer } from '@guacamolai/core';

export class BackgroundServerImpl implements BackgroundServer {
  onAction<T, R>(action: string, handler: (payload: T) => Promise<R>): void {
    throw new Error('🚧 Work in progress!');
  }
}
