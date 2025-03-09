import { defer, Observable, of } from 'rxjs';
import { HtmlLoader } from './html-loader';
import { HtmlPage } from './html-page';

export class HtmlLoaderFake implements HtmlLoader {
  #pages: HtmlPage[] = [];

  loadHtml(url: string): Observable<HtmlPage | null> {
    return defer(() => {
      const page = this.#pages.find((p) => p.url === url) ?? null;
      return of(page);
    });
  }

  setPages(pages: HtmlPage[]) {
    this.#pages = pages;
  }
}
