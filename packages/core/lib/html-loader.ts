import { Observable } from 'rxjs';
import type { HtmlPage } from './html-page';

export interface HtmlLoader {
  loadHtml(url: string): Observable<HtmlPage>;
}
