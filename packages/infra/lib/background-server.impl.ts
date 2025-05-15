import type { BackgroundAction, BackgroundServer } from '@guacamolai/core';

export class BackgroundServerImpl implements BackgroundServer {
  onAction<ACTION extends BackgroundAction>(
    type: ACTION['type'],
    handler: (payload: ACTION['payload']) => Promise<ACTION['result']>
  ): void {
    chrome.runtime.onMessage.addListener(
      (
        message: { type: ACTION['type']; payload: ACTION['payload'] },
        _: unknown,
        sendResponse
      ) => {
        innerHandler();

        /* Asynchronous listener. */
        return true;

        async function innerHandler() {
          if (message.type === type) {
            const result = await handler(message.payload);
            sendResponse(result);
          } else {
            console.error(`Unknown action: ${message.type}`);
          }
        }
      }
    );
  }
}
