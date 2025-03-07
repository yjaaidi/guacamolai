export interface HtmlPage {
  url: string;
  html: string;
}

export function createHtmlPage(page: HtmlPage): HtmlPage {
  return page;
}
