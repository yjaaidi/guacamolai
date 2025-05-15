import type { HtmlLoader, HtmlPage } from '@guacamolai/core';
import { HtmlLoaderChromeTab } from './html-loader-chrome-tab';
import { HtmlLoaderFetch } from './html-loader-fetch';
import { catchError, Observable, throwError } from 'rxjs';

export class HtmlLoaderAggregate implements HtmlLoader {
  #loaders: HtmlLoader[] = [new HtmlLoaderChromeTab(), new HtmlLoaderFetch()];

  loadHtml(url: string): Observable<HtmlPage> {
    return (
      this.#loaders.reduce((acc, loader) => {
        if (acc == null) {
          return loader.loadHtml(url);
        } else {
          return acc.pipe(
            catchError((error) => {
              console.warn(`HTML loading error:`, error);
              return loader.loadHtml(url);
            })
          );
        }
      }, null as Observable<HtmlPage> | null) ??
      throwError(() => new Error(`No HTML loader available.`))
    );
  }
}
