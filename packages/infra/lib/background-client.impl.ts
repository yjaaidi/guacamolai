/// <reference types="chrome" />

import type { BackgroundAction, BackgroundClient } from '@guacamolai/core';

export class BackgroundClientImpl implements BackgroundClient {
  async sendAction<ACTION extends BackgroundAction>(
    type: ACTION['type'],
    payload: ACTION['payload']
  ): Promise<ACTION['result']> {
    return await chrome.runtime.sendMessage({ type, payload });
  }
}
