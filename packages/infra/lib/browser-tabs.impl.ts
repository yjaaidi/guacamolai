import type { BrowserTab, BrowserTabs } from './browser-tabs';
import { createBrowserTab } from './browser-tabs';

export class BrowserTabsImpl implements BrowserTabs {
  async executeScript<T>(
    tabId: number,
    func: () => Promise<T>
  ): Promise<T | undefined> {
    const [{ result }] = await chrome.scripting.executeScript({
      target: { tabId },
      func,
    });

    return result;
  }

  async getActiveTab(): Promise<BrowserTab | undefined> {
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });
    return tab?.id != null
      ? createBrowserTab({ id: tab.id, active: tab.active, url: tab.url })
      : undefined;
  }

  async createTab(url: string): Promise<BrowserTab> {
    const tab = await chrome.tabs.create({ url });
    if (tab.id == null) {
      throw new Error(`Can't create tab for URL: ${url}`);
    }
    return createBrowserTab({
      id: tab.id,
      active: tab.active,
      url: tab.url,
    });
  }

  async activateTab(tabId: number): Promise<void> {
    await chrome.tabs.update(tabId, { active: true });
  }

  async removeTab(tabId: number): Promise<void> {
    await chrome.tabs.remove(tabId);
  }
}
