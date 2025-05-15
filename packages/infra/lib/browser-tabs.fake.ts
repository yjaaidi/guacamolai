import type { BrowserTab, BrowserTabs } from './browser-tabs';
import { createBrowserTab } from './browser-tabs';

export class BrowserTabsFake implements BrowserTabs {
  #stubResults: Record<string, unknown> = {};
  #tabs: BrowserTab[] = [];

  async getActiveTab(): Promise<BrowserTab | undefined> {
    return this.#tabs.find((tab) => tab.active);
  }

  async createTab(url: string): Promise<BrowserTab> {
    for (const tab of this.#tabs) {
      tab.active = false;
    }

    const tab = createBrowserTab({
      id: this.#tabs.length,
      active: true,
      url,
    });

    this.#tabs.push(tab);

    return tab;
  }

  async activateTab(tabId: number): Promise<void> {
    let found = false;
    for (const tab of this.#tabs) {
      const isActive = tab.id === tabId;
      if (isActive) {
        found = true;
      }
      tab.active = isActive;
    }

    if (!found) {
      throw new Error(`Tab with id ${tabId} not found`);
    }
  }

  async removeTab(tabId: number): Promise<void> {
    this.#tabs = this.#tabs.filter((tab) => tab.id !== tabId);

    if (!(await this.getActiveTab())) {
      await this.activateTab(this.#tabs.length - 1);
    }
  }

  async executeScript<T>(tabId: number): Promise<T | undefined> {
    const url = this.#tabs.find((tab) => tab.id === tabId)?.url;
    if (url == null) {
      throw new Error(`Tab with id ${tabId} not found`);
    }
    return this.#stubResults[url] as T | undefined;
  }

  setStubResult<T>(tabUrl: string, result: T): void {
    this.#stubResults[tabUrl] = result;
  }
}
