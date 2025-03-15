import { expect, test } from './testing/fixtures';

test('save gemini api key', async ({ goToExtensionPopup, page }) => {
  await goToExtensionPopup();

  await page.getByPlaceholder('Gemini API Key').fill('FAKE_KEY');

  await page.reload();

  await expect(page.getByPlaceholder('Gemini API Key')).toHaveValue('FAKE_KEY');
});

test('save speaker name', async ({ goToExtensionPopup, page }) => {
  await goToExtensionPopup();

  await page.getByPlaceholder('Speaker Name').fill('Younes Jaaidi');

  await page.reload();

  await expect(page.getByPlaceholder('Speaker Name')).toHaveValue(
    'Younes Jaaidi'
  );
});
