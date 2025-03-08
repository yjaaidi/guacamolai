export interface BackgroundClient {
  sendAction<T, R>(action: string, payload: T): Promise<R>;
}
