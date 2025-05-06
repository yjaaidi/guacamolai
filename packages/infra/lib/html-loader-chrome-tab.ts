import { createHtmlPage, HtmlLoader, HtmlPage } from '@guacamolai/core';
import { defer, Observable } from 'rxjs';
import { BrowserTabs } from './browser-tabs';
import { BrowserTabsImpl } from './browser-tabs.impl';

export class HtmlLoaderChromeTab implements HtmlLoader {
  #browserTabs: BrowserTabs;

  constructor(browserTabs: BrowserTabs = new BrowserTabsImpl()) {
    this.#browserTabs = browserTabs;
  }

  loadHtml(url: string): Observable<HtmlPage> {
    return defer(async () => {
      console.debug(`Trying HTML loading with chrome tab: ${url}`);

      const lastActiveTab = await this.#browserTabs.getActiveTab();
      const tab = await this.#browserTabs.createTab(url);

      if (tab.id == null) {
        throw new Error(`Can't create tab for URL: ${url}`);
      }

      try {
        const html = await _executeWithTimeout({
          timeout: 5_000,
          promise: this.#browserTabs.executeScript(tab.id, _readBody),
        });

        if (typeof html !== 'string' || html == null) {
          throw new Error(`Received empty HTML from URL: ${url}`);
        }

        return createHtmlPage({ url, html });
      } catch (cause) {
        console.error(cause);
        throw new Error(`Can't extract HTML from URL: ${url}`, { cause });
      } finally {
        await this.#browserTabs.removeTab(tab.id);

        if (lastActiveTab?.id != null) {
          await this.#browserTabs.activateTab(lastActiveTab.id);
        }
      }
    });
  }
}

/**
 * Wait for app to stay stable for 1 second before returning the HTML.
 * Note the manual debounce as this code is injected as is without any dependencies.
 *
 * @returns The HTML of the current page.
 */
async function _readBody() {
  const debounceDelay = 1_000;

  return new Promise((resolve) => {
    let timeout: number;

    const reschedule = () => {
      clearTimeout(timeout);

      timeout = setTimeout(
        () => resolve(document.head.outerHTML + document.body.outerHTML),
        debounceDelay
      );
    };

    new MutationObserver(() => reschedule()).observe(document.body, {
      childList: true,
      subtree: true,
    });

    reschedule();
  });
}

async function _executeWithTimeout<RESULT>({
  promise,
  timeout,
}: {
  promise: Promise<RESULT>;
  timeout: number;
}): Promise<RESULT> {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(reject, timeout)),
  ]) as Promise<RESULT>;
}
