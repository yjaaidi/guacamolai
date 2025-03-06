import { stat } from 'node:fs/promises';
import { authFilePath } from './testing/auth-user';
import { expect, test } from './testing/setup-fixtures';
import { existsSync } from 'node:fs';

test('authenticate', async ({ page, advocuCredentials }) => {
  // eslint-disable-next-line playwright/no-skipped-test
  test.skip(await skipAuth(), 'Auth storage is still fresh, skip auth.');

  await page.addLocatorHandler(
    page.getByRole('button', { name: 'Close Stonly widget' }),
    (el) => el.click()
  );

  await page.goto('/');

  await page
    .getByRole('textbox', { name: 'Email' })
    .fill(advocuCredentials.email);

  await page
    .getByRole('textbox', { name: 'Password' })
    .fill(advocuCredentials.password);

  await page.getByRole('button', { name: 'Sign in' }).click();

  await expect(page.getByText('My activities')).toBeVisible();

  await page.context().storageState({ path: authFilePath });
});

async function skipAuth() {
  if (!existsSync(authFilePath)) {
    return false;
  }
  const { mtime } = await stat(authFilePath);
  return Date.now() - mtime.getTime() < 3_600_000;
}
