import { expect, test } from './fixtures';

test('save gemini api key', async ({ goToExtensionPopup, page }) => {
  await goToExtensionPopup();

  await page.getByPlaceholder('Gemini API Key').fill('FAKE_KEY');

  await page.reload();

  await expect(page.getByPlaceholder('Gemini API Key')).toHaveValue('FAKE_KEY');
});
