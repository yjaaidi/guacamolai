import { Observable } from 'rxjs';
import { HtmlPage } from './html-page';

export interface HtmlLoader {
  loadHtml(url: string): Observable<HtmlPage>;
}
