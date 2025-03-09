import { createHtmlPage, HtmlLoader, HtmlPage } from '@guacamolai/core';
import { defer, Observable } from 'rxjs';

export class HtmlLoaderChromeTab implements HtmlLoader {
  loadHtml(url: string): Observable<HtmlPage | null> {
    return defer(async () => {
      const tab = await chrome.tabs.create({ url });
      if (tab.id == null) {
        return null;
      }

      const [{ result: html }] = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: _readBody,
      });
      return createHtmlPage({ url, html: html as string });
    });
  }
}

async function _readBody() {
  return new Promise((resolve) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let timeout: any;

    const reschedule = () => {
      clearTimeout(timeout);

      timeout = setTimeout(() => {
        resolve(document.head.outerHTML + document.body.outerHTML);
      }, 1_000);
    };

    new MutationObserver(() => reschedule()).observe(document.body, {
      childList: true,
      subtree: true,
    });
  });
}
