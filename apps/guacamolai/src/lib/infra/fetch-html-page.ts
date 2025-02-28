import { Observable, switchMap, of, map } from 'rxjs';
import { fromFetch } from 'rxjs/fetch';

export function fetchHtmlPage(url: string): Observable<HtmlPage | null> {
  return fromFetch(`https://corsproxy.io/?url=${encodeURIComponent(url)}`, {
    credentials: 'omit',
    mode: 'cors',
  }).pipe(
    switchMap((response) => (response.ok ? response.text() : of(null))),
    map((html) => (html != null ? { url, html } : null))
  );
}
interface HtmlPage {
  url: string;
  html: string;
}
