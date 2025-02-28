import { ExtensionStorage } from '../core/extension-storage';

export class ChromeStorage implements ExtensionStorage {
  async get(key: string): Promise<string | null> {
    return (await chrome.storage.local.get(key))[key] ?? null;
  }
  async set(key: string, value: string): Promise<void> {
    await chrome.storage.local.set({ [key]: value });
  }
}
