export interface BackgroundServer {
  onAction<T, R>(action: string, handler: (payload: T) => Promise<R>): void;
}
