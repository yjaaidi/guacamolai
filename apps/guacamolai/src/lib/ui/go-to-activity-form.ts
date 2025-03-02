import { screen } from '@testing-library/dom';
import { Locator } from './dom';

export async function goToActivityForm() {
  await new Locator(() =>
    screen.getByRole('button', { name: 'Add new activity' })
  ).click();

  await new Locator(() => screen.getByText('New activity')).click();

  await new Locator(() =>
    screen.getByRole('heading', { name: 'Public speaking' })
  ).click();
}
