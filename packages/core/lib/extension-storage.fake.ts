import type { ExtensionStorage } from './extension-storage';

export class ExtensionStorageFake implements ExtensionStorage {
  #storage = new Map();

  async get(key: string) {
    return this.#storage.get(key) || null;
  }

  async set(key: string, value: string) {
    this.#storage.set(key, value);
  }
}
