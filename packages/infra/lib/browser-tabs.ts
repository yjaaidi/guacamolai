export interface BrowserTabs {
  getActiveTab(): Promise<BrowserTab | undefined>;
  createTab(url: string): Promise<BrowserTab>;
  activateTab(tabId: number): Promise<void>;
  removeTab(tabId: number): Promise<void>;
  executeScript<T>(tabId: number, func: () => Promise<T>): Promise<T | undefined>;
}

export interface BrowserTab {
  id: number;
  active: boolean;
  url?: string;
}

export function createBrowserTab(tab: BrowserTab): BrowserTab {
  return tab;
}
