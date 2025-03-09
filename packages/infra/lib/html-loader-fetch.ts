import { HtmlLoader, HtmlPage } from '@guacamolai/core';
import { map, Observable, of, switchMap } from 'rxjs';
import { fromFetch } from 'rxjs/fetch';

export class HtmlLoaderFetch implements HtmlLoader {
  loadHtml(url: string): Observable<HtmlPage | null> {
    return fromFetch(url, {
      credentials: 'omit',
      mode: 'cors',
    }).pipe(
      switchMap((response) => (response.ok ? response.text() : of(null))),
      map((html) => (html != null ? { url, html } : null))
    );
  }
}
