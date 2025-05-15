import { defer, Observable, of } from 'rxjs';
import type { HtmlLoader } from './html-loader';
import type { HtmlPage } from './html-page';

export class HtmlLoaderFake implements HtmlLoader {
  #pages: HtmlPage[] = [];

  loadHtml(url: string): Observable<HtmlPage> {
    return defer(() => {
      const page = this.#pages.find((p) => p.url === url);

      if (!page) {
        throw new Error(`Page not found: ${url}`);
      }

      return of(page);
    });
  }

  setPages(pages: HtmlPage[]) {
    this.#pages = pages;
  }
}
