import { lastValueFrom } from 'rxjs';
import { BrowserTabsFake } from './browser-tabs.fake';
import { HtmlLoaderChromeTab } from './html-loader-chrome-tab';

describe(HtmlLoaderChromeTab.name, () => {
  test('focuses on previous active tab after opening new tab and scrapping', async () => {
    const browserTabs = new BrowserTabsFake();
    browserTabs.setStubResult(
      'https://marmicode.io',
      '<html><body>Hello From Marmicode Tab</body></html>'
    );

    await browserTabs.createTab('https://gde.advocu.com');
    await browserTabs.createTab('https://marmico.de/test.ng');
    await browserTabs.activateTab(0);

    const htmlLoader = new HtmlLoaderChromeTab(browserTabs);

    await lastValueFrom(htmlLoader.loadHtml('https://marmicode.io'));

    expect(await browserTabs.getActiveTab()).toMatchObject({
      url: 'https://gde.advocu.com',
    });
  });
});
