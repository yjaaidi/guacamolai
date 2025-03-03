import {
  firstValueFrom,
  lastValueFrom,
  Observable,
  switchMap,
  timer,
} from 'rxjs';
import { scrapPage } from './lib/domain/scrap-page';
import { Gemini } from './lib/infra/gemini';

chrome.runtime.onMessage.addListener((url, sender, sendResponse) => {
  handler(url, sendResponse);
  return true;
});

async function handler(url: string, sendResponse: any) {
  const tab = await chrome.tabs.create({ url });

  if (tab.id != null) {
    const [{ result: html }] = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: readBody,
    });
    await chrome.tabs.remove(tab.id);
    const { geminiApiKey } = await chrome.storage.local.get('geminiApiKey');
    const llm = new Gemini(geminiApiKey);
    const result = await lastValueFrom(
      scrapPage({ llm, page: { url, html: html! } })
    );
    console.log(result);
    sendResponse(result);
  }
}

async function readBody() {
  let timeout;

  return new Promise((resolve) => {
    const reschedule = () => {
      console.log('reschedule');
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
