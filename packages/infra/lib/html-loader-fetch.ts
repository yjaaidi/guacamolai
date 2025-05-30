import type { HtmlLoader, HtmlPage } from '@guacamolai/core';
import { createHtmlPage } from '@guacamolai/core';
import { map, Observable, switchMap, throwError } from 'rxjs';
import { fromFetch } from 'rxjs/fetch';

export class HtmlLoaderFetch implements HtmlLoader {
  loadHtml(url: string): Observable<HtmlPage> {
    console.debug(`Trying HTML loading with fetch: ${url}`);

    return fromFetch(url, {
      credentials: 'omit',
      mode: 'cors',
    }).pipe(
      switchMap((response) =>
        response.ok
          ? response.text()
          : throwError(() => new Error(`Failed to fetch URL: ${url}`))
      ),
      map((html) => {
        if (html == null) {
          throw new Error(`Empty response from URL: ${url}`);
        }

        return createHtmlPage({ url, html });
      })
    );
  }
}
