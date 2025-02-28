/* eslint-disable playwright/expect-expect */
import { authFilePath } from './testing/auth-user';
import { expect, test } from './testing/setup-fixtures';

test('authenticate', async ({ page, advocuCredentials }) => {
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
